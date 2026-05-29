import { lazy, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackAnalyticsEvent } from '../analytics/events.js';
import { detectPayloadKind } from '../../lib/payload.js';
import { decodePayloadFromShareUrl } from '../../lib/qr.js';
import { strings } from '../../strings.js';
import { Viewfinder } from '../camera/Viewfinder.jsx';

const ResultView = lazy(() =>
  import('../result/ResultView.jsx').then((module) => ({ default: module.ResultView })),
);

export function HomeView() {
  const [decodedText, setDecodedText] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const encodedSharedPayload = new URLSearchParams(location.search).get('q');

  function showDecodedText(text) {
    if (!document.startViewTransition) {
      setDecodedText(text);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setDecodedText(text));
    });
  }

  useEffect(() => {
    if (!encodedSharedPayload) {
      return undefined;
    }

    let active = true;

    decodePayloadFromShareUrl(encodedSharedPayload)
      .then((payload) => {
        if (!active) {
          return;
        }

        if (payload) {
          setDecodedText(payload);
          trackAnalyticsEvent('shared_url_loaded', {
            payload_kind: detectPayloadKind(payload),
            result: 'success',
            source: 'shared_url',
          });
        } else {
          trackAnalyticsEvent('shared_url_loaded', {
            result: 'error',
            source: 'shared_url',
          });
        }

        navigate('/', { replace: true });
      })
      .catch(() => {
        if (active) {
          trackAnalyticsEvent('shared_url_loaded', {
            result: 'error',
            source: 'shared_url',
          });
          navigate('/', { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [encodedSharedPayload, navigate]);

  if (encodedSharedPayload) {
    return (
      <div key="loading" className="home-view home-view--loading">
        <div aria-live="polite" className="result-view__loading" role="status">
          {strings.result.loading}
        </div>
      </div>
    );
  }

  if (decodedText) {
    return (
      <div key="result" className="home-view home-view--result">
        <Suspense
          fallback={
            <div aria-live="polite" className="result-view__loading" role="status">
              {strings.result.loading}
            </div>
          }
        >
          <ResultView onScanAgain={() => setDecodedText('')} text={decodedText} />
        </Suspense>
      </div>
    );
  }

  return (
    <div key="scanner" className="home-view home-view--scanner">
      <Viewfinder onDetected={showDecodedText} />
    </div>
  );
}
