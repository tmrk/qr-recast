import { CssBaseline, GlobalStyles, InitColorSchemeScript } from '@mui/material';
import { CssVarsProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { AdSlot, adsEnabled } from './features/ads/AdSlot.jsx';
import { Analytics } from './features/analytics/Analytics.jsx';
import { ThemeColourMeta } from './components/ThemeColourMeta.jsx';
import { HomeView } from './features/home/HomeView.jsx';
import { appTheme, colourSchemeStorageKey } from './theme/index.js';

function AppContent() {
  return (
    <BrowserRouter basename="/qr-recast">
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            backgroundColor: theme.vars.palette.background.default,
          },
          'html, body, #root': {
            minWidth: 320,
            minHeight: '100svh',
          },
          body: {
            margin: 0,
            overflowX: 'hidden',
          },
          '#root': {
            minHeight: '100svh',
          },
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              scrollBehavior: 'auto !important',
              transitionDuration: '0.01ms !important',
            },
          },
        })}
      />
      <ThemeColourMeta />
      <Analytics />
      <AppShell bottomSlot={adsEnabled ? <AdSlot /> : null}>
        <Routes>
          <Route element={<HomeView />} path="/" />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

function App() {
  return (
    <>
      <InitColorSchemeScript defaultMode="system" modeStorageKey={colourSchemeStorageKey} />
      <CssVarsProvider
        defaultMode="system"
        disableTransitionOnChange
        modeStorageKey={colourSchemeStorageKey}
        theme={appTheme}
      >
        <AppContent />
      </CssVarsProvider>
    </>
  );
}

export default App;
