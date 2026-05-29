import { useEffect } from 'react';

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';

export function Analytics() {
  useEffect(() => {
    if (!gaMeasurementId || window.gtag) {
      return undefined;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      gaMeasurementId,
    )}`;
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

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
