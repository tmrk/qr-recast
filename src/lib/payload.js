import { detectQrType, extractUrlFromQrType, payloadKindFromQrType } from './qr-types/index.js';

export function detectPayloadKind(text) {
  return payloadKindFromQrType(detectQrType(text));
}

export function extractPayloadUrl(text) {
  return extractUrlFromQrType(detectQrType(text));
}
