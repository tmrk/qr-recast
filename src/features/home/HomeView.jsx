import { useState } from 'react';
import { ScanCompleteView } from '../camera/ScanCompleteView.jsx';
import { Viewfinder } from '../camera/Viewfinder.jsx';

export function HomeView() {
  const [decodedText, setDecodedText] = useState('');

  if (decodedText) {
    return <ScanCompleteView onReset={() => setDecodedText('')} text={decodedText} />;
  }

  return <Viewfinder onDetected={setDecodedText} />;
}
