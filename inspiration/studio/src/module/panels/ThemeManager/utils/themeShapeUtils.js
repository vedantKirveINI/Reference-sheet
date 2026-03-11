/**
 * Normalize any theme shape to legacy form expected by question nodes and form components.
 * Legacy shape: { name?, id?, _id?, styles: { fontFamily, questionSize, buttonCorners, textAlignment, questions, description, answer, buttons, buttonText, backgroundColor, backgroundImage } }
 */

const DEFAULT_STYLES = {
  fontFamily: "Helvetica Neue",
  questionSize: "M",
  buttonCorners: "rounded",
  textAlignment: "center",
  questions: "#263238",
  description: "#263238",
  answer: "#263238",
  buttons: "#000000",
  buttonText: "#FFFFFF",
  backgroundColor: "#FFFFFF",
  backgroundImage: "",
};

function buttonCornersFromBorderRadius(borderRadius) {
  if (!borderRadius) return "rounded";
  const v = String(borderRadius).toLowerCase();
  if (v === "9999px" || v === "50%" || v.includes("9999")) return "circular";
  if (v === "0" || v === "0px") return "square";
  return "rounded";
}

function borderRadiusFromCorners(buttonCorners) {
  if (buttonCorners === "circular" || buttonCorners === "pill") return "9999px";
  if (buttonCorners === "square") return "0px";
  return "8px";
}

/**
 * Convert SDK-shaped theme (theme.theme.*) to legacy shape (theme.styles).
 * @param {Object} theme - Theme in SDK or legacy or mixed shape
 * @returns {Object} Theme with at least { name?, styles } for consumption by question nodes
 */
export function themeToLegacyShape(theme) {
  if (!theme || typeof theme !== "object") {
    return { name: "Custom Theme", styles: { ...DEFAULT_STYLES } };
  }

  // Already legacy (has styles, no nested theme.theme)
  if (theme.styles && !theme.theme) {
    return {
      ...theme,
      name: theme.name ?? "Custom Theme",
      styles: { ...DEFAULT_STYLES, ...theme.styles },
    };
  }

  // SDK format: theme.theme with font, background, components.button, logo
  if (theme.theme) {
    const t = theme.theme;
    const font = t?.font;
    const background = t?.background;
    const button = t?.components?.button;
    const questionColor = font?.question?.color ?? DEFAULT_STYLES.questions;
    const descriptionColor = font?.description?.color ?? questionColor;
    const buttonCorners = button
      ? buttonCornersFromBorderRadius(button.borderRadius)
      : DEFAULT_STYLES.buttonCorners;

    return {
      ...theme,
      name: theme.name ?? "Custom Theme",
      theme: undefined,
      styles: {
        fontFamily: font?.question?.family ?? DEFAULT_STYLES.fontFamily,
        questionSize: font?.size ?? DEFAULT_STYLES.questionSize,
        buttonCorners,
        textAlignment: font?.alignment ?? DEFAULT_STYLES.textAlignment,
        questions: questionColor,
        description: descriptionColor,
        answer: font?.answer?.color ?? DEFAULT_STYLES.answer,
        buttons: button?.background ?? DEFAULT_STYLES.buttons,
        buttonText: button?.text ?? DEFAULT_STYLES.buttonText,
        backgroundColor: background?.color ?? DEFAULT_STYLES.backgroundColor,
        backgroundImage: background?.image ?? DEFAULT_STYLES.backgroundImage,
      },
    };
  }

  // Partial or unknown: ensure styles exist
  return {
    ...theme,
    name: theme.name ?? "Custom Theme",
    styles: { ...DEFAULT_STYLES, ...(theme.styles || {}) },
  };
}

export { buttonCornersFromBorderRadius, borderRadiusFromCorners, DEFAULT_STYLES };
