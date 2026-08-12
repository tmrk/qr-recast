import { describe, expect, it } from 'vitest';
import { decodePayloadFromShareUrl, encodePayloadForShareUrl } from '../src/lib/qr.js';

describe('share payload compression', () => {
  it.each([
    '',
    'https://example.com/path?query=one&other=two#section',
    'WIFI:T:WPA;S:Kitchen Wi-Fi;P:s3cret\\;value;H:true;;',
    'Unicode survives: Hej, café, こんにちは, 🔒',
    'A'.repeat(4_096),
  ])('round-trips payload %# losslessly', async (payload) => {
    const encoded = await encodePayloadForShareUrl(payload);

    expect(await decodePayloadFromShareUrl(encoded)).toBe(payload);
  });

  it('fails soft for malformed compressed input', async () => {
    await expect(decodePayloadFromShareUrl('%not-valid-compressed-data')).resolves.toBe('');
  });
});
