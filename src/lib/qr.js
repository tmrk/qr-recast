export const SHARE_URL_MAX_LENGTH = 2000;

export async function createQrSvg(text) {
  const { default: QRCode } = await import('qrcode');

  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
  });
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
