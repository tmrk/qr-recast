import { formatMatterManualCode } from '../../lib/qr-types/matter.js';

const decoratedSize = 360;
const setupQrSize = 236;
const setupQrOrigin = {
  x: 62,
  y: 80,
};
const utilityQrSize = 252;
const utilityQrOrigin = {
  x: 54,
  y: 80,
};

const colours = Object.freeze({
  background: '#ffffff',
  card: '#ffffff',
  iconFill: '#e8f4f1',
  primary: '#0f766e',
  setupInk: '#141817',
  stroke: '#d9e3de',
  text: '#1f2933',
  muted: '#586762',
});

const iconRenderers = Object.freeze({
  'app-link': renderAppIcon,
  calendar: renderCalendarIcon,
  contact: renderContactIcon,
  crypto: renderCryptoIcon,
  email: renderEmailIcon,
  geo: renderGeoIcon,
  homekit: renderHomeIcon,
  matter: renderMatterIcon,
  'plain-text': renderTextIcon,
  sms: renderSmsIcon,
  tel: renderPhoneIcon,
  url: renderUrlIcon,
  wifi: renderWifiIcon,
});
const setupTypes = new Set(['homekit', 'matter']);

export function createDecoratedQrSvg(canonicalSvg, qrType, { enabled = true } = {}) {
  if (!enabled || !canonicalSvg) {
    return canonicalSvg;
  }

  const parsedSvg = parseCanonicalSvg(canonicalSvg);

  if (!parsedSvg) {
    return canonicalSvg;
  }

  const badge = getBrandingBadge(qrType);
  const ariaLabel = escapeXml(`${badge.label} QR code`);

  if (setupTypes.has(badge.type)) {
    return renderSetupQrSvg(parsedSvg, badge, ariaLabel);
  }

  return renderUtilityQrSvg(parsedSvg, badge, ariaLabel);
}

export function getBrandingBadge(qrType) {
  const type = qrType?.type ?? 'plain-text';
  const branding = qrType?.branding ?? {};
  const label = truncateSvgText(branding.label || qrType?.label || 'Plain text', 28);
  const caption = getCaption(qrType);
  const icon = iconRenderers[type] ?? renderTextIcon;

  return {
    caption,
    icon,
    label,
    setupCode: getSetupCode(qrType),
    type,
  };
}

function renderSetupQrSvg(parsedSvg, badge, ariaLabel) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${decoratedSize} ${decoratedSize}" role="img" aria-label="${ariaLabel}">
<title>${ariaLabel}</title>
<rect width="${decoratedSize}" height="${decoratedSize}" fill="${colours.background}"/>
<rect x="10" y="10" width="340" height="340" rx="22" fill="${colours.card}" stroke="${colours.stroke}" stroke-width="1.25"/>
${renderSetupHeader(badge)}
${renderNestedQr(parsedSvg, setupQrOrigin.x, setupQrOrigin.y, setupQrSize)}
${renderSetupFooter(badge)}
</svg>`;
}

function renderUtilityQrSvg(parsedSvg, badge, ariaLabel) {
  const caption = badge.caption ? escapeXml(badge.caption) : '';
  const footer = caption
    ? `<text x="180" y="335" text-anchor="middle" fill="${colours.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13" font-weight="650" letter-spacing="0.8">${caption}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${decoratedSize} ${decoratedSize}" role="img" aria-label="${ariaLabel}">
<title>${ariaLabel}</title>
<rect width="${decoratedSize}" height="${decoratedSize}" fill="${colours.background}"/>
<rect x="10" y="10" width="340" height="340" rx="22" fill="${colours.card}" stroke="${colours.stroke}" stroke-width="1.25"/>
${renderUtilityHeader(badge)}
${renderNestedQr(parsedSvg, utilityQrOrigin.x, utilityQrOrigin.y, utilityQrSize)}
${footer}
</svg>`;
}

function renderNestedQr(parsedSvg, x, y, size) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(parsedSvg.viewBox)}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
${parsedSvg.innerMarkup}
</svg>`;
}

function renderSetupHeader(badge) {
  if (badge.type === 'matter') {
    return `<g aria-hidden="true">
<g transform="translate(88 23)" fill="none" stroke="${colours.setupInk}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">
<path d="M19 5v14"/>
<path d="M19 19 8 31"/>
<path d="M19 19 30 31"/>
<path d="M8 9c5 2 8.5 5.5 11 10"/>
<path d="M30 9c-5 2-8.5 5.5-11 10"/>
</g>
<text x="136" y="52" fill="${colours.setupInk}" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="34" font-weight="520">matter</text>
</g>`;
  }

  return `<g aria-hidden="true">
<g transform="translate(77 24)" fill="none" stroke="${colours.setupInk}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M6 20 21 7l15 13"/>
<path d="M10 19v17h22V19"/>
<path d="M17 36V25h8v11"/>
</g>
<text x="124" y="51" fill="${colours.setupInk}" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="28" font-weight="650">Apple Home</text>
</g>`;
}

function renderSetupFooter(badge) {
  const setupCode = badge.setupCode || badge.caption;

  if (!setupCode) {
    return '';
  }

  const code = escapeXml(formatSetupCode(badge.type, setupCode));

  return `<text x="180" y="338" text-anchor="middle" fill="${colours.setupInk}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="${badge.type === 'matter' ? 25 : 24}" font-weight="700" letter-spacing="1.2">${code}</text>`;
}

