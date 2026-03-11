/*
 *  Copyright 1998-2025 by Northwoods Software Corporation. All Rights Reserved.
 */

/*
 * This is an extension and not part of the main GoJS library.
 * Note that the API for this class may change with any version, even point releases.
 * If you intend to use an extension in production, you should copy the code to your own source directory.
 * Extensions can be found in the GoJS kit under the extensions or extensionsJSM folders.
 * See the Extensions intro page (https://gojs.net/latest/intro/extensions.html) for more information.
 */

import * as go from "gojs";

// This is the definitions of the predefined text editor used by TextEditingTool
// when you set or bind TextBlock.editable to true.
// The source code for this is at extensionsJSM/RealtimeTextEditor.ts.
// You do not need to load this file in order to use in-place text editing.

// HTML + JavaScript text editor menu, made with HTMLInfo
// This is a re-implementation of the default text editor
// This file exposes one instance of HTMLInfo, window.RealtimeTextEditor
// Typical usage is:
// ```js
//   new go.Diagram(...,
//      {
//        'textEditingTool.defaultTextEditor': window.RealtimeTextEditor,
//        . . .
//      })
// ```
// or:
// ```js
//    myDiagram.toolManager.textEditingTool.defaultTextEditor = window.RealtimeTextEditor;
// ```
// ```js
//   new go.Node(. . .)
//     .add(
//       . . .
//       new go.TextBlock({ textEditor: window.RealtimeTextEditor, . . . })
//       . . .
//     )
// ```
// If you do use this code, copy it into your project and modify it there.
// See also RealtimeTextEditor.html

const RealtimeTextEditor = new go.HTMLInfo();

const textarea = document.createElement("textarea");

textarea.addEventListener(
  "input",
  function (e) {
    const tool = RealtimeTextEditor.tool;
    if (tool.textBlock === null) return;
    tool.diagram.startTransaction();
    tool.textBlock.text = textarea.value;
    tool.diagram.commitTransaction("input text");
    if (!RealtimeTextEditor.fixedSize) {
      const tempText = tool.measureTemporaryTextBlock(textarea.value);
      const scale = textarea.textScale;
      textarea.style.width =
        2 +
        Math.max(
          tool.textBlock.measuredBounds.width,
          tempText.measuredBounds.width
        ) *
          scale +
        "px";
      textarea.rows = Math.max(tool.textBlock.lineCount, tempText.lineCount);
    }
  },
  false
);

textarea.addEventListener(
  "keydown",
  function (e) {
    if (e.isComposing) return;
    const tool = RealtimeTextEditor.tool;
    const tb = tool.textBlock;
    if (tb === null) return;
    const key = e.key;
    if (key === "Enter") {
      // Enter
      if (tb.isMultiline === false) e.preventDefault();
      tool.acceptText(go.TextEditingAccept.Enter);
      return;
    } else if (key === "Tab") {
      // Tab
      tool.acceptText(go.TextEditingAccept.Tab);
      e.preventDefault();
      return;
    } else if (key === "Escape") {
      // Esc
      tool.doCancel();
      tool.diagram.startTransaction();
      tb.text = RealtimeTextEditor.originalString;
      tool.diagram.commitTransaction("cancel text edit");
      if (tool.diagram !== null) tool.diagram.doFocus();
    }
  },
  false
);

