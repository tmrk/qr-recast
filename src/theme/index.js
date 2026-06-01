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
    fontSize: 'clamp(1.85rem, 6vw, 2.4rem)',
    lineHeight: 1.08,
    fontWeight: 720,
    letterSpacing: '-0.022em',
  },
  h2: {
    fontSize: '1.2rem',
    lineHeight: 1.25,
    fontWeight: 680,
    letterSpacing: '-0.012em',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 420,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.55,
    fontWeight: 420,
  },
  overline: {
    fontSize: '0.6875rem',
    lineHeight: 1.4,
    fontWeight: 700,
    letterSpacing: '0.09em',
  },
  button: {
    fontWeight: 640,
    letterSpacing: '0.005em',
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
        borderRadius: 12,
        minHeight: 44,
        paddingInline: 18,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44,
        minHeight: 44,
        borderRadius: 11,
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
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 560,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 14,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
      },
    },
  },
};

export const appTheme = extendTheme({
  cssVarPrefix: 'qr',
  colorSchemeSelector: 'data',
  colorSchemes: {
    light: {
      palette: lightTheme.palette,
    },
    dark: {
      palette: darkTheme.palette,
    },
  },
  shape: {
    borderRadius: 14,
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
