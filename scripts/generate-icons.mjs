import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourcePath = path.join(root, 'public', 'qr-recast-mark.svg');
const outputDirectory = path.join(root, 'public', 'icons');

const icons = [
  ['icon-192.png', 192],
  ['icon-384.png', 384],
  ['icon-512.png', 512],
  ['maskable-icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];

try {
  const source = await readFile(sourcePath);
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(
    icons.map(([fileName, size]) =>
      sharp(source)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 118, b: 110, alpha: 1 },
        })
        .png()
        .toFile(path.join(outputDirectory, fileName)),
    ),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
