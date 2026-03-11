import {
  borderRadiusMappingForButton,
  QuestionAlignments,
  TTheme,
  ViewPort,
} from "@oute/oute-ds.core.constants";

// Convert hex color (#RRGGBB or #RGB) to rgba string with the given alpha
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return "rgba(0,0,0," + String(alpha) + ")";
  const normalized = hex.replace("#", "");
  const isShort = normalized.length === 3;
  const r = parseInt(
    isShort ? normalized[0] + normalized[0] : normalized.substring(0, 2),
    16
  );
  const g = parseInt(
    isShort ? normalized[1] + normalized[1] : normalized.substring(2, 4),
    16
  );
  const b = parseInt(
    isShort ? normalized[2] + normalized[2] : normalized.substring(4, 6),
    16
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const opinionScaleStyles = {
  container: ({ defaultAlignment, isCreator, viewPort }) => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems:
        defaultAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
      justifyContent:
        defaultAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
      width: "100%",
      flexWrap: !isCreator && viewPort === ViewPort.MOBILE ? "wrap" : "nowrap",
      gap: "1em",
    } as const;
  },
  starWrap: ({ theme, isSelected }: { theme: TTheme; isSelected: boolean }) => {
    return {
      display: "flex",
      width: "3.5em",
      height: "3.5em",
      aspectRatio: "1/1",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75em",
      borderRadius: borderRadiusMappingForButton[theme?.styles?.buttonCorners],
      border: `1px solid ${theme?.styles?.buttons}`,
      backgroundColor: isSelected
        ? theme?.styles?.buttonText
        : hexToRgba(theme?.styles?.buttons as unknown as string, 0.3),
    } as const;
  },

  color: (theme: TTheme, isSelected: boolean) => {
    return {
      color: isSelected ? theme?.styles?.buttons : theme?.styles?.buttonText,
      fontFamily: theme?.styles?.fontFamily,
    } as const;
  },
};
