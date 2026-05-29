import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
        }

        navigate('/', { replace: true });
      })
      .catch(() => {
        if (active) {
          navigate('/', { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [encodedSharedPayload, navigate]);

  if (encodedSharedPayload) {
    return <div className="result-view__loading">{strings.result.loading}</div>;
  }

  if (decodedText) {
    return (
      <Suspense fallback={<div className="result-view__loading">{strings.result.loading}</div>}>
        <ResultView onScanAgain={() => setDecodedText('')} text={decodedText} />
      </Suspense>
    );
  }

  return <Viewfinder onDetected={setDecodedText} />;
}
