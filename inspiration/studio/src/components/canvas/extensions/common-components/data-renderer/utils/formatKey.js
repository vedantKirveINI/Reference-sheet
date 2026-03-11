const formatKey = (key) => {
  if (!key) return key;

  // Handle array indices - keep them as is
  if (key.startsWith("[") && key.endsWith("]")) {
    return key;
  }

  // Split camelCase, snake_case, kebab-case, and PascalCase
  const words = key
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase -> camel Case
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // PascalCase -> Pascal Case
    .replace(/[_-]/g, " ") // snake_case, kebab-case -> spaces
    .split(" ")
    .filter((word) => word.length > 0);

  // Capitalize first letter of first word, keep others as they are
  if (words.length > 0) {
    words[0] =
      words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    for (let i = 1; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
  }

  return words.join(" ");
};

export { formatKey };
