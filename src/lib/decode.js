import { getModulesFromImageData, recoverMaskAndEclFromGrid } from './qr.js';

const DECODE_WIDTH = 960; // higher decode res improves module sampling for camera frames
const IMAGE_DECODE_WIDTH = 3000; // use high res for uploads to reduce sampling error on real photos

let jsQrPromise;

export async function decodeVideoFrame(video, canvas) {
  if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;

  if (!sourceWidth || !sourceHeight) {
    return null;
  }

  const width = Math.min(DECODE_WIDTH, sourceWidth);
  const height = Math.round((sourceHeight / sourceWidth) * width);

  return decodeDrawable(video, canvas, width, height);
}

export async function decodeImageFile(file) {
  const { image, close } = await loadImage(file);

  // First pass: detect at a sensible resolution (good balance for jsQR robustness)
  const detectW = Math.min(1600, image.width);
  const detectH = Math.round((image.height / image.width) * detectW);
  const detectCanvas = document.createElement('canvas');

  let result;
  try {
    result = await decodeDrawable(image, detectCanvas, detectW, detectH);
  } finally {
    // we may still need the original image for high-res sampling
  }

  if (!result || !result.location || !result.version) {
    close();
    return result;
  }

  // Second pass for accurate module sampling: use significantly higher resolution
  // when the source photo has it. This greatly reduces sampling error on module centers.
  const sampleW = Math.min(IMAGE_DECODE_WIDTH, image.width);
  const sampleH = Math.round((image.height / image.width) * sampleW);

  if (sampleW > detectW * 1.1) {
    const sampleCanvas = document.createElement('canvas');
    const sampleData = await (async () => {
      const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      sampleCanvas.width = sampleW;
      sampleCanvas.height = sampleH;
      ctx.drawImage(image, 0, 0, sampleW, sampleH);
      return ctx.getImageData(0, 0, sampleW, sampleH);
    })();

    // Scale the location corners from detect space to sample space
    const scaleX = sampleW / detectW;
    const scaleY = sampleH / detectH;

    const scaledLocation = {
      topLeftCorner: {
        x: result.location.topLeftCorner.x * scaleX,
        y: result.location.topLeftCorner.y * scaleY,
      },
      topRightCorner: {
        x: result.location.topRightCorner.x * scaleX,
        y: result.location.topRightCorner.y * scaleY,
      },
      bottomLeftCorner: {
        x: result.location.bottomLeftCorner.x * scaleX,
        y: result.location.bottomLeftCorner.y * scaleY,
      },
      bottomRightCorner: {
        x: result.location.bottomRightCorner.x * scaleX,
        y: result.location.bottomRightCorner.y * scaleY,
      },
    };

    try {
      const betterGrid = getModulesFromImageData(
        sampleData.data,
        sampleW,
        sampleH,
        scaledLocation,
        result.version,
      );
      if (betterGrid && betterGrid.length) {
        result.modulesGrid = betterGrid;
        // Re-apply recovery on the high-res grid and validate it so we only keep a faithful direct trace.
        try {
          const recovered = recoverMaskAndEclFromGrid(betterGrid);
          if (recovered) {
            result.maskPattern = recovered.maskPattern;
            result.errorCorrectionLevel = recovered.errorCorrectionLevel;
          }
        } catch {
          // keep prior recovery if any
        }
        // Quick validation for the high-res sample; drop only the grid on failure.
        try {
          const jsQR = await loadJsQr();
          const N = result.version * 4 + 17;
          const scale = 3;
          const q = 4;
          const testSize = (N + q * 2) * scale;
          const tcan = document.createElement('canvas');
          tcan.width = testSize;
          tcan.height = testSize;
          const tctx = tcan.getContext('2d', { willReadFrequently: true });
          tctx.fillStyle = '#fff';
          tctx.fillRect(0, 0, testSize, testSize);
          tctx.fillStyle = '#000';
          for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
              if (betterGrid[r][c]) tctx.fillRect((q + c) * scale, (q + r) * scale, scale, scale);
            }
          }
          const td = tctx.getImageData(0, 0, testSize, testSize);
          const rc = jsQR(td.data, testSize, testSize, { inversionAttempts: 'attemptBoth' });
          if (!rc || rc.data !== result.data) {
            delete result.modulesGrid;
          }
        } catch {
          delete result.modulesGrid;
        }
      }
    } catch {
      // keep the grid (and any recovery) we got from the detect pass
    }
  }

  close();
  return result;
}

async function decodeDrawable(source, canvas, width, height) {
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(source, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const jsQR = await loadJsQr();
  const result = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });

  if (result && result.location && result.version) {
    try {
      const grid = getModulesFromImageData(
        imageData.data,
        width,
        height,
        result.location,
        result.version,
      );
      if (grid && grid.length) {
        result.modulesGrid = grid;
      }
    } catch {
      // Swallow – fall back to generated QR using version + best-effort parameters.
    }
  }

  // Always attempt to recover mask/ECL from format info next to finders (works even on noisy samples).
  // Keep recovered values for generator fallback; only drop modulesGrid itself on validation failure.
  if (result?.modulesGrid) {
    try {
      const recovered = recoverMaskAndEclFromGrid(result.modulesGrid);
      if (recovered) {
        result.maskPattern = recovered.maskPattern;
        result.errorCorrectionLevel = recovered.errorCorrectionLevel;
      }
    } catch {
      // ignore recovery errors
    }
  }

  // Validation for direct module trace: render the sampled grid and re-decode with jsQR.
  // Only keep modulesGrid (for max fidelity) when the rendered version decodes to the original payload.
  // Recovered mask/ECL (if any) are retained for a hybrid generator recast using photo parameters.
  if (result?.modulesGrid) {
    try {
      const N = result.version * 4 + 17;
      const scale = 3;
      const q = 4; // match standard quiet zone used for direct trace exports
      const testSize = (N + q * 2) * scale;
      const testCanvas = document.createElement('canvas');
      testCanvas.width = testSize;
      testCanvas.height = testSize;
      const tctx = testCanvas.getContext('2d', { willReadFrequently: true });
      tctx.fillStyle = '#fff';
      tctx.fillRect(0, 0, testSize, testSize);
      tctx.fillStyle = '#000';

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (result.modulesGrid[r][c]) {
            tctx.fillRect((q + c) * scale, (q + r) * scale, scale, scale);
          }
        }
      }

      const testImageData = tctx.getImageData(0, 0, testSize, testSize);
      const reCheck = jsQR(testImageData.data, testSize, testSize, {
        inversionAttempts: 'attemptBoth',
      });
      if (!reCheck || reCheck.data !== result.data) {
        delete result.modulesGrid; // fall back to generator (with recovered mask if present)
      }
    } catch {
      delete result.modulesGrid;
    }
  }

  return result;
}

async function loadJsQr() {
  jsQrPromise ??= import('jsqr').then((module) => module.default);
  return jsQrPromise;
}

async function loadImage(file) {
  if ('createImageBitmap' in globalThis) {
    const image = await createImageBitmap(file);
    return {
      image,
      close: () => image.close(),
    };
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();

  return {
    image,
    close: () => URL.revokeObjectURL(url),
  };
}
