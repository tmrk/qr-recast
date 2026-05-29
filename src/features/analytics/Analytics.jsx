import { useEffect } from 'react';
import { initialiseAnalytics } from './events.js';

export function Analytics() {
  useEffect(() => {
    initialiseAnalytics();
  }, []);

  return null;
}
