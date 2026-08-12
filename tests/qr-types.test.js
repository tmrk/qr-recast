import { describe, expect, it } from 'vitest';
import { qrTypeFixtures } from '../src/lib/qr-types/fixtures.js';
import { detectQrType, payloadKindFromQrType } from '../src/lib/qr-types/index.js';

describe('QR type detector registry', () => {
  it.each(qrTypeFixtures)('classifies $name', (fixture) => {
    const result = detectQrType(fixture.payload);

    expect(result).toMatchObject({
      raw: fixture.payload,
      type: fixture.type,
    });
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.fields.map((field) => field.key)).toEqual(
      expect.arrayContaining(fixture.fieldKeys),
    );

    for (const [key, value] of Object.entries(fixture.expectedFields ?? {})) {
      expect(result.fields.find((field) => field.key === key)?.value).toBe(value);
    }
  });

  it.each(['', 'not a URI', 'WIFI:;', 'MT:???', 'mailto:%', '\0\0\0'])(
    'fails soft for arbitrary input %#',
    (payload) => {
      expect(() => detectQrType(payload)).not.toThrow();
      expect(detectQrType(payload)).toMatchObject({ raw: payload });
    },
  );

  it('uses the plain-text fallback without inventing structured values', () => {
    const payload = 'A short, ordinary note.';
    const result = detectQrType(payload);

    expect(result.type).toBe('plain-text');
    expect(result.fields).toEqual([
      expect.objectContaining({ key: 'textLength', value: String(payload.length) }),
    ]);
    expect(payloadKindFromQrType(result)).toBe('text');
  });
});
