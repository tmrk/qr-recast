export const SHARE_URL_MAX_LENGTH = 2000;
export const SHARE_FRAGMENT_KEY = 'q';

function createGeneratedQrSvg(QRCode, data, options) {
  const qr = QRCode.create(data, options);
  const { size, data: modules } = qr.modules;
  const grid = Array.from({ length: size }, (_value, row) =>
    Array.from({ length: size }, (_cell, column) => Boolean(modules[row * size + column])),
  );

  return createQrSvgFromModules(grid, 4);
}

export async function createQrSvg(input) {
  const { default: QRCode } = await import('qrcode');

  const isRich =
    input != null &&
    typeof input === 'object' &&
    Object.prototype.hasOwnProperty.call(input, 'text');
  const text = isRich ? input.text || '' : input || '';
  const version = isRich ? input.version : undefined;
  const chunks = isRich ? input.chunks : undefined;
  const modulesGrid = isRich ? input.modulesGrid : undefined;
  const maskPattern = isRich ? input.maskPattern : undefined;
  const inputEcl = isRich ? input.errorCorrectionLevel : undefined;

  const hasForcedVersion = Number.isInteger(version) && version >= 1 && version <= 40;

  if (Array.isArray(modulesGrid) && modulesGrid.length > 0) {
    // Photographed QR: directly output the modules we sampled from the photo.
    // This is the true "recast" of what the camera saw — same pattern, same size.
    // (The generator path is only used for synthetic payloads like share URLs.)
    return createQrSvgFromModules(modulesGrid, 4);
  }

  if (!hasForcedVersion) {
    return createGeneratedQrSvg(QRCode, text, {
      errorCorrectionLevel: 'M',
    });
  }

  // Scanned QR: force the original version to preserve data size (matrix size).
  // Use chunks (when available) to keep the original encoding modes/segments.
  // If maskPattern or errorCorrectionLevel were recovered from the photo, prefer them.
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

  const hasMask = Number.isInteger(maskPattern) && maskPattern >= 0 && maskPattern <= 7;
  const preferredEcl = inputEcl && ['L', 'M', 'Q', 'H'].includes(inputEcl) ? inputEcl : null;

  // Build candidate ECL order preferring any recovered value, then M/L to guarantee capacity at forced version.
  const candidateEcls = preferredEcl
    ? [preferredEcl, ...['M', 'L', 'Q', 'H'].filter((e) => e !== preferredEcl)]
    : ['M', 'L', 'Q', 'H'];

  for (const ecl of candidateEcls) {
    try {
      const opts = { errorCorrectionLevel: ecl, version };
      if (hasMask) opts.maskPattern = maskPattern;
      return createGeneratedQrSvg(QRCode, data, opts);
    } catch {
      // try next ECL
    }
  }

  // Last resort: do not increase size if we can avoid it; fall back with L on plain text.
  try {
    const opts = { errorCorrectionLevel: 'L', version };
    if (hasMask) opts.maskPattern = maskPattern;
    return createGeneratedQrSvg(QRCode, text, opts);
  } catch {
    // Unlikely: generate unconstrained (may pick larger version).
    return createGeneratedQrSvg(QRCode, text, {
      errorCorrectionLevel: 'M',
    });
  }
}

