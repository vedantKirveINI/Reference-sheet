import { getCanvasTheme } from "../../module/constants";
import * as go from "gojs";

export const NODE_SHADOW_COLOR = "rgba(87, 141, 190, 0.25)";

export const TO_PORT = "to-port";
export const FROM_PORT = "from-port";
const canvasTheme = getCanvasTheme();

export const CANVAS_BG = "#FAFCFE";
export const LINK_STROKE = new go.Brush("Linear", {
  0: canvasTheme.dark,
  1: canvasTheme.light,
});
export const ERROR_LINK_STROKE = new go.Brush("Linear", {
  0: "#EF4444",
  1: "#F97316",
});
export const SELECTION_ADORNMENT_COLOR = new go.Brush("Linear", {
  0: canvasTheme.dark,
  1: canvasTheme.light,
});

export const diagramScaleOptions = [
  { id: 0.25, label: "25%" },
  { id: 0.5, label: "50%" },
  { id: 0.75, label: "75%" },
  { id: 1, label: "100%" },
  { id: 1.25, label: "125%" },
  { id: 1.5, label: "150%" },
  { id: 2, label: "200%" },
];

export const STICKY_NOTES_LAYER = "StickyNotesLayer";

export const NODE_HORIZONTAL_OFFSET = 300;
export const NODE_SEARCH_RADIUS = 9999;
export const ANIMATION_DURATION_MS = 500;
export const SCROLL_ANIMATION_DURATION_MS = 300;
export const VIEWPORT_CHECK_DEBOUNCE_MS = 500;
