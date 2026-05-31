import { useCallback, useEffect, useState } from 'react';

export const preferencesStorageKey = 'qr-recast:preferences:v1';

const preferenceChangeEvent = 'qr-recast:preferences-changed';
const preferenceVersion = 1;
const defaultPreferences = Object.freeze({
  brandingEnabled: true,
});

export function readPreferences() {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }

  try {
    const storedValue = window.localStorage.getItem(preferencesStorageKey);

    if (!storedValue) {
      return defaultPreferences;
    }

    const parsedValue = JSON.parse(storedValue);

    if (parsedValue?.version !== preferenceVersion) {
      return defaultPreferences;
    }

    return {
      brandingEnabled:
        typeof parsedValue.brandingEnabled === 'boolean'
          ? parsedValue.brandingEnabled
          : defaultPreferences.brandingEnabled,
    };
  } catch {
    return defaultPreferences;
  }
}

export function setBrandingPreference(enabled) {
  if (typeof window === 'undefined') {
    return;
  }

  const preferences = {
    version: preferenceVersion,
    brandingEnabled: Boolean(enabled),
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
  } catch {
    window.dispatchEvent(
      new CustomEvent(preferenceChangeEvent, {
        detail: readPreferences(),
      }),
    );
    return;
  }

  window.dispatchEvent(
    new CustomEvent(preferenceChangeEvent, {
      detail: readPreferences(),
    }),
  );
}

export function useBrandingPreference() {
  const [brandingEnabled, setBrandingEnabledState] = useState(
    () => readPreferences().brandingEnabled,
  );

  const setBrandingEnabled = useCallback((enabled) => {
    setBrandingPreference(enabled);
    setBrandingEnabledState(Boolean(enabled));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function syncPreference(event) {
      setBrandingEnabledState(
        event instanceof CustomEvent
          ? Boolean(event.detail?.brandingEnabled)
          : readPreferences().brandingEnabled,
      );
    }

    function syncStorage(event) {
      if (event.key === preferencesStorageKey) {
        setBrandingEnabledState(readPreferences().brandingEnabled);
      }
    }

    window.addEventListener(preferenceChangeEvent, syncPreference);
    window.addEventListener('storage', syncStorage);

    return () => {
      window.removeEventListener(preferenceChangeEvent, syncPreference);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  return [brandingEnabled, setBrandingEnabled];
}
