export const SHARE_URL_MAX_LENGTH = 2000;

export async function createQrSvg(input) {
  // If an exact module-traced SVG (produced from a real photograph) is supplied, return it as-is.
  // This is how we achieve a true 1:1 recast of the photographed QR.
  if (typeof input === 'string' && /<svg/i.test(input)) {
    return input;
  }

  const { default: QRCode } = await import('qrcode');

  const isRich =
    input != null &&
    typeof input === 'object' &&
    Object.prototype.hasOwnProperty.call(input, 'text');
  const text = isRich ? input.text || '' : input || '';
  const version = isRich ? input.version : undefined;
  const chunks = isRich ? input.chunks : undefined;
  const modulesGrid = isRich ? input.modulesGrid : undefined;

  const baseOpts = {
    type: 'svg',
    margin: 2,
  };

  const hasForcedVersion = Number.isInteger(version) && version >= 1 && version <= 40;

  if (hasForcedVersion && Array.isArray(modulesGrid) && modulesGrid.length === version * 4 + 17) {
    // Photographed QR: choose the ECL + mask that produces a matrix visually closest to the photo,
    // while forcing the exact version. This yields the closest possible crisp, scannable recast.
    return await createMatchingSvg(text, version, modulesGrid);
  }

  if (!hasForcedVersion) {
    return QRCode.toString(text, {
      ...baseOpts,
      errorCorrectionLevel: 'M',
    });
  }

  // Scanned QR: force the original version to preserve data size (matrix size).
  // Use chunks (when available) to keep the original encoding modes/segments.
  let data = text;
  if (Array.isArray(chunks) && chunks.length > 0) {
    data = chunks.map((chunk) => {
      let segmentData = chunk && typeof chunk.text === 'string' ? chunk.text : '';
      if (!segmentData && Array.isArray(chunk && chunk.bytes)) {
        try {
          segmentData = new TextDecoder().decode(Uint8Array.from(chunk.bytes));
        } catch {
          segmentData = '';
        }
      }
      return { data: segmentData, mode: chunk && chunk.type };
    });
  }

  // Try ECLs to keep the forced version. Prefer M (previous default), fall back to L to guarantee capacity.
  const candidateEcls = ['M', 'L', 'Q', 'H'];
  for (const ecl of candidateEcls) {
    try {
      return await QRCode.toString(data, {
        ...baseOpts,
        errorCorrectionLevel: ecl,
        version,
      });
    } catch {
      // try next ECL
    }
  }

  // Last resort: do not increase size if we can avoid it; fall back with L on plain text.
  try {
    return await QRCode.toString(text, {
      ...baseOpts,
      errorCorrectionLevel: 'L',
      version,
    });
  } catch {
    // Unlikely: generate unconstrained (may pick larger version).
    return QRCode.toString(text, {
      ...baseOpts,
      errorCorrectionLevel: 'M',
    });
  }
}

export function getModulesFromImageData(imageData, width, height, location, version) {
  if (!imageData || !location || typeof version !== 'number' || version < 1) {
    return null;
  }

  const modules = version * 4 + 17;
  const grid = [];

  const {
    topLeftCorner: tl,
    topRightCorner: tr,
    bottomLeftCorner: bl,
    bottomRightCorner: br,
  } = location;

  for (let r = 0; r < modules; r++) {
    const row = [];
    for (let c = 0; c < modules; c++) {
      // Sample near the center of the logical module using bilinear map of the detected corners.
      // Using the exact centre gives the value the decoder primarily relied on.
      const u = (c + 0.5) / modules;
      const v = (r + 0.5) / modules;

      const x = (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + (1 - u) * v * bl.x + u * v * br.x;
      const y = (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + (1 - u) * v * bl.y + u * v * br.y;

      const ix = Math.max(0, Math.min(width - 1, Math.round(x)));
      const iy = Math.max(0, Math.min(height - 1, Math.round(y)));

      const idx = (iy * width + ix) * 4;
      const rVal = imageData[idx];
      const gVal = imageData[idx + 1];
      const bVal = imageData[idx + 2];
      const lum = (rVal * 299 + gVal * 587 + bVal * 114) / 1000;

      // QR printed modules are distinctly dark vs the substrate. Slightly permissive threshold.
      row.push(lum < 160);
    }
    grid.push(row);
  }

  return grid;
}

export function createQrSvgFromModules(grid, quietZone = 2) {
  if (!Array.isArray(grid) || grid.length === 0) return '';
  const modules = grid.length;
  const size = modules + quietZone * 2;

  let black = '';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        const x = quietZone + c;
        const y = quietZone + r;
        black += `M${x} ${y}h1v1h-1Z`;
      }
    }
  }

  const white = `M0 0h${size}v${size}H0Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="#ffffff" d="${white}"/><path fill="#000000" d="${black}"/></svg>`;
}

