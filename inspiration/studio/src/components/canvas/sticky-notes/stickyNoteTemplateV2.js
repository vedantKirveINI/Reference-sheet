import * as go from "gojs";
import { STICKY_NOTES_LAYER } from "../constants";
import RealtimeTextEditor from "../templates/realTimeTextEditor";
import { STICKY_NOTE_DEFAULTS } from "./StickyNoteToolbar";

const $ = go.GraphObject.make;

const MIN_SIZE = new go.Size(120, 80);
const DEFAULT_SIZE = new go.Size(200, 150);

function buildFontString(data) {
  const size = data.fontSize || STICKY_NOTE_DEFAULTS.fontSize;
  const fontFamily = "Inter, system-ui, sans-serif";
  let fontStyle = "";

  if (data.isBold) fontStyle += "bold ";
  if (data.isItalic) fontStyle += "italic ";

  return `${fontStyle}${size} ${fontFamily}`.trim();
}

const stickyNodeSelectionAdornment = $(
  go.Adornment,
  "Auto",
  $(go.Shape, "RoundedRectangle", {
    fill: null,
    stroke: "#3B82F6",
    strokeWidth: 2,
    strokeDashArray: [4, 2],
    parameter1: 8,
  }),
  $(go.Placeholder, { padding: 2 })
);

const resizeAdornmentTemplate = $(
  go.Adornment,
  "Spot",
  $(go.Placeholder),
  $(go.Shape, "Circle", {
    alignment: go.Spot.TopLeft,
    cursor: "nw-resize",
    desiredSize: new go.Size(8, 8),
    fill: "white",
    stroke: "#3B82F6",
    strokeWidth: 1.5,
  }),
  $(go.Shape, "Circle", {
    alignment: go.Spot.TopRight,
    cursor: "ne-resize",
    desiredSize: new go.Size(8, 8),
    fill: "white",
    stroke: "#3B82F6",
    strokeWidth: 1.5,
  }),
  $(go.Shape, "Circle", {
    alignment: go.Spot.BottomLeft,
    cursor: "sw-resize",
    desiredSize: new go.Size(8, 8),
    fill: "white",
    stroke: "#3B82F6",
    strokeWidth: 1.5,
  }),
  $(go.Shape, "Circle", {
    alignment: go.Spot.BottomRight,
    cursor: "se-resize",
    desiredSize: new go.Size(8, 8),
    fill: "white",
    stroke: "#3B82F6",
    strokeWidth: 1.5,
  })
);

export function createStickyNoteTemplateV2(handlers = {}) {
  const { onMouseEnter, onMouseLeave } = handlers;

  return $(
    go.Node,
    "Auto",
    {
      layerName: STICKY_NOTES_LAYER,
      resizable: true,
      resizeObjectName: "SHAPE",
      resizeAdornmentTemplate: resizeAdornmentTemplate,
      minSize: MIN_SIZE,
      selectionAdornmentTemplate: stickyNodeSelectionAdornment,
      isLayoutPositioned: false,
      shadowOffset: new go.Point(0, 4),
      shadowBlur: 12,
      shadowColor: "rgba(0, 0, 0, 0.08)",
      isShadowed: true,
      cursor: "move",
      mouseEnter: (e, node) => {
        if (e.diagram.currentTool instanceof go.TextEditingTool) {
          return;
        }
        onMouseEnter?.(e, node);
      },
      mouseLeave: (e, node, nextObj) => {
        onMouseLeave?.(e, node, nextObj);
      },
      doubleClick: (e, node) => {
        const textBlock = node.findObject("TEXT");
        if (textBlock) {
          e.diagram.commandHandler.editTextBlock(textBlock);
        }
      },
    },
    new go.Binding("location", "location", go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
      go.Size.stringify
    ),
    $(
      go.Shape,
      "RoundedRectangle",
      {
        name: "SHAPE",
        fill: STICKY_NOTE_DEFAULTS.backgroundColor,
        stroke: null,
        strokeWidth: 0,
        parameter1: 8,
        minSize: MIN_SIZE,
        desiredSize: DEFAULT_SIZE,
      },
      new go.Binding("fill", "backgroundColor").makeTwoWay(),
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
        go.Size.stringify
      )
    ),
    $(
      go.TextBlock,
      {
        name: "TEXT",
        stretch: go.Stretch.Fill,
        margin: new go.Margin(12, 12, 12, 12),
        overflow: go.TextOverflow.Clip,
        wrap: go.Wrap.Fit,
        font: buildFontString(STICKY_NOTE_DEFAULTS),
        stroke: STICKY_NOTE_DEFAULTS.fontColor,
        editable: true,
        textEditor: RealtimeTextEditor,
        textAlign: "left",
        verticalAlignment: go.Spot.Top,
        cursor: "text",
        isMultiline: true,
      },
      new go.Binding("text").makeTwoWay(),
      new go.Binding("stroke", "fontColor"),
      new go.Binding("textAlign"),
      new go.Binding("font", "", buildFontString),
      new go.Binding("isUnderline", "isUnderline")
    )
  );
}

export const stickyNoteTemplateV2 = createStickyNoteTemplateV2();
