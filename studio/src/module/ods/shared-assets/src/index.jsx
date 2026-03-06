import "./shared/fonts/Inter-300.ttf";
import "./shared/fonts/Inter-400.ttf";
import "./shared/fonts/Inter-500.ttf";
import "./shared/styles/index.css";
import "oute-tokens/dist/tokens.css";
export * from './shared/palette/colors.jsx';
import typography from './shared/typography/index.jsx';
import palette from './shared/palette/index.jsx';

// Migrated from MUI theme to Tailwind-based theme
// This is kept for backward compatibility but components should use Tailwind classes directly
const default_theme = {
  palette,
  typography,
  // Components overrides are no longer needed with Tailwind
  // MUI component overrides have been removed
  components: {},
};

// Export Tailwind utility functions for accessing theme values
export const getThemeColor = (colorPath) => {
  // Helper to get colors from Tailwind config
  // Usage: getThemeColor('blue.500') or getThemeColor('grey.main')
  const [color, shade] = colorPath.split('.');
  if (palette[color]) {
    if (shade && palette[color][shade]) {
      return palette[color][shade];
    }
    if (palette[color].main) {
      return palette[color].main;
    }
  }
  return null;
};

// Export Tailwind class helpers for typography
export const getTypographyClass = (variant) => {
  const variantMap = {
    h1: 'text-h1',
    h2: 'text-h2',
    h3: 'text-h3',
    h4: 'text-h4',
    h5: 'text-h5',
    h6: 'text-h6',
    body1: 'text-body1',
    body2: 'text-body2',
    subtitle1: 'text-subtitle1',
    subtitle2: 'text-subtitle2',
    caption: 'text-caption',
    overline: 'text-overline',
    xsmallchip: 'text-xsmallchip',
    capital: 'text-capital',
  };
  return variantMap[variant] || 'text-body1';
};

export default default_theme;
