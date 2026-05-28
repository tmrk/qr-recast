const DECODE_WIDTH = 640;
const IMAGE_DECODE_WIDTH = 1200;

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
  const canvas = document.createElement('canvas');
  const width = Math.min(IMAGE_DECODE_WIDTH, image.width);
  const height = Math.round((image.height / image.width) * width);

  try {
    return decodeDrawable(image, canvas, width, height);
  } finally {
    close();
  }
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
  return jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });
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
