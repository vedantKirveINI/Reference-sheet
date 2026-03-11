import * as go from "gojs";
import { STICKY_NOTES_LAYER } from "../constants";
import RealtimeTextEditor from "./realTimeTextEditor";

const $ = go.GraphObject.make;

// Define colors for background and font
const backgroundColors = [
  "lightyellow",
  "lightgreen",
  "lightblue",
  "lightpink",
  "white",
];
const fontColors = ["black", "darkblue", "darkred", "darkgreen", "purple"];

// Define text alignment options
const textAlignments = [
  { name: "Left", value: "left", icon: "▎Text" },
  { name: "Center", value: "center", icon: "▎ Text ▎" },
  { name: "Right", value: "right", icon: "Text ▎" },
];

// Define font size options
const fontSizes = [
  { name: "Small", value: "12px" },
  { name: "Medium", value: "16px" },
  { name: "Large", value: "20px" },
  { name: "ExtraLarge", value: "40px" },
];

// Minimum size for sticky notes
const MIN_SIZE = new go.Size(100, 50);

// Track the currently open menu adornment
let currentOpenMenu = null;

// Create a selection adornment
const stickyNodeAdornment = $(go.Adornment, "Spot").add(
  $(go.Panel, "Auto").add(
    $(go.Placeholder),
    $(go.Shape, { fill: "transparent", stroke: "transparent" })
  )
);

// Track whether the mouse is over the adornment or node
let isOverAdornment = false;
let isOverNode = false;
let menuIsOpen = false;

// Helper function to build the font string based on style properties
function buildFontString(data) {
  const size = data.fontSize || "16px";
  const fontFamily = "Inter";
  let fontStyle = "";

  if (data.isBold) fontStyle += "bold ";
  if (data.isItalic) fontStyle += "italic ";

  return `${fontStyle}${size} ${fontFamily}`;
}

// Helper function to create and position a submenu
function createSubmenu(diagram, button, adorn, node, title, content) {
  // Close any existing open menu
  if (currentOpenMenu) {
    diagram.remove(currentOpenMenu);
    currentOpenMenu = null;
  }

  // Get the position of the adornment panel (the toolbar)
  const adornmentPanel = adorn.findObject("ButtonPanel");
  if (!adornmentPanel) return;

  // Calculate a point above the adornment panel with increased vertical offset
  // Use the button's horizontal position but position it much higher above the toolbar
  const localPoint = new go.Point(
    title === "Font Size"
      ? button.actualBounds.width / 2 + 20
      : button.actualBounds.width / 2,
    -adornmentPanel.actualBounds.height - 40 // Increased vertical offset
  );

  // Convert to document coordinates relative to the button
  const docPoint = button.getDocumentPoint(localPoint);

  // Create the menu adornment
  const menuAdorn = $(
    go.Adornment,
    "Vertical",
    {
      position: docPoint,
      background: "white",
      shadowVisible: true,
      shadowOffset: new go.Point(3, 3),
      shadowBlur: 5,
      shadowColor: "rgba(0,0,0,0.2)",
      mouseEnter: (e, obj) => {
        menuIsOpen = true;
      },
      mouseLeave: (e, obj) => {
        menuIsOpen = false;
        diagram.remove(obj);
        currentOpenMenu = null;
      },
    },
    $(go.TextBlock, title, {
      margin: 5,
      font: "bold 10px sans-serif",
      stroke: "#555555",
    }),
    content
  );

  // Add the menu directly to the diagram
  diagram.add(menuAdorn);
  currentOpenMenu = menuAdorn;
  menuIsOpen = true;

  return menuAdorn;
}

