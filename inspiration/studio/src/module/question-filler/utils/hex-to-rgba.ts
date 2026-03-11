function hexToRgba(hex: string, darkness: number = 1): string {
  // Check if the hex value is valid
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexRegex.test(hex)) {
    return hex; // Return the original value if it's not a valid hex
  }

  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Expand shorthand hex to full hex (e.g., #F53 to #FF5533)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Convert hex to RGB
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Apply darkness factor (clamp darkness between 0 and 1)
  const clampedDarkness = Math.max(0, Math.min(1, darkness));
  r = Math.floor(r * clampedDarkness);
  g = Math.floor(g * clampedDarkness);
  b = Math.floor(b * clampedDarkness);

  // Ensure opacity is between 0 and 1

  // Return the RGBA string
  return `rgba(${r}, ${g}, ${b}, ${1})`;
}

export { hexToRgba };
