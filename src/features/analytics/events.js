export const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';
export const analyticsOptOutStorageKey = 'qr-recast-analytics-opt-out';

const safeEventNames = new Set([
  'decoded_text_copy',
  'decoded_text_open',
  'payload_link_open',
  'qr_detected',
  'qr_export',
  'scan_again',
  'share_url',
  'shared_url_loaded',
]);

const safeParamValues = Object.freeze({
  format: new Set(['docx', 'pdf', 'png', 'svg']),
  method: new Set(['clipboard', 'download', 'file_share', 'native_share']),
  payload_kind: new Set([
    'calendar',
    'email',
    'geo',
    'phone',
    'sms',
    'text',
    'url',
    'vcard',
    'wifi',
  ]),
  result: new Set(['cancelled', 'copied', 'error', 'saved', 'shared', 'success', 'too_large']),
  source: new Set(['camera', 'shared_url', 'upload']),
  surface: new Set(['decoded_text', 'result']),
});

let analyticsInitialised = false;

export function initialiseAnalytics() {
  syncAnalyticsDisabledFlag();

  if (!isAnalyticsAllowed() || analyticsInitialised || typeof window === 'undefined') {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.dataset.qrRecastAnalytics = gaMeasurementId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
  document.head.append(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });

  analyticsInitialised = true;
}

export function trackAnalyticsEvent(eventName, params = {}) {
  if (!isAnalyticsAllowed() || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  if (!safeEventNames.has(eventName)) {
    return;
  }

  window.gtag('event', eventName, sanitiseParams(params));
}

export function isAnalyticsAllowed() {
  return Boolean(gaMeasurementId) && !isDoNotTrackEnabled() && !hasAnalyticsOptedOut();
}

export function isDoNotTrackEnabled() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const windowPreference = typeof window === 'undefined' ? undefined : window.doNotTrack;
  const preference = navigator.doNotTrack ?? windowPreference ?? navigator.msDoNotTrack;

  return preference === '1' || preference === 'yes';
}

export function hasAnalyticsOptedOut() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(analyticsOptOutStorageKey) === 'true';
}

export function setAnalyticsOptOut(optedOut) {
  if (typeof window === 'undefined') {
    return;
  }

  if (optedOut) {
    window.localStorage.setItem(analyticsOptOutStorageKey, 'true');
  } else {
    window.localStorage.removeItem(analyticsOptOutStorageKey);
  }

  syncAnalyticsDisabledFlag();
}

function sanitiseParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => safeParamValues[key]?.has(value)),
  );
}

function syncAnalyticsDisabledFlag() {
  if (!gaMeasurementId || typeof window === 'undefined') {
    return;
  }

  window[`ga-disable-${gaMeasurementId}`] = !isAnalyticsAllowed();
}