// Create a hover adornment with formatting buttons
const createHoverAdornment = (node) => {
  // Create the main adornment with category buttons
  const adornment = $(
    go.Adornment,
    "Spot",
    {
      adornedObject: node,
      mouseEnter: (e, obj) => {
        isOverAdornment = true;
      },
      mouseLeave: (e, obj) => {
        isOverAdornment = false;
        // Give a small delay before checking if we should remove the adornment
        setTimeout(() => {
          if (!isOverAdornment && !isOverNode && !menuIsOpen) {
            const node = obj.adornedPart;
            if (node) node.removeAdornment("ColorPalette");
          }
        }, 1000);
      },
    },
    $(go.Placeholder),
    $(
      go.Panel,
      "Horizontal",
      {
        name: "ButtonPanel", // Add this name to reference the panel
        alignment: new go.Spot(1, 0, 0, -5),
        alignmentFocus: go.Spot.BottomRight,
        margin: new go.Margin(0, 0, 8, 0),
      },
      // Color category button
      $(
        go.Panel,
        "Auto",
        {
          name: "ColorButton",
          margin: new go.Margin(0, 6, 0, 0), // Spacing between buttons
          cursor: "pointer",
          isActionable: true, // Added back
          click: (e, obj) => {
            const diagram = e.diagram;
            if (!diagram) return;

            // Get the button and its parent adornment
            const button = obj;
            if (!button) return;

            const adorn = button.part;
            if (!adorn) return;

            const node = adorn.adornedPart;
            if (!node) return;

            // Create background color submenu content
            const content = $(
              go.Panel,
              "Horizontal",
              { margin: 5, defaultStretch: go.GraphObject.Fill },
              ...backgroundColors.map((color) =>
                $(
                  go.Shape,
                  "Circle",
                  {
                    width: 24,
                    height: 24,
                    margin: 2,
                    fill: color,
                    stroke: "#CCCCCC",
                    strokeWidth: 1,
                    cursor: "pointer",
                    isActionable: true,
                    click: (e, shape) => {
                      const adorn = shape.part;
                      if (!adorn) return;
                      const diagram = e.diagram;
                      if (!diagram) return;

                      diagram.startTransaction("change background color");
                      diagram.model.setDataProperty(
                        node.data,
                        "backgroundColor",
                        color
                      );
                      diagram.commitTransaction("change background color");

                      // Remove the menu
                      diagram.remove(adorn);
                      currentOpenMenu = null;
                      menuIsOpen = false;
                    },
                  },
                  new go.Binding("stroke", "", (data) => {
                    if (node && node.data.backgroundColor === color) {
                      return "black";
                    }
                    return "#CCCCCC";
                  }).ofObject()
                )
              )
            );

            createSubmenu(
              diagram,
              button,
              adorn,
              node,
              "Background Color",
              content
            );
          },
        },
        // Create a layered effect for shadow
        $(go.Shape, "RoundedRectangle", {
          fill: "rgba(0,0,0,0.05)",
          stroke: null,
          parameter1: 7, // corner radius
          spot1: new go.Spot(0, 0, 1, 1),
          spot2: new go.Spot(1, 1, 1, 1),
        }),
        $(go.Shape, "RoundedRectangle", {
          fill: "white",
          stroke: "#E0E0E0",
          strokeWidth: 1,
          width: 32,
          height: 32,
          parameter1: 6, // corner radius
        }),
        // Create a color palette icon using standard shapes
        $(
          go.Panel,
          "Vertical",
          { alignment: go.Spot.Center },
          $(
            go.Panel,
            "Horizontal",
            { alignment: go.Spot.Center },
            $(go.Shape, "Circle", {
              fill: "red",
              stroke: null,
              width: 8,
              height: 8,
              margin: 1,
            }),
            $(go.Shape, "Circle", {
              fill: "green",
              stroke: null,
              width: 8,
              height: 8,
              margin: 1,
            })
          ),
          $(
            go.Panel,
            "Horizontal",
            { alignment: go.Spot.Center },
            $(go.Shape, "Circle", {
              fill: "blue",
              stroke: null,
              width: 8,
              height: 8,
              margin: 1,
            }),
            $(go.Shape, "Circle", {
              fill: "yellow",
              stroke: null,
              width: 8,
              height: 8,
              margin: 1,
            })
          )
        )
      ),
      // Text color button
      $(
        go.Panel,
        "Auto",
        {
          name: "TextColorButton",
          margin: new go.Margin(0, 6, 0, 0), // Spacing between buttons
          cursor: "pointer",
          isActionable: true, // Added back
          click: (e, obj) => {
            const diagram = e.diagram;
            if (!diagram) return;

            // Get the button and its parent adornment
            const button = obj;
            if (!button) return;

            const adorn = button.part;
            if (!adorn) return;

            const node = adorn.adornedPart;
            if (!node) return;

            // Create text color submenu content
            const content = $(
              go.Panel,
              "Horizontal",
              { margin: 5, defaultStretch: go.GraphObject.Fill },
              ...fontColors.map((color) =>
                $(
                  go.Shape,
                  "Circle",
                  {
                    width: 24,
                    height: 24,
                    margin: 2,
                    fill: color === "black" ? "#222" : color,
                    stroke: "#CCCCCC",
                    strokeWidth: 1,
                    cursor: "pointer",
                    isActionable: true,
                    click: (e, shape) => {
                      const adorn = shape.part;
                      if (!adorn) return;
                      const diagram = e.diagram;
                      if (!diagram) return;

                      diagram.startTransaction("change text color");
                      diagram.model.setDataProperty(
                        node.data,
                        "fontColor",
                        color
                      );
                      diagram.commitTransaction("change text color");

                      // Remove the menu
                      diagram.remove(adorn);
                      currentOpenMenu = null;
                      menuIsOpen = false;
                    },
                  },
                  new go.Binding("stroke", "", (data) => {
                    if (node && node.data.fontColor === color) {
                      return "white";
                    }
                    return "#CCCCCC";
                  }).ofObject()
                )
              )
            );

            createSubmenu(diagram, button, adorn, node, "Text Color", content);
          },
        },
        // Create a layered effect for shadow
        $(go.Shape, "RoundedRectangle", {
          fill: "rgba(0,0,0,0.05)",
          stroke: null,
          parameter1: 7, // corner radius
          spot1: new go.Spot(0, 0, 1, 1),
          spot2: new go.Spot(1, 1, 1, 1),
        }),
        $(go.Shape, "RoundedRectangle", {
          fill: "white",
          stroke: "#E0E0E0",
          strokeWidth: 1,
          width: 32,
          height: 32,
          parameter1: 6, // corner radius
        }),
        $(go.TextBlock, "A", {
          font: "bold 16px serif",
          stroke: "black",
          alignment: go.Spot.Center,
        })
      ),
      // Style category button
      $(
        go.Panel,
        "Auto",
        {
          name: "StyleButton",
          margin: new go.Margin(0, 6, 0, 0), // Spacing between buttons
          cursor: "pointer",
          isActionable: true, // Added back
          click: (e, obj) => {
            const diagram = e.diagram;
            if (!diagram) return;

            // Get the button and its parent adornment
            const button = obj;
            if (!button) return;

            const adorn = button.part;
            if (!adorn) return;

            const node = adorn.adornedPart;
            if (!node) return;

            // Create text style submenu content
            const content = $(
              go.Panel,
              "Horizontal",
              { margin: 5, defaultStretch: go.GraphObject.Fill },
              $(
                go.Panel,
                "Auto",
                {
                  margin: 2,
                  background: "white",
                  cursor: "pointer",
                  isActionable: true,
                  click: (e, panel) => {
                    const adorn = panel.part;
                    if (!adorn) return;
                    const diagram = e.diagram;
                    if (!diagram) return;

                    const isBold = node.data.isBold || false;
                    diagram.startTransaction("toggle bold");
                    diagram.model.setDataProperty(node.data, "isBold", !isBold);
                    diagram.commitTransaction("toggle bold");

                    // Remove the menu
                    diagram.remove(adorn);
                    currentOpenMenu = null;
                    menuIsOpen = false;
                  },
                },
                $(go.Shape, "Rectangle", {
                  fill: "transparent",
                  stroke: "#CCCCCC",
                  strokeWidth: 1,
                  width: 30,
                  height: 30,
                }),
                $(go.TextBlock, "B", {
                  font: "bold 14px serif",
                  stroke: "black",
                  alignment: go.Spot.Center,
                }),
                new go.Binding("background", "", (data) => {
                  if (node && node.data.isBold) {
                    return "rgba(0,0,0,0.1)";
                  }
                  return "white";
                }).ofObject()
              ),
              $(
                go.Panel,
                "Auto",
                {
                  margin: 2,
                  background: "white",
                  cursor: "pointer",
                  isActionable: true,
                  click: (e, panel) => {
                    const adorn = panel.part;
                    if (!adorn) return;
                    const diagram = e.diagram;
                    if (!diagram) return;

                    const isItalic = node.data.isItalic || false;
                    diagram.startTransaction("toggle italic");
                    diagram.model.setDataProperty(
                      node.data,
                      "isItalic",
                      !isItalic
                    );
                    diagram.commitTransaction("toggle italic");

                    // Remove the menu
                    diagram.remove(adorn);
                    currentOpenMenu = null;
                    menuIsOpen = false;
                  },
                },
                $(go.Shape, "Rectangle", {
                  fill: "transparent",
                  stroke: "#CCCCCC",
                  strokeWidth: 1,
                  width: 30,
                  height: 30,
                }),
                $(go.TextBlock, "I", {
                  font: "italic 14px serif",
                  stroke: "black",
                  alignment: go.Spot.Center,
                }),
                new go.Binding("background", "", (data) => {
                  if (node && node.data.isItalic) {
                    return "rgba(0,0,0,0.1)";
                  }
                  return "white";
                }).ofObject()
              ),
              $(
                go.Panel,
                "Auto",
                {
                  margin: 2,
                  background: "white",
                  cursor: "pointer",
                  isActionable: true,
                  click: (e, panel) => {
                    const adorn = panel.part;
                    if (!adorn) return;
                    const diagram = e.diagram;
                    if (!diagram) return;

                    const isUnderline = node.data.isUnderline || false;
                    diagram.startTransaction("toggle underline");
                    diagram.model.setDataProperty(
                      node.data,
                      "isUnderline",
                      !isUnderline
                    );
                    diagram.commitTransaction("toggle underline");

                    // Remove the menu
                    diagram.remove(adorn);
                    currentOpenMenu = null;
                    menuIsOpen = false;
                  },
                },
                $(go.Shape, "Rectangle", {
                  fill: "transparent",
                  stroke: "#CCCCCC",
                  strokeWidth: 1,
                  width: 30,
                  height: 30,
                }),
                $(
                  go.Panel,
                  "Vertical",
                  { alignment: go.Spot.Center },
                  $(go.TextBlock, "U", {
                    font: "14px serif",
                    stroke: "black",
                    alignment: go.Spot.Center,
                  }),
                  $(go.Shape, "LineH", {
                    stroke: "black",
                    strokeWidth: 1,
                    width: 14,
                    height: 1,
                    alignment: go.Spot.Bottom,
                  })
                ),
                new go.Binding("background", "", (data) => {
                  if (node && node.data.isUnderline) {
                    return "rgba(0,0,0,0.1)";
                  }
                  return "white";
                }).ofObject()
              )
            );

            createSubmenu(diagram, button, adorn, node, "Text Style", content);
          },
        },
        // Create a layered effect for shadow
        $(go.Shape, "RoundedRectangle", {
          fill: "rgba(0,0,0,0.05)",
          stroke: null,
          parameter1: 7, // corner radius
          spot1: new go.Spot(0, 0, 1, 1),
          spot2: new go.Spot(1, 1, 1, 1),
        }),
        $(go.Shape, "RoundedRectangle", {
          fill: "white",
          stroke: "#E0E0E0",
          strokeWidth: 1,
          width: 32,
          height: 32,
          parameter1: 6, // corner radius
        }),
        $(go.TextBlock, "B", {
          font: "bold 16px serif",
          stroke: "black",
          alignment: go.Spot.Center,
        })
      ),
      // Alignment category button
      $(
        go.Panel,
        "Auto",
        {
          name: "AlignmentButton",
          margin: new go.Margin(0, 6, 0, 0), // Spacing between buttons
          cursor: "pointer",
          isActionable: true, // Added back
          click: (e, obj) => {
            const diagram = e.diagram;
            if (!diagram) return;

            // Get the button and its parent adornment
            const button = obj;
            if (!button) return;

            const adorn = button.part;
            if (!adorn) return;

            const node = adorn.adornedPart;
            if (!node) return;

            // Create text alignment submenu content
            const content = $(
              go.Panel,
              "Horizontal",
              { margin: 5, defaultStretch: go.GraphObject.Fill },
              ...textAlignments.map((align) =>
                $(
                  go.Panel,
                  "Auto",
                  {
                    margin: 2,
                    background: "white",
                    cursor: "pointer",
                    isActionable: true,
                    click: (e, panel) => {
                      const adorn = panel.part;
                      if (!adorn) return;
                      const diagram = e.diagram;
                      if (!diagram) return;

                      diagram.startTransaction("change text alignment");
                      diagram.model.setDataProperty(
                        node.data,
                        "textAlign",
                        align.value
                      );
                      diagram.commitTransaction("change text alignment");

                      // Remove the menu
                      diagram.remove(adorn);
                      currentOpenMenu = null;
                      menuIsOpen = false;
                    },
                  },
                  $(go.Shape, "Rectangle", {
                    fill: "transparent",
                    stroke: "#CCCCCC",
                    strokeWidth: 1,
                    width: 40,
                    height: 30,
                  }),
                  $(go.TextBlock, align.icon, {
                    font: "10px sans-serif",
                    stroke: "black",
                    alignment: go.Spot.Center,
                  }),
                  new go.Binding("background", "", (data) => {
                    if (node && node.data.textAlign === align.value) {
                      return "rgba(0,0,0,0.1)";
                    }
                    return "white";
                  }).ofObject()
                )
              )
            );

            createSubmenu(
              diagram,
              button,
              adorn,
              node,
              "Text Alignment",
              content
            );
          },
        },
        // Create a layered effect for shadow
        $(go.Shape, "RoundedRectangle", {
          fill: "rgba(0,0,0,0.05)",
          stroke: null,
          parameter1: 7, // corner radius
          spot1: new go.Spot(0, 0, 1, 1),
          spot2: new go.Spot(1, 1, 1, 1),
        }),
        $(go.Shape, "RoundedRectangle", {
          fill: "white",
          stroke: "#E0E0E0",
          strokeWidth: 1,
          width: 32,
          height: 32,
          parameter1: 6, // corner radius
        }),
        // Create an alignment icon using standard shapes
        $(
          go.Panel,
          "Vertical",
          { alignment: go.Spot.Center },
          $(go.Shape, "LineH", {
            stroke: "black",
            strokeWidth: 2,
            width: 16,
            height: 1,
            margin: new go.Margin(0, 0, 2, 0),
          }),
          $(go.Shape, "LineH", {
            stroke: "black",
            strokeWidth: 2,
            width: 12,
            height: 1,
            margin: new go.Margin(0, 0, 2, 0),
          }),
          $(go.Shape, "LineH", {
            stroke: "black",
            strokeWidth: 2,
            width: 8,
            height: 1,
            margin: new go.Margin(0, 0, 0, 0),
          })
        )
      ),
      // Font size category button
      $(
        go.Panel,
        "Auto",
        {
          name: "FontSizeButton",
          margin: new go.Margin(0, 0, 0, 0),
          cursor: "pointer",
          isActionable: true, // Added back
          click: (e, obj) => {
            const diagram = e.diagram;
            if (!diagram) return;

            // Get the button and its parent adornment
            const button = obj;
            if (!button) return;

            const adorn = button.part;
            if (!adorn) return;

            const node = adorn.adornedPart;
            if (!node) return;

            // Create font size submenu content
            const content = $(
              go.Panel,
              "Vertical",
              { margin: 5, defaultStretch: go.GraphObject.Fill },
              ...fontSizes.map((size) =>
                $(
                  go.Panel,
                  "Auto",
                  {
                    margin: 2,
                    background: "white",
                    cursor: "pointer",
                    isActionable: true,
                    click: (e, panel) => {
                      const adorn = panel.part;
                      if (!adorn) return;
                      const diagram = e.diagram;
                      if (!diagram) return;

                      diagram.startTransaction("change font size");
                      diagram.model.setDataProperty(
                        node.data,
                        "fontSize",
                        size.value
                      );
                      diagram.commitTransaction("change font size");

                      // Remove the menu
                      diagram.remove(adorn);
                      currentOpenMenu = null;
                      menuIsOpen = false;
                    },
                  },
                  $(go.Shape, "Rectangle", {
                    fill: "transparent",
                    stroke: "#CCCCCC",
                    strokeWidth: 1,
                    width: 80,
                    height: 30,
                  }),
                  $(go.TextBlock, size.name, {
                    font: "12px sans-serif",
                    stroke: "black",
                    alignment: go.Spot.Center,
                  }),
                  new go.Binding("background", "", (data) => {
                    if (node && node.data.fontSize === size.value) {
                      return "rgba(0,0,0,0.1)";
                    }
                    return "white";
                  }).ofObject()
                )
              )
            );

            createSubmenu(diagram, button, adorn, node, "Font Size", content);
          },
        },
        // Create a layered effect for shadow
        $(go.Shape, "RoundedRectangle", {
          fill: "rgba(0,0,0,0.05)",
          stroke: null,
          parameter1: 7, // corner radius
          spot1: new go.Spot(0, 0, 1, 1),
          spot2: new go.Spot(1, 1, 1, 1),
        }),
        $(go.Shape, "RoundedRectangle", {
          fill: "white",
          stroke: "#E0E0E0",
          strokeWidth: 1,
          width: 32,
          height: 32,
          parameter1: 6, // corner radius
        }),
        $(go.TextBlock, "Aa", {
          font: "bold 14px serif",
          stroke: "black",
          alignment: go.Spot.Center,
        })
      )
    )
  );

  return adornment;
};

