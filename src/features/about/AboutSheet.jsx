import CloseRounded from '@mui/icons-material/CloseRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import {
  Button,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import packageJson from '../../../package.json';
import { strings } from '../../strings.js';
import {
  gaMeasurementId,
  hasAnalyticsOptedOut,
  initialiseAnalytics,
  isDoNotTrackEnabled,
  setAnalyticsOptOut,
} from '../analytics/events.js';

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function AboutSheet({ open, onClose }) {
  const [analyticsOptedOut, setAnalyticsOptedOutState] = useState(() => hasAnalyticsOptedOut());
  const doNotTrackEnabled = isDoNotTrackEnabled();
  const analyticsPreferenceEnabled = !analyticsOptedOut && !doNotTrackEnabled;
  const analyticsStatus = getAnalyticsStatus({
    analyticsOptedOut,
    doNotTrackEnabled,
    hasMeasurementId: Boolean(gaMeasurementId),
  });

  function updateAnalyticsPreference(event) {
    const optedOut = !event.target.checked;

    setAnalyticsOptOut(optedOut);
    setAnalyticsOptedOutState(optedOut);

    if (!optedOut) {
      initialiseAnalytics();
    }
  }

  return (
    <Drawer
      anchor="bottom"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          className: 'about-sheet',
        },
      }}
    >
      <div aria-hidden="true" className="about-sheet__handle" />
      <Stack
        alignItems="center"
        className="about-sheet__header"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography component="h2" id="about-title" variant="h2">
          {strings.about.title}
        </Typography>
        <IconButton aria-label={strings.about.close} onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </Stack>

      <Stack aria-labelledby="about-title" className="about-sheet__content" spacing={2.5}>
        <section className="about-sheet__analytics" aria-labelledby="about-analytics-title">
          <Stack spacing={1.5}>
            <Typography
              className="about-sheet__section-title"
              component="h3"
              id="about-analytics-title"
            >
              {strings.about.analyticsTitle}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={analyticsPreferenceEnabled}
                  disabled={doNotTrackEnabled}
                  inputProps={{ 'aria-label': strings.about.analyticsToggle }}
                  onChange={updateAnalyticsPreference}
                />
              }
              label={strings.about.analyticsToggle}
            />
            <Typography color="text.secondary" variant="body2">
              {analyticsStatus}
            </Typography>
          </Stack>
        </section>

        <Stack className="about-sheet__privacy" direction="row" spacing={1.25}>
          <PrivacyTipRounded color="primary" fontSize="small" />
          <Typography color="text.secondary">{strings.about.privacyBody}</Typography>
        </Stack>

        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="overline">
            {strings.about.versionLabel}
          </Typography>
          <Typography>{packageJson.version}</Typography>
        </Stack>

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
