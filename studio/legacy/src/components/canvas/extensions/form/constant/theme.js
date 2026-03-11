import { getCanvasTheme } from "../../../../../module/constants";

const canvasTheme = getCanvasTheme();

export const CONNECTION_NODE_THEME = {
  background: canvasTheme.background,
  foreground: canvasTheme.foreground,
  dark: canvasTheme.dark,
  light: canvasTheme.light,
};
