import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import PlaylistAddCheckRounded from '@mui/icons-material/PlaylistAddCheckRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Switch,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import packageJson from '../../../package.json';
import { useHistoryLayer } from '../../lib/history-layers.js';
import { strings } from '../../strings.js';
import { useAppTheme } from '../../theme/index.js';
import { themeChoices } from '../../theme/options.js';
import { requestBatchResume, useBatchStore } from '../batch/store.js';
import { useBrandingPreference } from '../branding/preferences.js';
import {
  gaMeasurementId,
  hasAnalyticsOptedOut,
  initialiseAnalytics,
  isDoNotTrackEnabled,
  setAnalyticsOptOut,
  trackAnalyticsEvent,
} from '../analytics/events.js';
import './AboutSheet.css';

const buildHash = import.meta.env.VITE_BUILD_SHA?.slice(0, 7) || 'local';

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function AboutSheet({ open, onClose }) {
  const [analyticsOptedOut, setAnalyticsOptedOutState] = useState(() => hasAnalyticsOptedOut());
  const [clearBatchOpen, setClearBatchOpen] = useState(false);
  const [brandingEnabled, setBrandingEnabled] = useBrandingPreference();
  const useSideSheet = useMediaQuery('(min-width:900px)');
  const { mode, setMode } = useAppTheme();
  const batchStore = useBatchStore();

  useHistoryLayer(clearBatchOpen, () => setClearBatchOpen(false));

  const doNotTrackEnabled = isDoNotTrackEnabled();
  const analyticsPreferenceEnabled = !analyticsOptedOut && !doNotTrackEnabled;
  const analyticsStatus = getAnalyticsStatus({
    analyticsOptedOut,
    doNotTrackEnabled,
    hasMeasurementId: Boolean(gaMeasurementId),
  });
  const batchCount = batchStore.batch.items.length;
  const batchCountLabel = getBatchCountLabel(batchCount);

  function updateAnalyticsPreference(event) {
    const optedOut = !event.target.checked;

    setAnalyticsOptOut(optedOut);
    setAnalyticsOptedOutState(optedOut);

    if (!optedOut) {
      initialiseAnalytics();
    }
  }

  function updateBrandingPreference(event) {
    const enabled = event.target.checked;

    setBrandingEnabled(enabled);
    trackAnalyticsEvent('branding_toggled', {
      state: enabled ? 'enabled' : 'disabled',
      surface: 'settings',
    });
  }

  function resumeBatch() {
    requestBatchResume();
    onClose();
  }

  function clearBatch() {
    batchStore.clearBatch();
    setClearBatchOpen(false);
  }

  return (
    <>
      <Drawer
        anchor={useSideSheet ? 'right' : 'bottom'}
        onClose={onClose}
        open={open}
        slotProps={{
          paper: {
            'aria-labelledby': 'about-title',
            className: `about-sheet${useSideSheet ? ' about-sheet--side' : ''}`,
            role: 'dialog',
          },
        }}
      >
        <div aria-hidden="true" className="about-sheet__handle" />
        <div className="about-sheet__header">
          <Typography component="h2" id="about-title" variant="h2">
            {strings.about.title}
          </Typography>
          <IconButton aria-label={strings.about.close} onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </div>

        <div className="about-sheet__content">
          <section aria-labelledby="about-theme-title" className="about-sheet__section">
            <h3 className="about-sheet__section-title" id="about-theme-title">
              {strings.theme.title}
            </h3>
            <div
              aria-labelledby="about-theme-title"
              className="qr-segmented about-sheet__theme-options"
              role="group"
            >
              {themeChoices.map((option) => {
                const Icon = option.icon;

                return (
                  <Button
                    aria-pressed={mode === option.mode}
                    key={option.mode}
                    onClick={() => setMode(option.mode)}
                    startIcon={<Icon fontSize="small" />}
                    variant="text"
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="about-branding-title" className="about-sheet__section">
            <h3 className="about-sheet__section-title" id="about-branding-title">
              {strings.about.brandingTitle}
            </h3>
            <div className="about-sheet__group">
              <div className="about-sheet__row">
                <label className="about-sheet__row-label" htmlFor="branding-default-toggle">
                  {strings.about.brandingToggle}
                </label>
                <span className="about-sheet__switch-slot">
                  <Switch
                    checked={brandingEnabled}
                    onChange={updateBrandingPreference}
                    slotProps={{
                      input: {
                        'aria-describedby': 'about-branding-status',
                        id: 'branding-default-toggle',
                      },
                    }}
                  />
                </span>
              </div>
              <Typography
                className="about-sheet__help"
                color="text.secondary"
                id="about-branding-status"
                variant="body2"
              >
                {strings.about.brandingStatus}
              </Typography>
            </div>
          </section>

          <section aria-labelledby="about-batch-title" className="about-sheet__section">
            <h3 className="about-sheet__section-title" id="about-batch-title">
              {strings.about.batchTitle}
            </h3>
            <div className="about-sheet__group">
              <Typography className="about-sheet__strong">{batchCountLabel}</Typography>
              <Typography className="about-sheet__help" color="text.secondary" variant="body2">
                {strings.about.batchStorage}
              </Typography>
              {batchStore.persistenceError ? (
                <Alert severity="warning" variant="outlined">
                  {strings.batch.persistenceError}
                </Alert>
              ) : null}
              <div className="about-sheet__section-actions">
                <Button
                  onClick={resumeBatch}
                  startIcon={<PlaylistAddCheckRounded />}
                  variant={batchCount ? 'contained' : 'outlined'}
                >
                  {batchCount ? strings.about.resumeBatch : strings.about.startBatch}
                </Button>
                <Button
                  color="error"
                  disabled={!batchCount}
                  onClick={() => setClearBatchOpen(true)}
                  startIcon={<DeleteRounded />}
                  variant="text"
                >
                  {strings.about.clearBatch}
                </Button>
              </div>
            </div>
          </section>

          <section aria-labelledby="about-analytics-title" className="about-sheet__section">
            <h3 className="about-sheet__section-title" id="about-analytics-title">
              {strings.about.analyticsTitle}
            </h3>
            <div className="about-sheet__group">
              <div className="about-sheet__row">
                <label className="about-sheet__row-label" htmlFor="analytics-preference-toggle">
                  {strings.about.analyticsToggle}
                </label>
                <span className="about-sheet__switch-slot">
                  <Switch
                    checked={analyticsPreferenceEnabled}
                    disabled={doNotTrackEnabled}
                    onChange={updateAnalyticsPreference}
                    slotProps={{
                      input: {
                        'aria-describedby': 'about-analytics-status',
                        id: 'analytics-preference-toggle',
                      },
                    }}
                  />
                </span>
              </div>
              <Typography
                className="about-sheet__help"
                color="text.secondary"
                id="about-analytics-status"
                variant="body2"
              >
                {analyticsStatus}
              </Typography>
            </div>
          </section>

          <section aria-labelledby="about-privacy-title" className="about-sheet__section">
            <h3 className="about-sheet__section-title" id="about-privacy-title">
              {strings.about.privacyTitle}
            </h3>
            <div className="about-sheet__privacy">
              <ShieldRounded fontSize="small" />
              <Typography variant="body2">{strings.about.privacyBody}</Typography>
            </div>
          </section>

          <footer className="about-sheet__footer">
            <Typography color="text.secondary" variant="body2">
              {strings.appName} {strings.about.versionLabel.toLowerCase()} {packageJson.version}
              {' · '}
              {strings.about.buildLabel.toLowerCase()} {buildHash}
            </Typography>
            <Button
              className="about-sheet__licence"
              component="a"
              href="https://github.com/tmrk/qr-recast/blob/main/LICENCE"
              rel="noopener noreferrer"
              target="_blank"
              variant="text"
            >
              {strings.about.licence}
            </Button>
          </footer>
        </div>
      </Drawer>

      <Dialog onClose={() => setClearBatchOpen(false)} open={clearBatchOpen}>
        <DialogTitle>{strings.batch.clearTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{strings.batch.clearBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearBatchOpen(false)}>{strings.batch.clearCancel}</Button>
          <Button color="error" onClick={clearBatch} variant="contained">
            {strings.batch.clearConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function getAnalyticsStatus({ analyticsOptedOut, doNotTrackEnabled, hasMeasurementId }) {
  if (doNotTrackEnabled) {
    return strings.about.analyticsDoNotTrack;
  }

  if (analyticsOptedOut) {
    return strings.about.analyticsOptedOut;
  }

  if (!hasMeasurementId) {
    return strings.about.analyticsNotConfigured;
  }

  return strings.about.analyticsEnabled;
}

function getBatchCountLabel(count) {
  if (count === 1) {
    return strings.about.batchOne.replace('{count}', String(count));
  }

  if (count > 1) {
    return strings.about.batchMany.replace('{count}', String(count));
  }

  return strings.about.batchEmpty;
}
