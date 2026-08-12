import { describe, expect, it } from 'vitest';
import { formatMatterManualCode, parseMatterQrPayload } from '../src/lib/qr-types/matter.js';

describe('Matter onboarding payloads', () => {
  it.each([
    {
      manualCode: '34970112332',
      payload: 'MT:Y.K9042C00KA0648G00',
      pincode: 20202021,
    },
    {
      manualCode: '25906020391',
      payload: 'MT:OA3126F-034OCH6VQ00',
      pincode: 33416884,
    },
  ])('derives the printed manual code from $payload', ({ manualCode, payload, pincode }) => {
    expect(parseMatterQrPayload(payload)).toMatchObject({
      discovery: 2,
      flow: 0,
      manualCode,
      pincode,
      version: 0,
    });
  });

  it.each(['', 'MT:', 'MT:???', 'MT:0', 'https://example.com'])(
    'rejects malformed payload %#',
    (payload) => {
      expect(parseMatterQrPayload(payload)).toBeNull();
    },
  );

  it('formats standard and vendor-specific manual codes', () => {
    expect(formatMatterManualCode('25906020391')).toBe('2590-602-0391');
    expect(formatMatterManualCode('123456789012345678901')).toBe('1234-567-8901-23456-78901');
  });

  it('normalises separators without inventing missing digits', () => {
    expect(formatMatterManualCode('2590 602-0391')).toBe('2590-602-0391');
    expect(formatMatterManualCode('12345')).toBe('12345');
  });
});