function renderUtilityHeader(badge) {
  const label = escapeXml(badge.label);

  return `<g aria-hidden="true">
<circle cx="58" cy="43" r="18" fill="${colours.iconFill}"/>
<g transform="translate(42 27)" color="${colours.primary}" fill="none" stroke="${colours.primary}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
${badge.icon()}
</g>
<text x="86" y="50" fill="${colours.text}" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="18" font-weight="720">${label}</text>
</g>`;
}

function parseCanonicalSvg(svgString) {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return null;
  }

  const document = new DOMParser().parseFromString(svgString, 'image/svg+xml');

  if (document.querySelector('parsererror')) {
    return null;
  }

  const svgElement = document.documentElement;
  const viewBox = svgElement.getAttribute('viewBox');

  if (!viewBox) {
    return null;
  }

  const serializer = new XMLSerializer();
  const innerMarkup = Array.from(svgElement.childNodes)
    .map((node) => serializer.serializeToString(node))
    .join('');

  return { innerMarkup, viewBox };
}

function getCaption(qrType) {
  const brandingCaption = qrType?.branding?.caption;

  if (brandingCaption) {
    return truncateSvgText(String(brandingCaption), 32);
  }

  const fields = Array.isArray(qrType?.fields) ? qrType.fields : [];
  const preferredKeys = [
    'manualCode',
    'setupId',
    'ssid',
    'host',
    'emailAddress',
    'number',
    'summary',
    'name',
  ];
  const field = preferredKeys
    .map((key) => fields.find((candidate) => candidate.key === key))
    .find((candidate) => candidate?.value);

  if (!field) {
    return '';
  }

  return truncateSvgText(String(field.value), 32);
}

function getSetupCode(qrType) {
  const fields = Array.isArray(qrType?.fields) ? qrType.fields : [];

  if (qrType?.type === 'matter') {
    return getFieldValue(fields, 'manualCode');
  }

  if (qrType?.type === 'homekit') {
    return getFieldValue(fields, 'setupId');
  }

  return '';
}

function getFieldValue(fields, key) {
  return String(fields.find((field) => field.key === key)?.value ?? '').trim();
}

function formatSetupCode(type, value) {
  if (type === 'matter') {
    return formatMatterManualCode(value);
  }

  return String(value).trim().replace(/\s+/g, '').toUpperCase();
}

function truncateSvgText(value, maxLength) {
  const normalisedValue = value.replace(/\s+/g, ' ').trim();

  if (normalisedValue.length <= maxLength) {
    return normalisedValue;
  }

  return `${normalisedValue.slice(0, maxLength - 3)}...`;
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return character;
    }
  });
}

function renderAppIcon() {
  return '<rect x="3" y="3" width="10" height="10" rx="3"/><path d="M18 6h7M18 12h7M5 20h18"/>';
}

function renderCalendarIcon() {
  return '<rect x="4" y="5" width="22" height="21" rx="4"/><path d="M9 3v5M21 3v5M4 12h22M10 18h2M18 18h2"/>';
}

function renderContactIcon() {
  return '<rect x="5" y="4" width="20" height="23" rx="4"/><circle cx="15" cy="12" r="4"/><path d="M8 24c1.7-4 12.3-4 14 0"/>';
}

function renderCryptoIcon() {
  return '<path d="M15 4v22M10 7h8a5 5 0 0 1 0 10h-8h9a4 4 0 0 1 0 8h-9"/>';
}

function renderEmailIcon() {
  return '<rect x="4" y="7" width="24" height="17" rx="4"/><path d="M5 9l11 8l11-8"/>';
}

function renderGeoIcon() {
  return '<path d="M16 28s9-8.2 9-15a9 9 0 0 0-18 0c0 6.8 9 15 9 15Z"/><circle cx="16" cy="13" r="3"/>';
}

function renderHomeIcon() {
  return '<path d="M5 16 16 6l11 10"/><path d="M8 15v11h16V15"/><path d="M13 26v-7h6v7"/>';
}

function renderMatterIcon() {
  return '<path d="M9 10l7-4 7 4v8l-7 4-7-4z"/><path d="M9 18l7 8 7-8M16 6v20"/><circle cx="9" cy="10" r="2"/><circle cx="23" cy="10" r="2"/><circle cx="16" cy="26" r="2"/>';
}

function renderPhoneIcon() {
  return '<path d="M10 6l4 5-3 3c2 4 4 6 8 8l3-3 5 4c-1 4-4 5-7 4C12 25 5 18 4 10c-.4-3 1.6-5 6-4Z"/>';
}

function renderSmsIcon() {
  return '<path d="M5 7h22v15H14l-7 6v-6H5z"/><path d="M11 14h10M11 18h6"/>';
}

function renderTextIcon() {
  return '<path d="M7 8h18M16 8v18M11 26h10"/>';
}

function renderUrlIcon() {
  return '<path d="M13 10l-3 3a6 6 0 0 0 8.5 8.5l2-2"/><path d="M19 22l3-3a6 6 0 0 0-8.5-8.5l-2 2"/>';
}

function renderWifiIcon() {
  return '<path d="M5 12c6-5 16-5 22 0"/><path d="M9 17c4-3.4 10-3.4 14 0"/><path d="M13 22c1.7-1.4 4.3-1.4 6 0"/><circle cx="16" cy="26" r="1.6" fill="currentColor" stroke="none"/>';
}
