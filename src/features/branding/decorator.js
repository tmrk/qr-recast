const decoratedSize = 360;
const qrSize = 284;
const qrOrigin = {
  x: 38,
  y: 72,
};

const colours = Object.freeze({
  background: '#ffffff',
  badgeFill: '#edf8f5',
  badgeStroke: '#bedbd3',
  iconFill: '#d6f1eb',
  primary: '#0f766e',
  text: '#1f2933',
  muted: '#5f6f69',
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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${decoratedSize} ${decoratedSize}" role="img" aria-label="${ariaLabel}">
<title>${ariaLabel}</title>
<rect width="${decoratedSize}" height="${decoratedSize}" fill="${colours.background}"/>
<rect x="12" y="12" width="336" height="336" rx="30" fill="#fbfdfb" stroke="${colours.badgeStroke}" stroke-width="1.5"/>
${renderBadge(badge)}
<svg x="${qrOrigin.x}" y="${qrOrigin.y}" width="${qrSize}" height="${qrSize}" viewBox="${escapeXml(parsedSvg.viewBox)}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
${parsedSvg.innerMarkup}
</svg>
</svg>`;
}

export function getBrandingBadge(qrType) {
  const type = qrType?.type ?? 'plain-text';
  const label = truncateSvgText(qrType?.label || 'Plain text', 26);
  const caption = getCaption(qrType);
  const icon = iconRenderers[type] ?? renderTextIcon;

  return {
    caption,
    icon,
    label,
    type,
  };
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

function renderBadge(badge) {
  const label = escapeXml(badge.label);
  const caption = badge.caption ? escapeXml(badge.caption) : '';
  const labelY = caption ? 34 : 39;
  const captionMarkup = caption
    ? `<text x="86" y="50" fill="${colours.muted}" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="12">${caption}</text>`
    : '';

  return `<g aria-hidden="true">
<rect x="24" y="20" width="312" height="44" rx="18" fill="${colours.badgeFill}" stroke="${colours.badgeStroke}" stroke-width="1"/>
<circle cx="56" cy="42" r="17" fill="${colours.iconFill}"/>
<g transform="translate(40 26)" color="${colours.primary}" fill="none" stroke="${colours.primary}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
${badge.icon()}
</g>
<text x="86" y="${labelY}" fill="${colours.text}" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="16" font-weight="700">${label}</text>
${captionMarkup}
</g>`;
}

function getCaption(qrType) {
  const fields = Array.isArray(qrType?.fields) ? qrType.fields : [];
  const preferredKeys = ['ssid', 'host', 'setupId', 'emailAddress', 'number', 'summary', 'name'];
  const field = preferredKeys
    .map((key) => fields.find((candidate) => candidate.key === key))
    .find((candidate) => candidate?.value);

  if (!field) {
    return '';
  }

  return truncateSvgText(String(field.value), 34);
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
  return '<path d="M5 16L16 6l11 10"/><path d="M8 15v11h16V15"/><path d="M13 26v-7h6v7"/>';
}

function renderMatterIcon() {
  return '<path d="M9 10l7-4l7 4v8l-7 4l-7-4z"/><path d="M9 18l7 8l7-8M16 6v20"/><circle cx="9" cy="10" r="2"/><circle cx="23" cy="10" r="2"/><circle cx="16" cy="26" r="2"/>';
}

function renderPhoneIcon() {
  return '<path d="M10 6l4 5l-3 3c2 4 4 6 8 8l3-3l5 4c-1 4-4 5-7 4C12 25 5 18 4 10c-.4-3 1.6-5 6-4Z"/>';
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