// Create the sticky note template
export const stickyNoteTemplate = $(
  go.Node,
  "Auto",
  {
    layerName: STICKY_NOTES_LAYER,
    resizable: true,
    minSize: MIN_SIZE,
    selectionAdornmentTemplate: stickyNodeAdornment,
    isLayoutPositioned: false,
    // Use mouseEnter and mouseLeave for hover behavior
    mouseEnter: (e, node) => {
      isOverNode = true;
      // Create and add the hover adornment when mouse enters
      const diagram = node.diagram;
      if (diagram === null) return;
      // Don't show adornment if text editing is active
      if (
        diagram.currentTool instanceof go.TextEditingTool &&
        diagram.currentTool.textBlock !== null
      )
        return;

      // Create the adornment if it doesn't exist
      if (!node.findAdornment("ColorPalette")) {
        const adornment = createHoverAdornment(node);
        node.addAdornment("ColorPalette", adornment);
      }
    },
    mouseLeave: (e, node) => {
      isOverNode = false;
      // Give a small delay before checking if we should remove the adornment
      setTimeout(() => {
        if (!isOverAdornment && !isOverNode && !menuIsOpen) {
          node.removeAdornment("ColorPalette");
        }
      }, 50);
    },
    // Use shadow properties on the node itself since they work here
    shadowOffset: new go.Point(5, 5),
    shadowBlur: 12,
    shadowColor: "rgba(122,124,141,0.2)",
  },
  new go.Binding("position"),
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
      fill: "lightyellow",
      stroke: null,
      parameter1: 10,
    },
    new go.Binding("fill", "backgroundColor")
  ),
  $(
    go.TextBlock,
    {
      stretch: go.Stretch.Fill,
      margin: 5,
      overflow: go.TextOverflow.Ellipsis,
      font: "16px Inter",
      editable: true,
      textEditor: RealtimeTextEditor,
      textAlign: "left",
    },
    new go.Binding("text").makeTwoWay(),
    new go.Binding("stroke", "fontColor"),
    new go.Binding("textAlign"),
    // Use a complex binding for font that considers all style properties
    new go.Binding("font", "", buildFontString),
    // Add binding for text decoration (underline)
    new go.Binding("isUnderline", "isUnderline")
  )
);