// handle focus:
textarea.addEventListener(
  "focus",
  function (e) {
    const tool = RealtimeTextEditor.tool;
    if (
      !tool ||
      tool.currentTextEditor === null ||
      tool.state === go.TextEditingState.None
    )
      return;
    if (tool.state === go.TextEditingState.Active) {
      tool.state = go.TextEditingState.Editing;
    }
    if (typeof textarea.select === "function" && tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  },
  false
);

// Disallow blur.
// If the textEditingTool blurs and the text is not valid,
// we do not want focus taken off the element just because a user clicked elsewhere.
textarea.addEventListener(
  "blur",
  function (e) {
    const tool = RealtimeTextEditor.tool;
    if (
      !tool ||
      tool.currentTextEditor === null ||
      tool.state === go.TextEditingState.None
    )
      return;
    if (typeof textarea.focus === "function") textarea.focus();
    if (typeof textarea.select === "function" && tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  },
  false
);

RealtimeTextEditor.valueFunction = function () {
  return textarea.value;
};

RealtimeTextEditor.mainElement = textarea; // to reference it more easily

RealtimeTextEditor.tool = null; // Initialize

// used to be in doActivate
RealtimeTextEditor.show = function (textBlock, diagram, tool) {
  if (!(textBlock instanceof go.TextBlock)) return;
  if (!diagram || !diagram.div) return;
  if (!(tool instanceof go.TextEditingTool)) return;
  if (RealtimeTextEditor.tool) return; // Only one at a time.

  RealtimeTextEditor.tool = tool; // remember the TextEditingTool for use by listeners
  RealtimeTextEditor.originalString = textBlock.text;
  const part = textBlock.part;
  RealtimeTextEditor.fixedSize =
    part && part.data.size && part.data.size !== "NaN NaN";

  // This is called during validation, if validation failed:
  if (tool.state === go.TextEditingState.Invalid) {
    textarea.style.border = "3px solid red";
    textarea.focus();
    return;
  }

  // This part is called during initialization:
  const loc = textBlock.getDocumentPoint(go.Spot.Center);
  const pos = diagram.position;
  const sc = diagram.scale;
  let textscale = textBlock.getDocumentScale() * sc;
  // if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale;
  // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
  // +6 is firefox minimum, otherwise lines will be wrapped improperly
  const textwidth = textBlock.naturalBounds.width * textscale + 6;
  const textheight = textBlock.naturalBounds.height * textscale + 2;
  const left = (loc.x - pos.x) * sc;
  const yCenter = (loc.y - pos.y) * sc; // this is actually the center, used to set style.top
  const valign = textBlock.verticalAlignment;
  const oneLineHeight =
    textBlock.lineHeight + textBlock.spacingAbove + textBlock.spacingBelow;
  const allLinesHeight = oneLineHeight * textBlock.lineCount * textscale;
  const center = 0.5 * textheight - 0.5 * allLinesHeight;
  // add offset to yCenter to get the appropriate position:
  const yOffset =
    valign.y * textheight -
    valign.y * allLinesHeight +
    valign.offsetY -
    center -
    allLinesHeight / 2;

  textarea.value = textBlock.text;
  // the only way you can mix font and fontSize is if the font inherits and the fontSize overrides
  // in the future maybe have textarea contained in its own div
  diagram.div.style["font"] = textBlock.font;

  const paddingsize = 0;
  textarea.style["position"] = "absolute";
  textarea.style["zIndex"] = "100";
  textarea.style["font"] = "inherit";
  textarea.style["fontSize"] = textscale * 100 + "%";
  textarea.style["lineHeight"] = "normal";
  textarea.style["width"] = textwidth + "px";
  if (RealtimeTextEditor.fixedSize) {
    textarea.style["height"] = textheight + "px";
  }
  textarea.style["left"] =
    ((left - textwidth / 2) | 0) - paddingsize + 2 + "px";
  textarea.style["top"] = ((yCenter + yOffset) | 0) - paddingsize + "px";
  textarea.style["textAlign"] = textBlock.textAlign;
  textarea.style["margin"] = "0";
  textarea.style["padding"] = paddingsize + "px";
  textarea.style["border"] = "0";
  textarea.style["outline"] = "none";
  textarea.style["whiteSpace"] = "pre-wrap";
  textarea.style["overflow"] = "hidden"; // for proper IE wrap
  textarea.style["resize"] = "none";
  textarea.rows = textBlock.lineCount;
  textarea.textScale = textscale; // attach a value to the textarea, for convenience
  textarea.className = "goTXarea";

  // Show:
  diagram.div.appendChild(textarea);

  // After adding, focus:
  textarea.focus();
  if (tool.selectsTextOnActivate) {
    textarea.select();
    textarea.setSelectionRange(0, 9999);
  }
};

RealtimeTextEditor.hide = function (diagram, tool) {
  RealtimeTextEditor.tool = null; // forget reference to TextEditingTool
  if (diagram.div) diagram.div.removeChild(textarea);
};

export default RealtimeTextEditor;
