function rgbaToHex(rgbaColor: string) {
  if (!rgbaColor.startsWith("rgba(")) {
    return rgbaColor;
  }

  const rgb = rgbaColor
    .substring(5, rgbaColor.length - 1)
    .split(",")
    .map((value) => parseInt(value.trim(), 10));

  const r = rgb[0].toString(16).padStart(2, "0");
  const g = rgb[1].toString(16).padStart(2, "0");
  const b = rgb[2].toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

export default rgbaToHex;
