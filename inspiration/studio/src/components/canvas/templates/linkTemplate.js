import * as go from "gojs";
import { CANVAS_BG, FROM_PORT, LINK_STROKE, TO_PORT } from "../constants";
import addNodeIcon from "../assets/add-node.svg";

import "./shapes";
import {
  hideLinkOptionAdornment,
  showLinkOptionAdornment,
} from "./template-utils";

const LINK_TEXT_MAX_WIDTH = 180;
const LINK_TEXT_FONT_SIZE = 12;

export const truncateMiddle = (text, startChars = 12, endChars = 12) => {
  if (text.length <= startChars + endChars + 5) return text;
  return `${text.slice(0, startChars)} ... ${text.slice(-endChars)}`;
};

const calculateTruncationChars = (text, maxWidth, fontSize = 14) => {
  if (!text || text.length === 0) return { startChars: 0, endChars: 0 };

  const avgCharWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  const totalMaxChars = maxCharsPerLine * 3;

  if (text.length <= totalMaxChars) {
    return { startChars: text.length, endChars: 0 };
  }

  const availableChars = totalMaxChars - 5;
  const startChars = Math.floor(availableChars * 0.6);
  const endChars = availableChars - startChars;

  return {
    startChars: Math.max(3, startChars),
    endChars: Math.max(3, endChars),
  };
};

// Function to check if text is actually truncated in the display
const isTextTruncated = (originalText, displayedText, maxLines = 3) => {
  if (!originalText || !displayedText) return false;

  // Check if text was truncated by GoJS ellipsis
  const hasEllipsis =
    displayedText.includes("…") || displayedText.includes("...");

  // Check if original text is significantly longer
  const isSignificantlyLonger =
    originalText.length > displayedText.length * 1.2;

  // Check if text has more than maxLines when split by newlines
  const lineCount = originalText.split("\n").length;
  const exceedsMaxLines = lineCount > maxLines;

  return hasEllipsis || isSignificantlyLonger || exceedsMaxLines;
};

const $ = go.GraphObject.make;
export const linkTemplate = $(
  go.Link,
  {
    name: "LINKOPTIONADORNMENTTEMPLATEGO",
    curve: go.Curve.Bezier,
    toPortId: TO_PORT,
    fromPortId: FROM_PORT,
    adjusting: go.LinkAdjusting.Stretch,
    fromEndSegmentLength: 60,
    toEndSegmentLength: 60,
    selectable: false,
    cursor: "pointer",
    zOrder: 100,
    mouseEnter: (e, link) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[linkTemplate] mouseEnter on link", {
          linkKey: link?.data?.key,
          label: link?.data?.label,
          from: link?.data?.from,
          to: link?.data?.to,
        });
      }
      showLinkOptionAdornment(link);
    },
    mouseLeave: (e, link, nextObj) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[linkTemplate] mouseLeave on link", { linkKey: link?.data?.key });
      }
      hideLinkOptionAdornment(link, nextObj);
    },
  },
  $(go.Shape, {
    strokeWidth: 3,
    stroke: LINK_STROKE,
    name: "LINKSHAPE",
  },
  ),
  $(go.Shape, {
    toArrow: "Feather",
    strokeWidth: 2,
    stroke: LINK_STROKE,
    name: "LINKARROW",
    scale: 1.6,
  },
  ),
  $(
    go.Panel,
    "Auto",
    {
      name: "LINKTEXTBLOCKPANEL",
      background: "transparent",
      segmentIndex: NaN,
      segmentFraction: 0.5,
      segmentOffset: new go.Point(0, -22),
      padding: 6,
    },
    $(go.Shape, "RoundedRectangle", {
      strokeWidth: 1,
      stroke: "#C0C4CE",
      fill: "#FFFFFF",
      parameter1: 8,
    }),
    $(
      go.TextBlock,
      {
        name: "LINKTEXTBLOCKGO",
        maxLines: 3,
        margin: new go.Margin(4, 8, 4, 8),
        isMultiline: true,
        maxSize: new go.Size(LINK_TEXT_MAX_WIDTH, 100),
        wrap: go.Wrap.Fit,
        stroke: "#6B7280",
        overflow: go.TextOverflow.Ellipsis,
        // Show tooltip only when text is truncated
        mouseEnter: (e, obj) => {
          const data = obj.part.data;
          if (data && data.label) {
            const actualText = data.label;
            const displayedText = obj.text;

            // Only show tooltip if text is actually truncated
            if (isTextTruncated(actualText, displayedText, 3)) {
              const tooltip = $(
                go.Adornment,
                "Auto",
                $(go.Shape, "RoundedRectangle", {
                  fill: "#263238E5",
                  strokeWidth: 0,
                }),
                $(go.TextBlock, {
                  margin: 4,
                  stroke: "#fff",
                  font: `${LINK_TEXT_FONT_SIZE}px sans-serif`,
                  maxLines: 10,
                  isMultiline: true,
                  maxSize: new go.Size(300, NaN),
                  text: actualText,
                })
              );

              obj.toolTip = tooltip;
            }
          }
        },
      },
      new go.Binding("text", "label", (label) => {
        if (!label) return "";

        // Calculate optimal truncation based on width and 3-line constraint
        const { startChars, endChars } = calculateTruncationChars(
          label,
          LINK_TEXT_MAX_WIDTH,
          LINK_TEXT_FONT_SIZE
        );

        // If no truncation needed, return original text
        if (endChars === 0) {
          return label;
        }

        return truncateMiddle(label, startChars, endChars);
      })
    ),
    new go.Binding("visible", "", (data) => {
      return !!data.label || false;
    })
  ),
  $(
    go.Panel,
    "Auto",
    {
      segmentIndex: NaN,
      segmentFraction: 0.5,
    },
    $(go.Picture, {
      name: "LINKADDICONPART",
      source: addNodeIcon,
      width: 1,
      height: 1,
      isActionable: true,
      cursor: "pointer",
      actionMove: (e, obj) => {
        const link = obj.part;
        if (process.env.NODE_ENV === "development") {
          console.log("[linkTemplate] actionMove on link add icon", {
            linkKey: link?.data?.key,
            from: link?.data?.from,
            to: link?.data?.to,
            hasFromPort: !!link?.fromPort,
            isReadOnly: e.diagram?.isReadOnly,
          });
        }
        const tool = e.diagram.toolManager.linkingTool;
        tool.startObject = link.fromPort;
        e.diagram.currentTool = tool;
        tool.doActivate();
      },
    }),
    new go.Binding("visible", "", (data) => {
      return !data.label;
    })
  )
);
