import "./shared/fonts/Inter-300.ttf";
import "./shared/fonts/Inter-400.ttf";
import "./shared/fonts/Inter-500.ttf";
import "./shared/styles/index.css";
import "oute-tokens/dist/tokens.css";
export * from './shared/palette/colors.jsx';
import typography from './shared/typography/index.jsx';
import palette from './shared/palette/index.jsx';
import components from './shared/components/index.jsx';
import * as colors from "@mui/material/colors";
const default_theme = {
  palette: {
    ...colors,
    ...palette,
  },
  typography,
  components,
};
export default default_theme;
