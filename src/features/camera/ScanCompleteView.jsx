import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { strings } from '../../strings.js';

/**
 * @param {{ onReset: () => void, text: string }} props
 */
export function ScanCompleteView({ onReset, text }) {
  return (
    <section className="scan-complete" aria-labelledby="scan-complete-title">
      <Paper className="scan-complete__panel" elevation={0}>
        <CheckCircleRounded className="scan-complete__icon" color="primary" />
        <Stack spacing={1.5}>
          <Typography component="h1" id="scan-complete-title" variant="h1">
            {strings.camera.detectedTitle}
          </Typography>
          <Typography color="text.secondary">{strings.camera.detectedBody}</Typography>
        </Stack>
        <pre className="scan-complete__payload">
          <code>{text}</code>
        </pre>
        <Button onClick={onReset} startIcon={<QrCodeScannerRounded />} variant="contained">
          {strings.camera.scanAgain}
        </Button>
      </Paper>
    </section>
  );
}
