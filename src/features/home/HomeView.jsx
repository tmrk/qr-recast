import PlaylistAddCheckRounded from '@mui/icons-material/PlaylistAddCheckRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import { Button, Paper } from '@mui/material';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackAnalyticsEvent } from '../analytics/events.js';
import { useBrandingPreference } from '../branding/preferences.js';
import { useBatchStore } from '../batch/store.js';
import { decodePayloadFromShareUrl } from '../../lib/qr.js';
import { strings } from '../../strings.js';
import { Viewfinder } from '../camera/Viewfinder.jsx';

const ResultView = lazy(() =>
  import('../result/ResultView.jsx').then((module) => ({ default: module.ResultView })),
);
const BatchPanel = lazy(() =>
  import('../batch/BatchPanel.jsx').then((module) => ({ default: module.BatchPanel })),
);
const BatchNameDialog = lazy(() =>
  import('../batch/BatchNameDialog.jsx').then((module) => ({ default: module.BatchNameDialog })),
);
const BatchFeedback = lazy(() =>
  import('../batch/BatchFeedback.jsx').then((module) => ({ default: module.BatchFeedback })),
);

export function HomeView() {
  const [decodedText, setDecodedText] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [namingItemId, setNamingItemId] = useState('');
  const [batchMessage, setBatchMessage] = useState('');
  const [batchWarning, setBatchWarning] = useState('');
  const [batchExportFormat, setBatchExportFormat] = useState('');
  const [deletedItemState, setDeletedItemState] = useState(null);
  const [globalBrandingEnabled] = useBrandingPreference();
  const batchStore = useBatchStore();
  const batchScanLockRef = useRef({ payload: '', until: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const encodedSharedPayload = new URLSearchParams(location.search).get('q');
  const namingItem = batchStore.batch.items.find((item) => item.id === namingItemId) ?? null;
  const batchCount = batchStore.batch.items.length;

  function showDecodedText(text) {
    if (!document.startViewTransition) {
      setDecodedText(text);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setDecodedText(text));
    });
  }

  function updateCaptureMode(nextMode) {
    const useBatchMode = nextMode === 'batch';

    if (useBatchMode === batchMode) {
      return;
    }

    setBatchMode(useBatchMode);
    if (useBatchMode) {
      trackAnalyticsEvent('batch_started', {
        result: 'success',
        source: 'camera',
      });
    }
  }

  async function handleDetected(text) {
    if (!batchMode) {
      showDecodedText(text);
      return;
    }

    const now = Date.now();

    if (
      namingItemId ||
      (batchScanLockRef.current.payload === text && batchScanLockRef.current.until > now)
    ) {
      return;
    }

    batchScanLockRef.current = { payload: text, until: now + 1800 };

    let addedItem;

    try {
      addedItem = await batchStore.addPayload(text, {
        brandingEnabled: globalBrandingEnabled,
      });
    } catch {
      setBatchWarning(strings.batch.addError);
      return;
    }

    setNamingItemId(addedItem.item.id);
    setBatchMessage(strings.batch.added);
    if (addedItem.duplicate) {
      setBatchWarning(strings.batch.duplicate);
    }
    const { detectPayloadKind } = await import('../../lib/payload.js');

    trackAnalyticsEvent('batch_item_added', {
      payload_kind: detectPayloadKind(text),
      result: 'success',
    });
  }

  function deleteBatchItem(itemId) {
    const removedItem = batchStore.removeItem(itemId);

    if (!removedItem) {
      return;
    }

    setDeletedItemState(removedItem);
    setBatchMessage(strings.batch.deleted);
  }

  function undoDelete() {
    if (!deletedItemState) {
      return;
    }

    batchStore.restoreItem(deletedItemState.item, deletedItemState.itemIndex);
    setDeletedItemState(null);
    setBatchMessage(strings.batch.restored);
  }

  async function exportBatch(format) {
    if (!batchStore.batch.items.length || batchExportFormat) {
      return;
    }

    setBatchExportFormat(format);
    setBatchMessage('');
    setBatchWarning('');

    try {
      const [{ createBatchExport }, { shareOrSaveBlob, statusToMessage }] = await Promise.all([
        import('../batch/exporters.js'),
        import('../../lib/files.js'),
      ]);
      const { blob, fileName } = await createBatchExport(batchStore.batch.items, format);
      const status = await shareOrSaveBlob({
        blob,
        fileName,
        title: strings.appName,
      });

      trackAnalyticsEvent('batch_exported', {
        count: batchStore.batch.items.length,
        format,
        result: status,
      });
      setBatchMessage(statusToMessage(status, strings.result));
    } catch {
      trackAnalyticsEvent('batch_exported', {
        count: batchStore.batch.items.length,
        format,
        result: 'error',
      });
      setBatchWarning(strings.batch.exportError);
    } finally {
      setBatchExportFormat('');
    }
  }

  useEffect(() => {
    if (!encodedSharedPayload) {
      return undefined;
    }

    let active = true;

    decodePayloadFromShareUrl(encodedSharedPayload)
      .then(async (payload) => {
        if (!active) {
          return;
        }

        if (payload) {
          const { detectPayloadKind } = await import('../../lib/payload.js');

          if (!active) {
            return;
          }

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
      <Viewfinder
        bottomSlot={
          batchMode ? (
            <Suspense fallback={null}>
              <BatchPanel
                batch={batchStore.batch}
                busyFormat={batchExportFormat}
                onClear={batchStore.clearBatch}
                onDelete={deleteBatchItem}
                onExport={exportBatch}
                onMove={batchStore.moveItem}
                onRename={batchStore.renameItem}
                persistenceError={batchStore.persistenceError}
              />
            </Suspense>
          ) : null
        }
        continueAfterDetected={batchMode}
        onDetected={handleDetected}
        topSlot={
          <Paper className="batch-mode-control" elevation={0}>
            <div
              aria-label={strings.batch.modeLabel}
              className="batch-mode-control__buttons"
              role="group"
            >
              <Button
                aria-pressed={!batchMode}
                onClick={() => updateCaptureMode('single')}
                variant={batchMode ? 'text' : 'contained'}
              >
                <QrCodeScannerRounded />
                {strings.batch.single}
              </Button>
              <Button
                aria-pressed={batchMode}
                onClick={() => updateCaptureMode('batch')}
                variant={batchMode ? 'contained' : 'text'}
              >
                <PlaylistAddCheckRounded />
                {strings.batch.batch}
              </Button>
            </div>
            {batchCount ? (
              <span className="batch-mode-control__count">
                {strings.batch.countShort.replace('{count}', String(batchCount))}
              </span>
            ) : null}
          </Paper>
        }
      />
      <Suspense fallback={null}>
        <BatchNameDialog
          item={namingItem}
          onClose={() => setNamingItemId('')}
          onSave={batchStore.renameItem}
        />
      </Suspense>
      <Suspense fallback={null}>
        <BatchFeedback
          canUndo={Boolean(deletedItemState)}
          message={batchMessage}
          onClearMessage={() => {
            setBatchMessage('');
            setDeletedItemState(null);
          }}
          onClearWarning={() => setBatchWarning('')}
          onUndo={undoDelete}
          warning={batchWarning}
        />
      </Suspense>
    </div>
  );
}
