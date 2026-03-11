type TextTransform = "Uppercase" | "Lowercase" | "Capitalize" | "None" | "uppercase" | "lowercase" | "capitalize" | "none";

function transformText(text: string, textTransform: TextTransform | string): string {
  const normalized = typeof textTransform === "string" ? textTransform.toLowerCase() : "";
  switch (normalized) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text.replace(/\b\w/g, (match) => match.toUpperCase());
    case "none":
      return text;
    default:
      return text;
  }
}

export default transformText;
