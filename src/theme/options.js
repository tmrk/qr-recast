import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRounded from '@mui/icons-material/SettingsBrightnessRounded';
import { strings } from '../strings.js';

export const themeOptions = Object.freeze([
  { mode: 'system', label: strings.theme.system, icon: SettingsBrightnessRounded },
  { mode: 'light', label: strings.theme.light, icon: LightModeRounded },
  { mode: 'dark', label: strings.theme.dark, icon: DarkModeRounded },
]);
