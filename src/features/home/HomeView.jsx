import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { strings } from '../../strings.js';

export function HomeView() {
  return (
    <Stack className="home-view" spacing={3}>
      <Paper className="home-view__scanner" elevation={0}>
        <Box className="home-view__scanner-mark">
          <QrCodeScannerRounded fontSize="large" />
        </Box>
        <Stack spacing={1.5}>
          <Typography component="h1" variant="h1">
            {strings.home.title}
          </Typography>
        </Stack>
        <Button disabled size="large" startIcon={<QrCodeScannerRounded />} variant="contained">
          {strings.home.scanAction}
        </Button>
      </Paper>

      <Paper className="home-view__privacy" elevation={0}>
        <ShieldRounded color="primary" fontSize="small" />
        <Typography color="text.secondary" variant="body2">
          {strings.privacyNote}
        </Typography>
      </Paper>
    </Stack>
  );
}
