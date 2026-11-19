import { Button, Snackbar } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { strings } from '../strings.js';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and offers a reload once a new version is waiting. The new
 * version never takes over by itself, so an open result or half-finished batch is not interrupted.
 */
export function UpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const applyUpdateRef = useRef(null);

  useEffect(() => {
    let registration = null;
    let intervalId = 0;

    function checkForUpdate() {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        registration?.update();
      }
    }

    applyUpdateRef.current = registerSW({
      onNeedRefresh: () => setUpdateReady(true),
      onRegisteredSW: (_scriptUrl, serviceWorkerRegistration) => {
        registration = serviceWorkerRegistration ?? null;
      },
    });
    intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', checkForUpdate);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', checkForUpdate);
    };
  }, []);

  return (
    <Snackbar
      className="update-prompt"
      message={strings.update.available}
      open={updateReady && !dismissed}
      action={
        <>
          <Button color="inherit" onClick={() => setDismissed(true)} size="small">
            {strings.update.later}
          </Button>
          <Button
            color="primary"
            onClick={() => applyUpdateRef.current?.(true)}
            size="small"
            variant="contained"
          >
            {strings.update.reload}
          </Button>
        </>
      }
    />
  );
}