/**
 * Brute-forces ECL and mask to find the combination that, for the forced version,
 * produces a QR matrix with the lowest Hamming distance to the modules observed in the photo.
 * Returns an SVG generated with those parameters (guaranteed valid + scannable, same size, close appearance).
 */
async function createMatchingSvg(text, version, observedGrid) {
  const { default: QRCode } = await import('qrcode');
  const ecls = ['L', 'M', 'Q', 'H'];
  const masks = [0, 1, 2, 3, 4, 5, 6, 7];

  let best = null;
  let bestDiff = Infinity;

  const N = version * 4 + 17;

  for (const ecl of ecls) {
    for (const mp of masks) {
      try {
        const qr = QRCode.create(text, {
          version,
          errorCorrectionLevel: ecl,
          maskPattern: mp,
        });
        if (qr.modules.size !== N) continue;

        let diff = 0;
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const gen = qr.modules.get(x, y);
            const obs = !!observedGrid[y][x];
            if (gen !== obs) diff++;
          }
        }
        if (diff < bestDiff) {
          bestDiff = diff;
          best = { ecl, maskPattern: mp };
        }
      } catch {
        // combination does not fit the data in this version – skip
      }
    }
  }

  const opts = {
    type: 'svg',
    margin: 2,
    version,
  };
  if (best) {
    opts.errorCorrectionLevel = best.ecl;
    opts.maskPattern = best.maskPattern;
  } else {
    opts.errorCorrectionLevel = 'L';
  }

  return QRCode.toString(text, opts);
}

export function svgToBlob(svgString) {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

export async function svgToPngBlob(svgString, size = 1024) {
  const image = new Image();
  const url = URL.createObjectURL(svgToBlob(svgString));
  const svgDimensions = getSvgDimensions(svgString);
  const rasterDimensions = getRasterDimensions(svgDimensions, size);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable.');
    }

    canvas.width = rasterDimensions.width;
    canvas.height = rasterDimensions.height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('PNG export failed.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function getSvgDimensions(svgString) {
  if (typeof DOMParser === 'undefined') {
    return { height: 1, width: 1 };
  }

  const document = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const svgElement = document.documentElement;
  const viewBox = svgElement.getAttribute('viewBox')?.trim();

  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(Number);

    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { height, width };
    }
  }

  const width = parseFloat(svgElement.getAttribute('width'));
  const height = parseFloat(svgElement.getAttribute('height'));

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { height, width };
  }

  return { height: 1, width: 1 };
}

export async function hashTextPrefix(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 8);
}

export async function encodePayloadForShareUrl(text) {
  const { default: lzString } = await import('lz-string');

  return lzString.compressToEncodedURIComponent(text);
}

export async function decodePayloadFromShareUrl(encodedText) {
  const { default: lzString } = await import('lz-string');
  const decodedText = lzString.decompressFromEncodedURIComponent(encodedText);

  return typeof decodedText === 'string' ? decodedText : '';
}

export async function buildShareUrl(text) {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  baseUrl.searchParams.set('q', await encodePayloadForShareUrl(text));

  return baseUrl.toString();
}

function getRasterDimensions({ height, width }, longEdge) {
  if (!Number.isFinite(height) || !Number.isFinite(width) || height <= 0 || width <= 0) {
    return { height: longEdge, width: longEdge };
  }

  if (Math.abs(width - height) < 0.1) {
    return { height: longEdge, width: longEdge };
  }

  if (width > height) {
    return {
      height: Math.max(1, Math.round((longEdge * height) / width)),
      width: longEdge,
    };
  }

  return {
    height: longEdge,
    width: Math.max(1, Math.round((longEdge * width) / height)),
  };
}
