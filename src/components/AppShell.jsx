import SettingsRounded from '@mui/icons-material/SettingsRounded';
import { AppBar, Box, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeRollKey, setThemeRollKey] = useState(0);
  const { resolvedMode, toggleMode } = useAppTheme();

  const currentOption =
    themeOptions.find((option) => option.mode === resolvedMode) ?? themeOptions[0];
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
            <div className="app-shell__wordmark">
              <Typography className="app-shell__title" component="p">
                {strings.appName}
              </Typography>
              <span className="app-shell__tagline">{strings.appTagline}</span>
            </div>
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
                aria-label={strings.theme.toggleLabel}
                color="inherit"
                onClick={() => {
                  setThemeRollKey((k) => k + 1);
                  toggleMode();
                }}
              >
                <span key={themeRollKey} className="app-shell__theme-icon">
                  <CurrentIcon fontSize="small" />
                </span>
              </IconButton>
            </Tooltip>
          </div>
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
