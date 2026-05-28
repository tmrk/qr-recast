import { useEffect } from 'react';
import { useAppTheme } from '../theme/index.js';

export function ThemeColourMeta() {
  const { themeColor } = useAppTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute('content', themeColor);
    }
  }, [themeColor]);

  return null;
}
