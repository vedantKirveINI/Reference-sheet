export function singularize(word) {
  if (!word || typeof word !== "string") {
    return "Item";
  }

  if (word.endsWith("ies") && word.length > 3) {
    return word.slice(0, -3) + "y";
  }

  if (word.endsWith("s") && word.length > 1) {
    return word.slice(0, -1);
  }

  // If no 's' at the end, return the original word
  return word;
}
