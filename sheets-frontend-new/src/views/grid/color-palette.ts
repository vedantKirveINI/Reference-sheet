/** Standard row: common colors (black, white, blue, red, orange, yellow, green, teal, purple). No custom-add; display only. */
export const STANDARD_COLORS: string[] = [
  '#000000',
  '#ffffff',
  '#4a86e8',
  '#e06666',
  '#f6b26b',
  '#ffd966',
  '#93c47d',
  '#76a5af',
  '#8e7cc3',
  '#e69138',
];

/** Main RGB-style palette: grayscale row + 5 rows of hues (10 columns). Sent as hex to backend unchanged. */
export const MAIN_PALETTE_ROWS: string[][] = [
  // Row 0: grayscale
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
  // Row 1: reds / pinks
  ['#980000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#351c75', '#741b47', '#cc0000', '#e69138'],
  // Row 2: lighter reds / oranges / yellows
  ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c', '#ffe599'],
  // Row 3: greens / teals / blues
  ['#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
  // Row 4: pastels
  ['#d0e0e3', '#f3e5f5', '#e1bee7', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#a5d6a7', '#dcedc8'],
  // Row 5: darker / saturated
  ['#4c1130', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#6b2d5c', '#2d5016', '#0d7377', '#1a5f7a', '#2c3e50'],
];
