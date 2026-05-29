const kindPatterns = [
  ['wifi', /^WIFI:/i],
  ['vcard', /^BEGIN:VCARD/i],
  ['calendar', /^BEGIN:VEVENT/i],
  ['email', /^mailto:/i],
  ['phone', /^tel:/i],
  ['sms', /^(sms:|smsto:)/i],
  ['geo', /^geo:/i],
];

export function detectPayloadKind(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return 'text';
  }

  if (isHttpUrl(trimmedText)) {
    return 'url';
  }

  const matchedKind = kindPatterns.find(([, pattern]) => pattern.test(trimmedText));

  return matchedKind?.[0] ?? 'text';
}

export function extractPayloadUrl(text) {
  const trimmedText = text.trim();

  return isHttpUrl(trimmedText) ? trimmedText : '';
}

function isHttpUrl(text) {
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
