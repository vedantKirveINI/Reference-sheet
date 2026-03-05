export const getInputStyles = (options: any) => {
  const { color, fontSize = "1em", fontFamily, fontWeight, opacity = 1 } = options || {};
  const styles = {} as any; //token("typography.form.interface.regular.l");
  // styles.color = token("color.content.black");
  if (color) {
    styles.color = color;
  }
  if (fontSize) {
    styles.fontSize = fontSize;
  }
  if (fontFamily) {
    styles.fontFamily = fontFamily;
  }
  if (fontWeight !== undefined) {
    styles.fontWeight = fontWeight;
  }
  if (opacity) {
    styles.opacity = opacity;
  }
  return styles;
};

export const getEditorContaainerStyles = ({ style }: any) => {
  return {
    position: "relative",
    ...style,
  } as const;
};

export function getPlaceholderColor(hex: string, opacity: number) {
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
    return { color: hex, opacity };
  }

  if (hex.length === 4) {
    hex = "#" + [...hex.slice(1)].map((char) => char + char).join("");
  }

  const [r, g, b] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  return {
    color: `rgba(${r}, ${g}, ${b}, ${opacity})`,
  };
}