// Sub-pixel luminance sampler using bilinear interpolation for more accurate per-module decisions.
function sampleLuminance(imageData, width, height, fx, fy) {
  const x = Math.max(0, Math.min(width - 1, fx));
  const y = Math.max(0, Math.min(height - 1, fy));
  const x0 = Math.floor(x);
  const x1 = Math.min(width - 1, x0 + 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(height - 1, y0 + 1);
  const dx = x - x0;
  const dy = y - y0;

  const getLum = (ix, iy) => {
    const i = (iy * width + ix) * 4;
    return (imageData[i] * 299 + imageData[i + 1] * 587 + imageData[i + 2] * 114) / 1000;
  };

  const l00 = getLum(x0, y0);
  const l10 = getLum(x1, y0);
  const l01 = getLum(x0, y1);
  const l11 = getLum(x1, y1);

  return l00 * (1 - dx) * (1 - dy) + l10 * dx * (1 - dy) + l01 * (1 - dx) * dy + l11 * dx * dy;
}

// Compute a robust global threshold from finder regions (dark centres and light surrounds).
// Uses averages rather than extremes and samples additional points inside the finders.
function computeThreshold(imageData, width, height, tl, tr, bl, br, modules) {
  const darkSamples = [];
  const lightSamples = [];
  // More finder-based refs: dark block centres + light "cross" and separator areas inside finders.
  const darkRefs = [
    [3.0 / modules, 3.0 / modules],
    [4.0 / modules, 3.0 / modules],
    [3.0 / modules, 4.0 / modules],
    [(modules - 4.0) / modules, 3.0 / modules],
    [(modules - 3.0) / modules, 3.0 / modules],
    [(modules - 3.0) / modules, 4.0 / modules],
    [3.0 / modules, (modules - 4.0) / modules],
    [3.0 / modules, (modules - 3.0) / modules],
    [4.0 / modules, (modules - 3.0) / modules],
  ];
  const lightRefs = [
    [1.5 / modules, 3.0 / modules],
    [3.0 / modules, 1.5 / modules],
    [1.5 / modules, (modules - 3.0) / modules],
    [(modules - 3.0) / modules, 1.5 / modules],
    [5.5 / modules, 5.5 / modules],
    [(modules - 5.5) / modules, 5.5 / modules],
    [5.5 / modules, (modules - 5.5) / modules],
  ];

  for (const [u, v] of darkRefs) {
    const x = (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + (1 - u) * v * bl.x + u * v * br.x;
    const y = (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + (1 - u) * v * bl.y + u * v * br.y;
    darkSamples.push(sampleLuminance(imageData, width, height, x, y));
  }
  for (const [u, v] of lightRefs) {
    const x = (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + (1 - u) * v * bl.x + u * v * br.x;
    const y = (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + (1 - u) * v * bl.y + u * v * br.y;
    lightSamples.push(sampleLuminance(imageData, width, height, x, y));
  }

  const darkAvg = darkSamples.reduce((a, b) => a + b, 0) / darkSamples.length;
  const lightAvg = lightSamples.reduce((a, b) => a + b, 0) / lightSamples.length;
  // Slightly conservative for typical print/camera contrast; still adapts to lighting.
  return darkAvg * 0.58 + lightAvg * 0.42;
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

  const threshold = computeThreshold(imageData, width, height, tl, tr, bl, br, modules);

  for (let r = 0; r < modules; r++) {
    const row = [];
    for (let c = 0; c < modules; c++) {
      // 7x7 samples inside the nominal module cell for robust voting under noise/glare.
      let blackVotes = 0;
      const subs = 7;
      for (let sy = 0; sy < subs; sy++) {
        for (let sx = 0; sx < subs; sx++) {
          const u = (c + (sx + 0.5) / subs) / modules;
          const v = (r + (sy + 0.5) / subs) / modules;

          const x =
            (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + (1 - u) * v * bl.x + u * v * br.x;
          const y =
            (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + (1 - u) * v * bl.y + u * v * br.y;

          const lum = sampleLuminance(imageData, width, height, x, y);
          if (lum < threshold) blackVotes++;
        }
      }
      row.push(blackVotes > (subs * subs) / 2);
    }
    grid.push(row);
  }

  return grid;
}

// Format information 15-bit codewords for each (ECL, maskPattern) pair.
// These are the values stored in the QR matrix (after masking with 0x5412).
// Used to recover the original mask and ECL from a sampled grid even when noisy.
const FORMAT_INFO_TABLE = [
  { code15: 30660, ecl: 'L', mask: 0 },
  { code15: 29427, ecl: 'L', mask: 1 },
  { code15: 32170, ecl: 'L', mask: 2 },
  { code15: 30877, ecl: 'L', mask: 3 },
  { code15: 26159, ecl: 'L', mask: 4 },
  { code15: 25368, ecl: 'L', mask: 5 },
  { code15: 27713, ecl: 'L', mask: 6 },
  { code15: 26998, ecl: 'L', mask: 7 },
  { code15: 21522, ecl: 'M', mask: 0 },
  { code15: 20773, ecl: 'M', mask: 1 },
  { code15: 24188, ecl: 'M', mask: 2 },
  { code15: 23371, ecl: 'M', mask: 3 },
  { code15: 17913, ecl: 'M', mask: 4 },
  { code15: 16590, ecl: 'M', mask: 5 },
  { code15: 20375, ecl: 'M', mask: 6 },
  { code15: 19104, ecl: 'M', mask: 7 },
  { code15: 13663, ecl: 'Q', mask: 0 },
  { code15: 12392, ecl: 'Q', mask: 1 },
  { code15: 16177, ecl: 'Q', mask: 2 },
  { code15: 14854, ecl: 'Q', mask: 3 },
  { code15: 9396, ecl: 'Q', mask: 4 },
  { code15: 8579, ecl: 'Q', mask: 5 },
  { code15: 11994, ecl: 'Q', mask: 6 },
  { code15: 11245, ecl: 'Q', mask: 7 },
  { code15: 5769, ecl: 'H', mask: 0 },
  { code15: 5054, ecl: 'H', mask: 1 },
  { code15: 7399, ecl: 'H', mask: 2 },
  { code15: 6608, ecl: 'H', mask: 3 },
  { code15: 1890, ecl: 'H', mask: 4 },
  { code15: 597, ecl: 'H', mask: 5 },
  { code15: 3340, ecl: 'H', mask: 6 },
  { code15: 2107, ecl: 'H', mask: 7 },
];

function hamming(a, b) {
  let dist = 0;
  let x = a ^ b;
  while (x) {
    dist += x & 1;
    x >>>= 1;
  }
  return dist;
}

// Attempt to recover the mask pattern and ECL used in the photographed code by reading
// the format information bits adjacent to the top-left finder and finding the closest
// matching codeword. Tolerates a few bit errors thanks to the BCH protection in format info.
// Returns null when the area is too corrupted to decide reliably.
export function recoverMaskAndEclFromGrid(grid) {
  if (!Array.isArray(grid) || grid.length === 0) return null;
  const N = grid.length;
  // Format info positions around the top-left finder (always present for v >= 1).
  // Order yields the 15-bit codeword as stored in the matrix.
  const positions = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  let bits = 0;
  for (const [r, c] of positions) {
    if (r < N && c < N) {
      bits = (bits << 1) | (grid[r][c] ? 1 : 0);
    } else {
      bits <<= 1;
    }
  }

  let bestDist = 16;
  let best = null;
  for (const entry of FORMAT_INFO_TABLE) {
    const dist = hamming(bits, entry.code15);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }

  if (!best || bestDist > 4) return null;
  return { maskPattern: best.mask, errorCorrectionLevel: best.ecl };
}

export function createQrSvgFromModules(grid, quietZone = 4) {
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
  const fragment = new URLSearchParams();

  fragment.set(SHARE_FRAGMENT_KEY, await encodePayloadForShareUrl(text));
  baseUrl.hash = fragment.toString();

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
