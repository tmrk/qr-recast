import jsQR from 'jsqr';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { createQrSvg } from '../src/lib/qr.js';

describe('canonical QR generation', () => {
  it.each([
    { expectedSize: 29, version: 1 },
    { expectedSize: 45, version: 5 },
    { expectedSize: 65, version: 10 },
  ])(
    'honours forced version $version with a four-module quiet zone',
    async ({ expectedSize, version }) => {
      const svg = await createQrSvg({ text: 'HELLO', version });

      expect(readViewBoxSize(svg)).toBe(expectedSize);
      expect(svg).toContain('shape-rendering="crispEdges"');
      expect(svg).not.toContain('stroke=');
      await expect(decodeSvg(svg)).resolves.toBe('HELLO');
    },
  );

  it('falls back to a larger valid symbol when a forced version cannot hold the payload', async () => {
    const payload = 'A payload that does not fit inside a version one QR symbol.';
    const svg = await createQrSvg({ text: payload, version: 1 });

    expect(readViewBoxSize(svg)).toBeGreaterThan(29);
    await expect(decodeSvg(svg)).resolves.toBe(payload);
  });

  it('QR-encodes text containing SVG markup instead of passing it through as artwork', async () => {
    const payload = '<svg/onload=alert(1)>';
    const svg = await createQrSvg(payload);

    expect(svg).not.toBe(payload);
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).not.toContain('onload');
    await expect(decodeSvg(svg)).resolves.toBe(payload);
  });
});

function readViewBoxSize(svg) {
  const match = svg.match(/viewBox="0 0 (\d+) (\d+)"/);

  expect(match).not.toBeNull();
  expect(match[1]).toBe(match[2]);

  return Number(match[1]);
}

async function decodeSvg(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(768, 768, { fit: 'fill', kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const result = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
    inversionAttempts: 'attemptBoth',
  });

  return result?.data ?? '';
}
