import { DEFAULT_THEME } from "@/module/panels/ThemeManager/constants";
import { themeToLegacyShape } from "@/module/panels/ThemeManager/utils/themeShapeUtils";

/** Returns theme in legacy shape (theme.styles with questionSize, etc.) for question nodes and preview. */
export const getDefaultTheme = (themeRef) => {
  const raw = themeRef?.current || DEFAULT_THEME;
  return themeToLegacyShape(raw);
};
