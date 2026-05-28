import { lazy, Suspense, useState } from 'react';
import { strings } from '../../strings.js';
import { Viewfinder } from '../camera/Viewfinder.jsx';

const ResultView = lazy(() =>
  import('../result/ResultView.jsx').then((module) => ({ default: module.ResultView })),
);

export function HomeView() {
  const [decodedText, setDecodedText] = useState('');

  if (decodedText) {
    return (
      <Suspense fallback={<div className="result-view__loading">{strings.result.loading}</div>}>
        <ResultView onScanAgain={() => setDecodedText('')} text={decodedText} />
      </Suspense>
    );
  }

  return <Viewfinder onDetected={setDecodedText} />;
}
