import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRounded from '@mui/icons-material/SettingsBrightnessRounded';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { strings } from '../strings.js';
import { useAppTheme } from '../theme/index.js';

const themeOptions = [
  { mode: 'system', label: strings.theme.system, icon: SettingsBrightnessRounded },
  { mode: 'light', label: strings.theme.light, icon: LightModeRounded },
  { mode: 'dark', label: strings.theme.dark, icon: DarkModeRounded },
];

/**
 * @param {{ children: import('react').ReactNode, bottomSlot?: import('react').ReactNode }} props
 */
export function AppShell({ children, bottomSlot = null }) {
  const [anchorElement, setAnchorElement] = useState(null);
  const { mode, setMode } = useAppTheme();

  const currentOption = themeOptions.find((option) => option.mode === mode) ?? themeOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <Box className="app-shell">
      <AppBar className="app-shell__bar" color="transparent" elevation={0} position="sticky">
        <Toolbar className="app-shell__toolbar" disableGutters>
          <Stack alignItems="center" direction="row" spacing={1.25}>
            <Box
              alt=""
              aria-hidden="true"
              component="img"
              className="app-shell__logo"
              src={`${import.meta.env.BASE_URL}favicon.svg`}
            />
            <Typography className="app-shell__title" component="p">
              {strings.appName}
            </Typography>
          </Stack>

          <Tooltip title={strings.theme.menuLabel}>
            <IconButton
              aria-controls={anchorElement ? 'theme-menu' : undefined}
              aria-expanded={anchorElement ? 'true' : undefined}
              aria-haspopup="menu"
              aria-label={strings.theme.menuLabel}
              color="inherit"
              onClick={(event) => setAnchorElement(event.currentTarget)}
            >
              <CurrentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElement}
            id="theme-menu"
            onClose={() => setAnchorElement(null)}
            open={Boolean(anchorElement)}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <MenuItem
                  key={option.mode}
                  onClick={() => {
                    setMode(option.mode);
                    setAnchorElement(null);
                  }}
                  selected={mode === option.mode}
                  sx={{ gap: 1.25 }}
                >
                  <Icon fontSize="small" />
                  {option.label}
                </MenuItem>
              );
            })}
          </Menu>
        </Toolbar>
      </AppBar>

      <Container className="app-shell__content" component="main" maxWidth="sm">
        {children}
      </Container>

      {bottomSlot ? (
        <Box className="app-shell__bottom" component="aside">
          {bottomSlot}
        </Box>
      ) : null}
    </Box>
  );
}
