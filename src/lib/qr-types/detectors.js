import { strings } from '../../strings.js';
import { parseMatterQrPayload } from './matter.js';

const fieldLabels = strings.qrTypes.fields;
const typeLabels = strings.qrTypes.types;
const bareDomainPattern =
  /^(?![a-z][a-z0-9+.-]*:)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;
const schemePattern = /^([a-z][a-z0-9+.-]*):/i;
const matterPayloadPattern = /^[0-9A-Z.-]+(?:\*[0-9A-Z.-]+)*$/;
const cryptoSchemes = new Set(['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'monero']);
const appSchemesToIgnore = new Set(['data', 'file', 'javascript']);

export const detectors = Object.freeze([
  detectUrl,
  detectWifi,
  detectHomeKit,
  detectMatter,
  detectEmail,
  detectSms,
  detectTelephone,
  detectGeo,
  detectCalendar,
  detectContact,
  detectCrypto,
  detectAppLink,
]);

export function createPlainTextResult(raw) {
  return createResult({
    branding: { kind: 'generic', label: typeLabels.plainText },
    confidence: 0.1,
    fields: [createField('textLength', raw.length)],
    icon: 'text',
    label: typeLabels.plainText,
    raw,
    type: 'plain-text',
  });
}

function detectUrl(raw) {
  const text = normalise(raw);
  const parsed = parseHttpUrl(text) ?? parseBareDomainUrl(text);

  if (!parsed) {
    return null;
  }

  const { bare, url } = parsed;
  const path = `${url.pathname}${url.search}${url.hash}`;

  return createResult({
    branding: { kind: 'url', label: url.hostname },
    confidence: bare ? 0.76 : 0.98,
    fields: compactFields([
      createField('url', url.href),
      createField('scheme', bare ? strings.qrTypes.values.assumedHttps : url.protocol.slice(0, -1)),
      createField('host', url.host),
      createField('path', path && path !== '/' ? path : '/'),
    ]),
    icon: 'link',
    label: typeLabels.url,
    raw,
    type: 'url',
  });
}

function detectWifi(raw) {
  const text = normalise(raw);

  if (!/^WIFI:/i.test(text)) {
    return null;
  }

  const fields = parseDelimitedFields(text.slice(5), ';', ':');
  const authType = fields.T || '';
  const ssid = fields.S || '';
  const hidden = parseBoolean(fields.H);
  const eapFields = compactFields([
    createField('eapMethod', fields.E),
    createField('anonymousIdentity', fields.A),
    createField('identity', fields.I),
    createField('phaseTwo', fields.PH2),
  ]);

  return createResult({
    branding: { caption: ssid, kind: 'wifi', label: typeLabels.wifi },
    confidence: ssid ? 0.96 : 0.72,
    fields: compactFields([
      createField('ssid', ssid),
      createField('authType', formatWifiAuth(authType)),
      createField('password', fields.P, { sensitive: true }),
      createField('hidden', hidden === null ? '' : hidden ? strings.common.yes : strings.common.no),
      ...eapFields,
    ]),
    icon: 'wifi',
    label: typeLabels.wifi,
    raw,
    type: 'wifi',
  });
}

function detectHomeKit(raw) {
  const text = normalise(raw);
  const match = text.match(/^X-HM:\/\/([A-Z0-9]+)$/i);

  if (!match) {
    return null;
  }

  const payload = match[1].toUpperCase();
  const encodedParameters = payload.slice(0, 9);
  const setupId = payload.slice(9);
  const setupCode = decodeHomeKitSetupCode(encodedParameters);

  return createResult({
    branding: { kind: 'homekit', label: typeLabels.homekit },
    confidence: payload.length >= 9 ? 0.92 : 0.7,
    fields: compactFields([
      createField('setupCode', setupCode),
      createField('setupPayload', text),
      createField('encodedParameters', encodedParameters),
      createField('setupId', setupId),
    ]),
    icon: 'home',
    label: typeLabels.homekit,
    raw,
    type: 'homekit',
  });
}

function decodeHomeKitSetupCode(encodedParameters) {
  if (!/^[0-9A-Z]{9}$/.test(encodedParameters)) {
    return '';
  }

  let value = 0n;

  for (const character of encodedParameters) {
    value = value * 36n + BigInt(parseInt(character, 36));
  }

  const setupCode = value & 0x7ffffffn;

  if (setupCode <= 0n) {
    return '';
  }

  return setupCode.toString().padStart(8, '0');
}

function detectMatter(raw) {
  const text = normalise(raw);

  if (!/^MT:/i.test(text)) {
    return null;
  }

  const payload = text.slice(3).toUpperCase();
  const chunks = payload.split('*').filter(Boolean);
  const validShape = matterPayloadPattern.test(payload);
  const setupPayload = parseMatterQrPayload(text);

  return createResult({
    branding: { caption: setupPayload?.manualCode ?? '', kind: 'matter', label: 'matter' },
    confidence: validShape ? 0.95 : 0.7,
    fields: compactFields([
      createField('manualCode', setupPayload?.manualCode),
      createField('onboardingPayload', text),
      createField('payloadFormat', strings.qrTypes.values.matterBase38),
      chunks.length > 1 ? createField('payloadChunks', chunks.length) : null,
    ]),
    icon: 'matter',
    label: typeLabels.matter,
    raw,
    type: 'matter',
  });
}

function detectEmail(raw) {
  const text = normalise(raw);
  const mailto = parseMailto(text);

  if (mailto) {
    return createEmailResult({ fields: mailto, raw, confidence: 0.98 });
  }

  if (/^MATMSG:/i.test(text)) {
    const fields = parseDelimitedFields(text.slice(7), ';', ':');
    return createEmailResult({
      confidence: fields.TO ? 0.9 : 0.72,
      fields: {
        address: fields.TO,
        body: fields.BODY,
        subject: fields.SUB,
      },
      raw,
    });
  }

  if (/^SMTP:/i.test(text)) {
    const [, address = '', subject = '', body = ''] =
      text.match(/^SMTP:([^:]*):?([^:]*):?([\s\S]*)$/i) ?? [];
    return createEmailResult({
      confidence: address ? 0.86 : 0.68,
      fields: { address, body, subject },
      raw,
    });
  }

  return null;
}

function detectSms(raw) {
  const text = normalise(raw);
  const match = text.match(/^(sms|smsto|mms|mmsto):([\s\S]*)$/i);

  if (!match) {
    return null;
  }

  const scheme = match[1].toLowerCase();
  const bodyText = match[2];
  let number = '';
  let message = '';

  if (scheme.endsWith('to')) {
    const separatorIndex = bodyText.indexOf(':');
    number = separatorIndex === -1 ? bodyText : bodyText.slice(0, separatorIndex);
    message = separatorIndex === -1 ? '' : bodyText.slice(separatorIndex + 1);
  } else {
    const [numberPart, query = ''] = bodyText.split('?');
    number = numberPart;
    message = new URLSearchParams(query).get('body') ?? '';
  }

  return createResult({
    branding: { kind: 'message', label: typeLabels.sms },
    confidence: number ? 0.92 : 0.7,
    fields: compactFields([
      createField('number', decodeValue(number)),
      createField('message', decodeValue(message)),
    ]),
    icon: 'message',
    label: typeLabels.sms,
    raw,
    type: 'sms',
  });
}

function detectTelephone(raw) {
  const text = normalise(raw);

  if (!/^tel:/i.test(text)) {
    return null;
  }

  return createResult({
    branding: { kind: 'phone', label: typeLabels.telephone },
    confidence: text.slice(4) ? 0.95 : 0.7,
    fields: compactFields([createField('number', decodeValue(text.slice(4)))]),
    icon: 'phone',
    label: typeLabels.telephone,
    raw,
    type: 'tel',
  });
}

function detectGeo(raw) {
  const text = normalise(raw);
  const match = text.match(/^geo:([^?]*)(?:\?([\s\S]*))?$/i);

  if (!match) {
    return null;
  }

  const coordinatePart = match[1].split(';')[0];
  const [latitude = '', longitude = ''] = coordinatePart.split(',');
  const query = new URLSearchParams(match[2] ?? '').get('q') ?? '';

  return createResult({
    branding: { kind: 'geo', label: typeLabels.geo },
    confidence: latitude && longitude ? 0.94 : 0.7,
    fields: compactFields([
      createField('latitude', latitude),
      createField('longitude', longitude),
      createField('query', decodeValue(query)),
    ]),
    icon: 'location',
    label: typeLabels.geo,
    raw,
    type: 'geo',
  });
}

function detectCalendar(raw) {
  const text = normalise(raw);

  if (!/BEGIN:VEVENT/i.test(text)) {
    return null;
  }

  const lines = parseContentLines(text);

  return createResult({
    branding: { kind: 'calendar', label: typeLabels.calendar },
    confidence: getLineValue(lines, 'SUMMARY') ? 0.92 : 0.76,
    fields: compactFields([
      createField('summary', getLineValue(lines, 'SUMMARY')),
      createField('start', getLineValue(lines, 'DTSTART')),
      createField('end', getLineValue(lines, 'DTEND')),
      createField('location', getLineValue(lines, 'LOCATION')),
    ]),
    icon: 'calendar',
    label: typeLabels.calendar,
    raw,
    type: 'calendar',
  });
}

function detectContact(raw) {
  const text = normalise(raw);

  if (/^BEGIN:VCARD/i.test(text)) {
    const lines = parseContentLines(text);
    return createResult({
      branding: { kind: 'contact', label: typeLabels.contact },
      confidence: getLineValue(lines, 'FN') || getLineValue(lines, 'N') ? 0.94 : 0.74,
      fields: compactFields([
        createField('name', getLineValue(lines, 'FN') || formatVCardName(getLineValue(lines, 'N'))),
        createField('phone', getLineValue(lines, 'TEL')),
        createField('emailAddress', getLineValue(lines, 'EMAIL')),
        createField('organisation', getLineValue(lines, 'ORG')),
      ]),
      icon: 'contact',
      label: typeLabels.contact,
      raw,
      type: 'contact',
    });
  }

  if (/^MECARD:/i.test(text)) {
    const fields = parseDelimitedFields(text.slice(7), ';', ':');
    return createResult({
      branding: { kind: 'contact', label: typeLabels.contact },
      confidence: fields.N ? 0.9 : 0.72,
      fields: compactFields([
        createField('name', fields.N),
        createField('phone', fields.TEL),
        createField('emailAddress', fields.EMAIL),
        createField('organisation', fields.ORG),
      ]),
      icon: 'contact',
      label: typeLabels.contact,
      raw,
      type: 'contact',
    });
  }

  return null;
}

function detectCrypto(raw) {
  const text = normalise(raw);
  const match = text.match(schemePattern);

  if (!match || !cryptoSchemes.has(match[1].toLowerCase())) {
    return null;
  }

  const scheme = match[1].toLowerCase();
  const address = text.slice(match[0].length).split('?')[0];

  return createResult({
    branding: { kind: 'crypto', label: typeLabels.crypto },
    confidence: address ? 0.88 : 0.66,
    fields: compactFields([
      createField('scheme', scheme),
      createField('address', decodeValue(address)),
    ]),
    icon: 'crypto',
    label: typeLabels.crypto,
    raw,
    type: 'crypto',
  });
}

function detectAppLink(raw) {
  const text = normalise(raw);
  const match = text.match(schemePattern);

  if (!match) {
    return null;
  }

  const scheme = match[1].toLowerCase();

  if (appSchemesToIgnore.has(scheme)) {
    return null;
  }

  return createResult({
    branding: { kind: 'app-link', label: typeLabels.appLink },
    confidence: 0.55,
    fields: compactFields([
      createField('scheme', scheme),
      createField('target', text.slice(match[0].length)),
    ]),
    icon: 'app-link',
    label: typeLabels.appLink,
    raw,
    type: 'app-link',
  });
}

function createEmailResult({ confidence, fields, raw }) {
  return createResult({
    branding: { kind: 'email', label: typeLabels.email },
    confidence,
    fields: compactFields([
      createField('emailAddress', fields.address),
      createField('subject', fields.subject),
      createField('body', fields.body),
    ]),
    icon: 'email',
    label: typeLabels.email,
    raw,
    type: 'email',
  });
}

function parseMailto(text) {
  if (!/^mailto:/i.test(text)) {
    return null;
  }

  try {
    const url = new URL(text);
    return {
      address: decodeValue(url.pathname),
      body: url.searchParams.get('body') ?? '',
      subject: url.searchParams.get('subject') ?? '',
    };
  } catch {
    return {
      address: decodeValue(text.slice(7).split('?')[0]),
      body: '',
      subject: '',
    };
  }
}

function parseHttpUrl(text) {
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol) ? { bare: false, url } : null;
  } catch {
    return null;
  }
}

