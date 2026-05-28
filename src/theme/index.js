import { extendTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { darkTheme } from './darkTheme.js';
import { lightTheme } from './lightTheme.js';

export const colourSchemeStorageKey = 'qr-recast-colour-scheme';

const typography = {
  fontFamily: ['Roboto Flex Variable', 'Roboto Flex', 'Roboto', 'system-ui', 'sans-serif'].join(
    ',',
  ),
  h1: {
    fontSize: 'clamp(2.15rem, 7vw, 3rem)',
    lineHeight: 1.04,
    fontWeight: 760,
  },
  h2: {
    fontSize: '1.35rem',
    lineHeight: 1.18,
    fontWeight: 700,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.65,
    fontWeight: 430,
  },
  button: {
    fontWeight: 690,
    textTransform: 'none',
  },
};

const sharedComponents = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: false,
    },
    styleOverrides: {
      root: {
        minHeight: 44,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 22,
        minHeight: 44,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44,
        minHeight: 44,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
};

export const appTheme = extendTheme({
  cssVarPrefix: 'qr',
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: {
      palette: lightTheme.palette,
    },
    dark: {
      palette: darkTheme.palette,
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography,
  components: sharedComponents,
});

export function useAppTheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const { mode, setMode, systemMode } = useColorScheme();
  const selectedMode = mode ?? 'system';
  const resolvedMode =
    selectedMode === 'system' ? (systemMode ?? (prefersDark ? 'dark' : 'light')) : selectedMode;

  return {
    mode: selectedMode,
    resolvedMode,
    setMode,
    themeColor: resolvedMode === 'dark' ? darkTheme.themeColor : lightTheme.themeColor,
  };
}
