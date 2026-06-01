import SettingsRounded from '@mui/icons-material/SettingsRounded';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { lazy, Suspense, useState } from 'react';
import { strings } from '../strings.js';
import { useAppTheme } from '../theme/index.js';
import { themeOptions } from '../theme/options.js';

const AboutSheet = lazy(() =>
  import('../features/about/AboutSheet.jsx').then((module) => ({ default: module.AboutSheet })),
);

/**
 * @param {{ children: import('react').ReactNode, bottomSlot?: import('react').ReactNode }} props
 */
export function AppShell({ children, bottomSlot = null }) {
  const [anchorElement, setAnchorElement] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { mode, setMode } = useAppTheme();

  const currentOption = themeOptions.find((option) => option.mode === mode) ?? themeOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <Box className="app-shell">
      <AppBar className="app-shell__bar" color="transparent" elevation={0} position="sticky">
        <Toolbar className="app-shell__toolbar" disableGutters>
          <div className="app-shell__brand">
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
          </div>

          <div className="app-shell__actions">
            <Tooltip title={strings.about.label}>
              <IconButton
                aria-label={strings.about.label}
                color="inherit"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsRounded fontSize="small" />
              </IconButton>
            </Tooltip>
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
          </div>
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
          <Suspense fallback={null}>
            {settingsOpen ? (
              <AboutSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            ) : null}
          </Suspense>
        </Toolbar>
      </AppBar>

      <Container className="app-shell__content" component="main" disableGutters maxWidth={false}>
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