function parseBareDomainUrl(text) {
  if (!bareDomainPattern.test(text)) {
    return null;
  }

  try {
    return { bare: true, url: new URL(`https://${text}`) };
  } catch {
    return null;
  }
}

function parseDelimitedFields(input, itemSeparator, keySeparator) {
  const fields = {};

  for (const part of splitEscaped(input, itemSeparator)) {
    if (!part) {
      continue;
    }

    const separatorIndex = indexOfUnescaped(part, keySeparator);

    if (separatorIndex === -1) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim().toUpperCase();
    fields[key] = unescapeQrValue(part.slice(separatorIndex + 1));
  }

  return fields;
}

function splitEscaped(input, separator) {
  const parts = [];
  let current = '';
  let escaping = false;

  for (const character of input) {
    if (escaping) {
      current += character;
      escaping = false;
      continue;
    }

    if (character === '\\') {
      escaping = true;
      continue;
    }

    if (character === separator) {
      parts.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  parts.push(current);
  return parts;
}

function indexOfUnescaped(input, character) {
  let escaping = false;

  for (let index = 0; index < input.length; index += 1) {
    if (escaping) {
      escaping = false;
      continue;
    }

    if (input[index] === '\\') {
      escaping = true;
      continue;
    }

    if (input[index] === character) {
      return index;
    }
  }

  return -1;
}

function unescapeQrValue(value) {
  return value.replace(/\\([\\;,:"])/g, '$1');
}

function parseContentLines(text) {
  return text
    .replace(/\r?\n[ \t]/g, '')
    .split(/\r?\n/)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      const key = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
      const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);

      return {
        key: key.split(';')[0].toUpperCase(),
        value: value.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1'),
      };
    });
}

function getLineValue(lines, key) {
  return lines.find((line) => line.key === key)?.value ?? '';
}

function formatVCardName(value) {
  if (!value) {
    return '';
  }

  const [family = '', given = ''] = value.split(';');
  return [given, family].filter(Boolean).join(' ') || value.replaceAll(';', ' ').trim();
}

function formatWifiAuth(value) {
  if (!value) {
    return '';
  }

  if (/^nopass$/i.test(value)) {
    return strings.qrTypes.values.noPassword;
  }

  return value.toUpperCase();
}

function parseBoolean(value) {
  if (!value) {
    return null;
  }

  if (/^(true|t|1|yes)$/i.test(value)) {
    return true;
  }

  if (/^(false|f|0|no)$/i.test(value)) {
    return false;
  }

  return null;
}

function createField(key, value, options = {}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return {
    key,
    label: fieldLabels[key] ?? key,
    value: String(value),
    ...options,
  };
}

function compactFields(fields) {
  return fields.filter(Boolean);
}

function createResult(result) {
  return {
    ...result,
    fields: result.fields ?? [],
  };
}

function decodeValue(value) {
  try {
    return decodeURIComponent(value.replaceAll('+', ' '));
  } catch {
    return value;
  }
}

function normalise(raw) {
  return String(raw ?? '').trim();
}
