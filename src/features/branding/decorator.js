import { formatMatterManualCode } from '../../lib/qr-types/matter.js';

const decoratedSize = 360;
const utilityQrSize = 252;
const utilityQrOrigin = {
  x: 54,
  y: 80,
};
const homeKitLogoPath =
  'M118 406a11 11 0 01-5 0 13 13 0 010-5V218c0-6-5-11-11-11H82L256 69l104 82c8 5 18 0 18-9v-25h15v55a11 11 0 004 8l34 27h-21c-6 0-11 5-11 11v183a13 13 0 010 4 11 11 0 01-5 1zM241 83l-114 90c-7 5-14 14-14 29v177c0 15 9 25 24 25h238c15 0 24-10 24-25V202c0-15-7-24-14-29L271 83c-10-6-22-6-30 0zm-67 261V217c0-4 1-5 2-6l80-63 80 63c1 1 2 1 2 6v127zm82-189c-6 0-9 1-14 5l-58 45c-9 7-9 15-9 20v97c0 12 8 20 19 20h124c11 0 19-8 19-20v-97c0-5 0-13-9-20l-58-46c-5-3-9-4-14-4zm-28 134v-49l28-21 28 21v48zm28-66c-4 0-6 2-10 5l-11 9a15 15 0 00-6 11v26c0 8 6 13 13 13h28c7 0 13-6 13-13v-26a15 15 0 00-6-11l-10-9-11-5';
const matterLogoPath =
  'M294.697 60.122c6.777 0 12.314-3.055 15.781-7.762l-3.725-2.121c-2.691 3.415-6.831 5.641-12.056 5.641-8.464 0-14.985-5.832-15.666-13.294h33.565c.024-.441.05-.881.05-1.293 0-10.397-8.482-18.831-18.854-18.831s-18.802 8.435-18.802 18.832 8.43 18.829 19.706 18.829zm-.877-33.419c7.068 0 13.213 5.068 14.568 11.796h-29.139c1.346-6.727 7.455-11.796 14.571-11.796zm-99.896-4.243c-10.398 0-18.83 8.435-18.83 18.833s8.432 18.83 18.83 18.83c6.281 0 11.468-3.078 14.59-7.806v7.082h4.24V23.184h-4.24v7.082c-3.122-4.728-8.309-7.806-14.59-7.806zm0 4.243c8.07 0 14.59 6.518 14.59 14.59s-6.52 14.587-14.59 14.587a14.57 14.57 0 0 1-14.587-14.587c0-8.072 6.517-14.59 14.587-14.59zM65.715 32.905c-7.996 2.19-15.164 7.406-19.636 15.152s-5.407 16.568-3.306 24.587l7.835-4.526a23.9 23.9 0 0 1 1.105-11.836l18.309 10.569 4.303-2.487v-4.967L56.016 48.829a23.92 23.92 0 0 1 9.699-6.879zm-57.108 0v9.045a23.91 23.91 0 0 1 9.699 6.879L0 59.398v4.967l4.303 2.487 18.306-10.569c1.39 3.868 1.726 7.938 1.108 11.836l7.832 4.526c2.101-8.02 1.167-16.841-3.306-24.587A32.52 32.52 0 0 0 8.607 32.905zM337.063 22.46c-8.542 0-15.466 6.448-15.466 15.47v21.469h4.243V37.93c0-6.68 5.025-11.227 11.223-11.227h1.604V22.46zm-213.131 0c-8.542 0-15.466 6.448-15.466 15.47v21.469h4.243V37.93c0-6.68 5.023-11.227 11.223-11.227s11.227 4.547 11.227 11.227v21.469h4.243V37.93c0-6.68 5.023-11.227 11.223-11.227s11.227 4.547 11.227 11.227v21.469h4.243V37.93c0-9.021-6.927-15.47-15.47-15.47-5.535 0-10.576 2.848-13.37 8.642-2.845-5.741-7.84-8.642-13.323-8.642zm108.531-11.636l-4.24 2.43v9.931h-5.691v4.087h5.691v23.847c0 4.605 3.621 8.279 8.225 8.279h6.307v-4.243h-6.307c-2.175 0-3.986-1.811-3.986-4.087V27.271h21.574v23.847c0 4.605 3.619 8.279 8.171 8.279h6.364v-4.243h-6.364c-2.12 0-3.929-1.811-3.929-4.087V27.271h10.293v-4.087H258.28v-12.36l-4.243 2.43v9.931h-21.574zM37.161 0l-4.303 2.484v21.138c-4.046-.731-7.736-2.476-10.804-4.961l-7.838 4.522c5.895 5.83 14 9.429 22.946 9.429s17.051-3.599 22.946-9.429l-7.835-4.522a23.92 23.92 0 0 1-10.807 4.961V2.484z';
