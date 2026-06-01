import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import PlaylistAddCheckRounded from '@mui/icons-material/PlaylistAddCheckRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
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
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import packageJson from '../../../package.json';
import { strings } from '../../strings.js';
import { useAppTheme } from '../../theme/index.js';
import { themeOptions } from '../../theme/options.js';
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

const buildHash = import.meta.env.VITE_BUILD_SHA?.slice(0, 7) || 'local';

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function AboutSheet({ open, onClose }) {
  const [analyticsOptedOut, setAnalyticsOptedOutState] = useState(() => hasAnalyticsOptedOut());
  const [clearBatchOpen, setClearBatchOpen] = useState(false);
  const [brandingEnabled, setBrandingEnabled] = useBrandingPreference();
  const { mode, setMode } = useAppTheme();
  const batchStore = useBatchStore();
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

  function updateThemePreference(_event, nextMode) {
    if (nextMode) {
      setMode(nextMode);
    }
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
        anchor="bottom"
        onClose={onClose}
        open={open}
        slotProps={{
          paper: {
            'aria-labelledby': 'about-title',
            className: 'about-sheet',
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

        <Stack aria-labelledby="about-title" className="about-sheet__content" spacing={2.5}>
          <section className="about-sheet__settings-section" aria-labelledby="about-branding-title">
            <Stack spacing={1.5}>
              <Typography
                className="about-sheet__section-title"
                component="h3"
                id="about-branding-title"
              >
                {strings.about.brandingTitle}
              </Typography>
              <div className="about-sheet__preference-row">
                <label className="about-sheet__preference-label" htmlFor="branding-default-toggle">
                  {strings.about.brandingToggle}
                </label>
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
              </div>
              <Typography color="text.secondary" id="about-branding-status" variant="body2">
                {strings.about.brandingStatus}
              </Typography>
            </Stack>
          </section>

          <section className="about-sheet__settings-section" aria-labelledby="about-theme-title">
            <Stack spacing={1.5}>
              <Typography
                className="about-sheet__section-title"
                component="h3"
                id="about-theme-title"
              >
                {strings.theme.title}
              </Typography>
              <ToggleButtonGroup
                aria-label={strings.theme.menuLabel}
                className="about-sheet__theme-selector"
                exclusive
                onChange={updateThemePreference}
                value={mode}
              >
                {themeOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <ToggleButton key={option.mode} aria-label={option.label} value={option.mode}>
                      <Icon fontSize="small" />
                      <span>{option.label}</span>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Stack>
          </section>

          <section className="about-sheet__settings-section" aria-labelledby="about-batch-title">
            <Stack spacing={1.5}>
              <Typography
                className="about-sheet__section-title"
                component="h3"
                id="about-batch-title"
              >
                {strings.about.batchTitle}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {batchCountLabel}
              </Typography>
              <Typography color="text.secondary" variant="body2">
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
                  disabled={!batchCount}
                  onClick={() => setClearBatchOpen(true)}
                  startIcon={<DeleteRounded />}
                  variant="text"
                >
                  {strings.about.clearBatch}
                </Button>
              </div>
            </Stack>
          </section>

          <section
            className="about-sheet__settings-section"
            aria-labelledby="about-analytics-title"
          >
            <Stack spacing={1.5}>
              <Typography
                className="about-sheet__section-title"
                component="h3"
                id="about-analytics-title"
              >
                {strings.about.analyticsTitle}
              </Typography>
              <div className="about-sheet__preference-row">
                <label
                  className="about-sheet__preference-label"
                  htmlFor="analytics-preference-toggle"
                >
                  {strings.about.analyticsToggle}
                </label>
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
              </div>
              <Typography color="text.secondary" id="about-analytics-status" variant="body2">
                {analyticsStatus}
              </Typography>
            </Stack>
          </section>

          <div className="about-sheet__privacy">
            <PrivacyTipRounded color="primary" fontSize="small" />
            <Typography color="text.secondary">{strings.about.privacyBody}</Typography>
          </div>

          <div className="about-sheet__metadata">
            <div className="about-sheet__metadata-item">
              <Typography color="text.secondary" variant="overline">
                {strings.about.versionLabel}
              </Typography>
              <Typography>{packageJson.version}</Typography>
            </div>
            <div className="about-sheet__metadata-item">
              <Typography color="text.secondary" variant="overline">
                {strings.about.buildLabel}
              </Typography>
              <Typography>{buildHash}</Typography>
            </div>
          </div>

          <Button
            className="about-sheet__licence"
            component="a"
            href="https://github.com/tmrk/qr-recast/blob/main/LICENCE"
            rel="noopener noreferrer"
            target="_blank"
            variant="outlined"
          >
            {strings.about.licence}
          </Button>
        </Stack>
      </Drawer>

      <Dialog onClose={() => setClearBatchOpen(false)} open={clearBatchOpen}>
        <DialogTitle>{strings.batch.clearTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{strings.batch.clearBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearBatchOpen(false)}>{strings.common.no}</Button>
          <Button color="error" onClick={clearBatch} variant="contained">
            {strings.common.yes}
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
