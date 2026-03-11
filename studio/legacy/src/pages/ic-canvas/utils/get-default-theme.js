import { DEFAULT_THEME } from "@oute/oute-ds.atom.theme-manager/default-theme";

export const getDefaultTheme = (themeRef) => {
  return (
    themeRef?.current ||
    DEFAULT_THEME
  );
};
