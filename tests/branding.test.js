import jsQR from 'jsqr';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDecoratedQrSvg } from '../src/features/branding/decorator.js';
import { detectQrType } from '../src/lib/qr-types/index.js';
import { createQrSvg } from '../src/lib/qr.js';

const quietZoneModules = 4;
let originalDomParser;
let originalXmlSerializer;

beforeAll(() => {
  originalDomParser = globalThis.DOMParser;
  originalXmlSerializer = globalThis.XMLSerializer;

  globalThis.DOMParser = class DOMParserStub {
    parseFromString(svgString) {
      const openingTag = svgString.match(/<svg\b([^>]*)>/);
      const closingTagIndex = svgString.lastIndexOf('</svg>');
      const attributes = openingTag ? readAttributes(openingTag[1]) : {};
      const innerMarkup = openingTag
        ? svgString.slice(openingTag.index + openingTag[0].length, closingTagIndex)
        : '';

      return {
        documentElement: {
          childNodes: [{ markup: innerMarkup }],
          getAttribute: (name) => attributes[name] ?? null,
        },
        querySelector: () => null,
      };
    }
  };

  globalThis.XMLSerializer = class XMLSerializerStub {
    serializeToString(node) {
      return node.markup;
    }
  };
});

afterAll(() => {
  globalThis.DOMParser = originalDomParser;
  globalThis.XMLSerializer = originalXmlSerializer;
});

describe('QR branding registration columns', () => {
  it('aligns the Matter logo and manual code to the visible QR module field', async () => {
    const payload = 'MT:OA3126F-034OCH6VQ00';
    const svg = await createBrandedSvg(payload);
    const qr = findElement(
      svg,
      'svg',
      (attributes) => attributes['shape-rendering'] === 'crispEdges',
    );
    const logo = findElement(
      svg,
      'svg',
      (attributes) => attributes.viewBox === '0 0 337.063 72.644',
    );
    const code = findElement(svg, 'text', (attributes) => attributes.y === '386');
    const registration = getVisibleQrRegistration(qr);

    expect(Number(logo.x)).toBeCloseTo(registration.x, 3);
    expect(Number(logo.width)).toBeCloseTo(registration.size, 3);
    expect(Number(code['data-registration-x'])).toBeCloseTo(registration.x, 3);
    expect(Number(code['data-registration-width'])).toBeCloseTo(registration.size, 3);
    expect(Number(code.x)).toBeCloseTo(registration.x + registration.size / 2, 3);
    expect(code['text-anchor']).toBe('middle');
    expect(Number(code.textLength)).toBeCloseTo(registration.size, 3);
    expect(code.lengthAdjust).toBe('spacing');
    expect(code['font-family']).toBe('Arial, Helvetica, sans-serif');
    expect(code['font-weight']).toBe('normal');
    expect(findElements(svg, 'tspan')).toHaveLength(0);
    expect(svg).toContain('>2590-602-0391</text>');
    await expect(decodeSvg(svg)).resolves.toBe(payload);
  });

  it('keeps the Apple Home header within the visible QR registration column', async () => {
    const payload = 'X-HM://0081YCYEP3QYT';
    const svg = await createBrandedSvg(payload);
    const qr = findElement(
      svg,
      'svg',
      (attributes) => attributes['shape-rendering'] === 'crispEdges',
    );
    const logo = findElement(svg, 'svg', (attributes) => attributes.viewBox === '71 58 371 359');
    const codeLines = findElements(svg, 'text').filter(
      (attributes) => attributes['data-registration-width'],
    );
    const registration = getVisibleQrRegistration(qr);

    expect(Number(logo.x)).toBeCloseTo(registration.x, 3);
    expect(codeLines).toHaveLength(2);

    for (const line of codeLines) {
      expect(
        Number(line['data-registration-x']) + Number(line['data-registration-width']),
      ).toBeCloseTo(registration.x + registration.size, 2);
    }

    await expect(decodeSvg(svg)).resolves.toBe(payload);
  });

  it('anchors utility headings and captions to the visible QR column', async () => {
    const payload = 'WIFI:T:WPA;S:Kitchen Wi-Fi;P:s3cret\\;value;H:true;;';
    const svg = await createBrandedSvg(payload);
    const qr = findElement(
      svg,
      'svg',
      (attributes) => attributes['shape-rendering'] === 'crispEdges',
    );
    const iconTile = findElement(
      svg,
      'rect',
      (attributes) => attributes.y === '28' && attributes.width === '40',
    );
    const caption = findElement(svg, 'text', (attributes) => attributes['font-size'] === '15');
    const registration = getVisibleQrRegistration(qr);

    expect(Number(iconTile.x)).toBeCloseTo(registration.x, 3);
    expect(Number(caption.x)).toBeCloseTo(registration.x, 3);
    await expect(decodeSvg(svg)).resolves.toBe(payload);
  });
});

async function createBrandedSvg(payload) {
  const canonicalSvg = await createQrSvg(payload);

  return createDecoratedQrSvg(canonicalSvg, detectQrType(payload));
}

function findElement(svg, tagName, predicate) {
  const match = findElements(svg, tagName).find(predicate);

  expect(match).toBeDefined();

  return match;
}

function findElements(svg, tagName) {
  return Array.from(svg.matchAll(new RegExp(`<${tagName}\\b([^>]*)>`, 'g')), (match) =>
    readAttributes(match[1]),
  );
}

function readAttributes(markup) {
  return Object.fromEntries(
    Array.from(markup.matchAll(/([\w:-]+)="([^"]*)"/g), (match) => [match[1], match[2]]),
  );
}

function getVisibleQrRegistration(qr) {
  const [, , viewBoxWidth] = qr.viewBox.split(/[\s,]+/).map(Number);
  const quietZone = (quietZoneModules / viewBoxWidth) * Number(qr.width);

  return {
    size: Number(qr.width) - quietZone * 2,
    x: Number(qr.x) + quietZone,
  };
}

async function decodeSvg(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize({ kernel: 'nearest', width: 768 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const result = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
    inversionAttempts: 'attemptBoth',
  });

  return result?.data ?? '';
}
