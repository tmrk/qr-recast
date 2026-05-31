import { createPlainTextResult, detectors } from './detectors.js';

const payloadKindByType = Object.freeze({
  'app-link': 'app',
  calendar: 'calendar',
  contact: 'vcard',
  crypto: 'crypto',
  email: 'email',
  geo: 'geo',
  homekit: 'homekit',
  matter: 'matter',
  'plain-text': 'text',
  sms: 'sms',
  tel: 'phone',
  url: 'url',
  wifi: 'wifi',
});

export function detectQrType(text) {
  const raw = String(text ?? '');
  const results = [];

  for (const detector of detectors) {
    try {
      const result = detector(raw);

      if (result) {
        results.push({ ...result, raw });
      }
    } catch {
      results.push(null);
    }
  }

  return (
    results
      .filter(Boolean)
      .sort(
        (left, right) => right.confidence - left.confidence || left.type.localeCompare(right.type),
      )[0] ?? createPlainTextResult(raw)
  );
}

export function payloadKindFromQrType(qrType) {
  const type = typeof qrType === 'string' ? qrType : qrType?.type;

  return payloadKindByType[type] ?? 'text';
}

export function extractUrlFromQrType(qrType) {
  if (qrType?.type !== 'url') {
    return '';
  }

  return qrType.fields.find((field) => field.key === 'url')?.value ?? '';
}