const setupLayouts = Object.freeze({
  homekit: {
    card: { height: 396, radius: 11, width: 292, x: 4, y: 4 },
    height: 404,
    qr: { size: 252, x: 24, y: 132 },
    width: 300,
  },
  matter: {
    card: { height: 426, radius: 18, width: 306, x: 7, y: 7 },
    height: 440,
    qr: { size: 232, x: 44, y: 122 },
    width: 320,
  },
});

const colours = Object.freeze({
  background: '#ffffff',
  card: '#ffffff',
  iconFill: '#e8f4f1',
  primary: '#0f766e',
  setupInk: '#141817',
  stroke: '#d9e3de',
  text: '#1f2933',
  muted: '#586762',
  setupBorder: '#080a0b',
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
  if (badge.type === 'matter') {
    return renderMatterSetupQrSvg(parsedSvg, badge, ariaLabel);
  }

  return renderHomeKitSetupQrSvg(parsedSvg, badge, ariaLabel);
}

function renderHomeKitSetupQrSvg(parsedSvg, badge, ariaLabel) {
  const layout = setupLayouts.homekit;
  const codeLines = formatHomeKitDisplayCode(badge.setupCode);
  const codeText = codeLines.length
    ? `<text fill="${colours.setupInk}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="42" font-weight="500">
<tspan x="117" y="58">${escapeXml(codeLines[0])}</tspan>
<tspan x="117" y="108">${escapeXml(codeLines[1])}</tspan>
</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${ariaLabel}">
<title>${ariaLabel}</title>
<rect width="${layout.width}" height="${layout.height}" fill="${colours.background}"/>
${renderSetupCard(layout)}
${renderHomeKitLogo()}
${codeText}
${renderNestedQr(parsedSvg, layout.qr.x, layout.qr.y, layout.qr.size)}
</svg>`;
}

function renderMatterSetupQrSvg(parsedSvg, badge, ariaLabel) {
  const layout = setupLayouts.matter;
  const setupCode = badge.setupCode ? escapeXml(formatSetupCode(badge.type, badge.setupCode)) : '';
  const codeText = setupCode
    ? `<text x="160" y="403" text-anchor="middle" fill="${colours.setupInk}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="29" font-weight="400">${setupCode}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${ariaLabel}">
<title>${ariaLabel}</title>
<rect width="${layout.width}" height="${layout.height}" fill="${colours.background}"/>
${renderSetupCard(layout)}
${renderMatterLogo()}
${renderNestedQr(parsedSvg, layout.qr.x, layout.qr.y, layout.qr.size)}
${codeText}
</svg>`;
}

function renderUtilityQrSvg(parsedSvg, badge, ariaLabel) {
  const caption = badge.caption ? escapeXml(badge.caption) : '';
  const footer = caption
    ? `<text x="180" y="335" text-anchor="middle" fill="${colours.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13" font-weight="650">${caption}</text>`
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

function renderSetupCard(layout) {
  return `<rect x="${layout.card.x}" y="${layout.card.y}" width="${layout.card.width}" height="${layout.card.height}" rx="${layout.card.radius}" fill="${colours.card}" stroke="${colours.setupBorder}" stroke-width="3"/>`;
}

function renderHomeKitLogo() {
  return `<svg x="17" y="21" width="84" height="84" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
<path d="${homeKitLogoPath}" fill="none" stroke="${colours.setupBorder}" stroke-width="22" stroke-linejoin="round"/>
</svg>`;
}

function renderMatterLogo() {
  return `<svg x="54" y="48" width="212" height="46" viewBox="0 0 338.667 72.644" aria-hidden="true" focusable="false">
<path d="${matterLogoPath}" fill="${colours.setupInk}"/>
</svg>`;
}

function renderNestedQr(parsedSvg, x, y, size) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(parsedSvg.viewBox)}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
${parsedSvg.innerMarkup}
</svg>`;
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
    return getFieldValue(fields, 'setupCode') || getFieldValue(fields, 'setupId');
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

function formatHomeKitDisplayCode(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length !== 8) {
    return [];
  }

  return [digits.slice(0, 4), digits.slice(4)];
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
