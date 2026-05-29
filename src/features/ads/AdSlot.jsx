import { Box, Typography } from '@mui/material';
import { strings } from '../../strings.js';

export const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true';

export function AdSlot() {
  if (!adsEnabled) {
    return null;
  }

  return (
    <Box aria-label={strings.ads.label} className="ad-slot" role="complementary">
      <Typography component="p" variant="body2">
        {strings.ads.placeholder}
      </Typography>
    </Box>
  );
}
