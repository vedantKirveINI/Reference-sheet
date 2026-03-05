import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as go from "gojs";
import { ReactDiagram, ReactOverview } from "gojs-react";
import PropTypes from "prop-types";

import { getNodeSrc, validateIfElseData } from "./extensions/extension-utils";
import { getLinkTemplates } from "./templates/linkTemplates";
import { getNodeTemplates, NODE_TEMPLATES } from "./templates/nodeTemplates";
import { generateKey } from "./utils/canvas-utils";
import { migrateCanvasModelTypesFromJSON } from "./utils/migrateCanvasModelTypes";
import { 
  CANVAS_BG, 
  LINK_STROKE, 
  STICKY_NOTES_LAYER,
  NODE_HORIZONTAL_OFFSET,
  NODE_SEARCH_RADIUS,
  ANIMATION_DURATION_MS,
  SCROLL_ANIMATION_DURATION_MS,
  VIEWPORT_CHECK_DEBOUNCE_MS,
} from "./constants";
import { animateNode } from "./templates/template-utils";
import { clearExecutionState } from "./templates/haloEffect";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import { mapLimit } from "async";

const embedDebug =
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_EMBED_DEBUG === "true";

const embedLog = (...args) => {
  if (embedDebug) {
    console.log("[StudioEmbed]", ...args);
  }
};

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200, 300];

function findNextZoom(current, direction) {
  const pct = Math.round(current * 100);
  if (direction === "in") {
    for (const step of ZOOM_STEPS) {
      if (step > pct) return step;
    }
    return ZOOM_STEPS[ZOOM_STEPS.length - 1];
  } else {
    for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
      if (ZOOM_STEPS[i] < pct) return ZOOM_STEPS[i];
    }
    return ZOOM_STEPS[0];
  }
}

import { IF_ELSE_TYPE_V2 } from "./extensions";

export { generateKey, getNodeSrc, validateIfElseData };

const $ = go.GraphObject.make;

const scheduleIdleTask = (callback, timeout = 1000) => {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, 0);
};

const cancelIdleTask = (id) => {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

export const Canvas = forwardRef(
  (
    {
      mode,
      // divClassName = "",
      canvasClicked = () => {},
      canvasDoubleClicked = () => {},
      canvasContextClicked = () => {},
      nodeClicked = () => {},
      nodeDoubleClicked = () => {},
      nodeContextClicked = () => {},
      linkContextClicked = () => {},
      onBadgeClick = () => {},
      onNodeCreated = () => {},
      onLinkDrawn = () => {},
      onSelectionDeleting = () => {},
      onModelChanged = () => {},
      allowBackwardLinking = false,
      isReadOnly = false,
      stickyNoteHandlers = null,
      customTemplates = null,
      customLinkTemplates = null,
      customGroupTemplates = null,
      backgroundColor = null,
      // hideOverview = false,
      // onScaleChange = () => {},
    },
    ref
  ) => {
    const canvasRef = useRef();
    const isReadOnlyRef = useRef(isReadOnly);
    const lastNodeNumber = useRef(0);
    const gridIdleTaskRef = useRef(null);
    const viewportIdleTaskRef = useRef(null);
    const [showOverview, setShowOverview] = useState(false);
    const [nodeStats, setNodeStats] = useState({ total: 0, success: 0, error: 0, running: 0 });
    const [zoomPct, setZoomPct] = useState(100);
    // const [scale, setScale] = useState(1);
    const [lastDocumentCoords, setLastDocumentCoords] = useState();
    const updateFixedNodes = useCallback((diagram) => {
      diagram.commit((d) => {
        d.nodes.each(
          /**
           *
           * @param {go.Node} node
           */
          (node) => {
            const updatedNode = node;
            // ignore regular nodes
            if (!updatedNode.data?.viewSpot) return;
            // assume that Node.locationSpot == Spot.parse(spotstr)
            // now compute the point in document coords of that spot in the viewport
            const loc = new go.Point().setRectSpot(
              d.viewportBounds,
              updatedNode.locationSpot
            );
            // and set the node's location, whose locationSpot is already set appropriately
            updatedNode.location = loc;
            // updatedNode.scale = newscale; //not required
          }
        );
      }, null); // skipsUndoManager
    }, []);
    const updateNode = useCallback((key, data) => {
      const diagram = canvasRef.current.getDiagram();
      const node = diagram.findNodeForKey(key);
      if (node) {
        diagram.startTransaction("updateNodeData");
        Object.keys(data).forEach((k) => {
          diagram.model.setDataProperty(node.data, k, data[k]);
        });
        diagram.commitTransaction("updateNodeData");
      }
    }, []);

    const createLink = useCallback((linkData) => {
      const diagram = canvasRef.current.getDiagram();
      const model = diagram.model;

      let nodeToCheck = diagram.findNodeForKey(linkData.from);
      const toNode = diagram.findNodeForKey(linkData.to);

      diagram.startTransaction("createLinkData");
      diagram.model.addLinkData(linkData);

      if (nodeToCheck && nodeToCheck?.data?.type === IF_ELSE_TYPE_V2) {
        // Copy all links
        const allLinks = [...model.linkDataArray];

        // Find the index of the first "Else" link from this node
        const elseLinkIndex = allLinks.findIndex(
          (l) => l?.from === nodeToCheck?.key && l?.linkForElse
        );

        // Find the newly added link
        const newLink = diagram.findLinkForData(linkData);

        // Only proceed if we have both Else and new link
        if (elseLinkIndex !== -1 && newLink) {
          // Remove the new link from current array
          const filtered = allLinks.filter((l) => l !== linkData);

          // Insert it before the Else link
          filtered.splice(elseLinkIndex, 0, linkData);

          model.commit((m) => {
            m.linkDataArray = filtered;
          }, "Reorder Else Links");
        }
      }

      diagram.commitTransaction("createLinkData");
      return diagram.findLinkForData(linkData);
    }, []);

    const selectNode = (node) => {
      const diagram = canvasRef.current.getDiagram();
      diagram.startTransaction("Select Node");
      // Clear all other selections
      diagram.clearSelection();
      // Select the desired node
      diagram.select(node);
      diagram.commitTransaction("Select Node");
    };
    const scrollToNode = (node) => {
      if (node.data.viewSpot) return;
      if (!canvasRef.current) return;
      const diagram = canvasRef.current.getDiagram();
      if (!diagram) return;
      const nodeBounds = node.actualBounds;

      // Calculate the position where the node should be placed (left-center)
      const targetX = nodeBounds.center.x - diagram.viewportBounds.width / 4; // Left-center
      const targetY = nodeBounds.center.y - diagram.viewportBounds.height / 2; // Vertically center it

      // Animate the diagram's position smoothly
      const animation = new go.Animation();
      animation.add(
        diagram,
        "position",
        diagram.position,
        new go.Point(targetX, targetY),
        SCROLL_ANIMATION_DURATION_MS
      );
      animation.start();
      animation.finished = () => {
        diagram.position = new go.Point(targetX, targetY);
      };
    };
    /**
     *
     * @type {(node: go.Node, x: number, y: number) => void}
     */
    const moveNode = useCallback((node, x, y) => {
      const diagram = canvasRef.current.getDiagram();
      diagram.startTransaction("moveNode");
      node?.moveTo(x, y);
      diagram.commitTransaction("moveNode");
    }, []);

    /**
     * @type {(anchorNode: go.Node, shiftAmount: number) => void}
     */
    const shiftNodes = useCallback((anchorNode, shiftAmount = NODE_HORIZONTAL_OFFSET) => {
      const subparts = new go.Set(
        anchorNode.diagram.nodes.filter((n) => {
          return (
            n.location.x + (shiftAmount - 50) >= anchorNode.location.x &&
            anchorNode.key !== n.data.key
          );
        })
      );
      anchorNode.diagram.moveParts(subparts, new go.Point(shiftAmount, 0));
    }, []);

    const createNode = useCallback(
      (
        data = {},
        params = {
          openNodeAfterCreate: false,
          autoLink: false,
          // skipScroll: false,
        }
      ) => {
        /**
         * @type {go.Diagram}
         */
        const diagram = canvasRef.current.getDiagram();
        const documentPoint = go.Point.parse(lastDocumentCoords || "0 0");
        let newNode = null;
        let nodeToConnect = null;

        if (data?.key) {
          newNode = diagram.findNodeForKey(data.key);
        }
        if (newNode) {
          updateNode(newNode.data.key, data);
        } else {
          newNode = {
            key: data?.key || generateKey(),
            ...data,
          };
          if (data.template !== NODE_TEMPLATES.PLACEHOLDER) {
            lastNodeNumber.current += 1;
            newNode.nodeNumber = lastNodeNumber.current;
          }
          diagram.startTransaction("createNode");
          diagram.model.addNodeData(newNode);
          diagram.commitTransaction("createNode");

          newNode = diagram.findNodeForKey(newNode.key);
          if (params?.autoLink) {
            //if new node has toPort then automatically snap to nearest node if it does not have any children
            if (newNode.toLinkable !== false) {
              let parts = [];
              diagram
                .findPartsNear(documentPoint, NODE_SEARCH_RADIUS, true, true)
                .each((part) => {
                  if (
                    part.findLinksOutOf().count === 0 &&
                    part !== newNode &&
                    !newNode?.data?.denyFromLink &&
                    !part?.data?.denyToLink
                  ) {
                    const distance = documentPoint.distanceSquaredPoint(
                      part.location
                    );
                    parts.push({ part, distance });
                  }
                });
              if (parts.length > 0) {
                parts.sort((a, b) => a.distance - b.distance);
                if (parts[0].part?.name !== "PLACEHOLDERNODE") {
                  nodeToConnect = parts[0].part;
                }
              }
            }
          }
          onNodeCreated(newNode);
        }
        if (!newNode.data?.viewSpot) {
          if (!newNode.data?.location) {
            if (params?.location) {
              moveNode(newNode, params.location.x, params.location.y);
            } else {
              moveNode(newNode, documentPoint.x, documentPoint.y);
            }
          }
        } else {
          updateFixedNodes(diagram); // fix for fixed nodes not showing on first load
        }
        if (nodeToConnect) {
          const newLocation = new go.Point(
            nodeToConnect.location.x + NODE_HORIZONTAL_OFFSET,
            nodeToConnect.location.y
          );
          createLink({ to: newNode.key, from: nodeToConnect.key });
          const animation = new go.Animation();
          animation.add(newNode, "location", newNode.location, newLocation);
          animation.duration = ANIMATION_DURATION_MS;
          animation.start();

          // Create the link after animation
          animation.finished = () => {
            moveNode(newNode, newLocation.x, newLocation.y);
          };
        }
        // if (!params?.skipScroll) {
        //   setTimeout(() => scrollToNode(newNode), SCROLL_ANIMATION_DURATION_MS);
        // }
        if (params.openNodeAfterCreate) {
          selectNode(newNode);
          nodeDoubleClicked(null, newNode);
          setTimeout(() => scrollToNode(newNode), SCROLL_ANIMATION_DURATION_MS);
        }
        return newNode;
      },
      [
        createLink,
        lastDocumentCoords,
        moveNode,
        nodeDoubleClicked,
        onNodeCreated,
        updateFixedNodes,
        updateNode,
      ]
    );
    const removeNode = useCallback((node) => {
      const diagram = canvasRef.current.getDiagram();
      diagram.startTransaction("removeNode");
      diagram.remove(node);
      diagram.commitTransaction("removeNode");
    }, []);
    const removeLink = useCallback(
      (linkdata) => {
        const diagram = canvasRef.current.getDiagram();
        const toNode = diagram.findNodeForKey(linkdata.to);
        if (toNode?.data?.template === NODE_TEMPLATES.PLACEHOLDER) {
          removeNode(toNode);
        }
        diagram.startTransaction("removeLinkData");
        diagram.model.removeLinkData(linkdata);
        diagram.commitTransaction("removeLinkData");
      },
      [removeNode]
    );
    const updateLink = ({
      linkData,
      linkKeyToUpdate,
      linkKeyToUpdateValue,
      options = {},
    }) => {
      const diagram = canvasRef.current.getDiagram();
      if (
        !options?.strictRename &&
        linkData?.metadata?.wasRenamed &&
        linkKeyToUpdate === "label"
      ) {
        return diagram.findLinkForData(linkData);
      }
      diagram.startTransaction("updateLinkData");
      diagram.model.setDataProperty(
        linkData,
        linkKeyToUpdate,
        linkKeyToUpdateValue
      );
      if (options?.fromRename && linkKeyToUpdate === "label") {
        diagram.model.setDataProperty(linkData, "metadata", {
          ...(linkData?.metadata || {}),
          wasRenamed: true,
        });
      }
      diagram.commitTransaction("updateLinkData");
      return diagram.findLinkForData(linkData);
    };
    const removeOutgoingLinks = useCallback(
      (nodeKey, removePlaceholderNodes = true) => {
        /**
         * @type {go.Diagram}
         */
        const diagram = canvasRef.current.getDiagram();
        const node = diagram.findNodeForKey(nodeKey);
        if (!node) return;
        if (removePlaceholderNodes) {
          node.findNodesOutOf().each((n) => {
            if (!n.data?.type) {
              removeNode(n);
            }
          });
        }
        diagram.startTransaction("removeOutgoingLinks");
        diagram.removeParts(node.findLinksOutOf());
        diagram.commitTransaction("removeOutgoingLinks");
      },
      [removeNode]
    );
    const findLinksOutOf = (nodeKey) => {
      const diagram = canvasRef.current.getDiagram();
      const node = diagram.findNodeForKey(nodeKey);
      return node.findLinksOutOf();
    };
    const findLinksInto = (nodeKey) => {
      if (!nodeKey) return;
      const diagram = canvasRef.current.getDiagram();
      const node = diagram.findNodeForKey(nodeKey);
      return node?.findLinksInto();
    };
    const updateNodeStats = useCallback((diagram) => {
      if (!diagram) return;
      let total = 0, success = 0, error = 0, running = 0;
      diagram.nodes.each((node) => {
        if (node.data?.template === "stickyNote" || node.data?.template === "stickyNoteV2") return;
        total++;
        if (node.data?._state === "running") running++;
        else if (node.data?.errors?.length > 0) error++;
        else if (node.data?._executionResult?.success === false) error++;
        else if (node.data?._executionResult?.success) success++;
      });
      setNodeStats({ total, success, error, running });
    }, []);
    const checkNodesOutsideViewport = useCallback((e) => {
      /**
       * @type {go.Diagram}
       */
      const diagram = e.diagram;
      if (!diagram) return;
      const viewport = diagram.viewportBounds;
      let nodesOutside = false;
      diagram.nodes.each((n) => {
        if (!viewport.containsRect(n.actualBounds)) {
          nodesOutside = true;
        }
      });
      setShowOverview(nodesOutside);
      updateNodeStats(diagram);
    }, [updateNodeStats]);
    const diagramListeners = useMemo(
      () => ({
        BackgroundDoubleClicked: (e) => {
          if (e.diagram.isReadOnly) return;
          const lastDocPoint = go.Point.stringify(
            e.diagram.lastInput.documentPoint
          );
          setLastDocumentCoords(lastDocPoint);
          canvasDoubleClicked(e, lastDocPoint);
        },
        BackgroundSingleClicked: (e) => {
          if (e.diagram.isReadOnly) return;
          canvasClicked(
            e,
            go.Point.stringify(e.diagram.lastInput.documentPoint)
          );
        },
        ObjectContextClicked: (e) => {
          if (e.diagram.isReadOnly) return;
          const part = e.subject.part;
          if (part instanceof go.Node) {
            nodeContextClicked(
              e,
              e.subject.part,
              e.diagram.transformDocToView(
                new go.Point(
                  e.diagram.lastInput.documentPoint.x,
                  e.diagram.lastInput.documentPoint.y
                )
              )
            );
          }
          if (part instanceof go.Link) {
            linkContextClicked(
              e,
              e.subject.part,
              e.diagram.transformDocToView(
                new go.Point(
                  e.diagram.lastInput.documentPoint.x,
                  e.diagram.lastInput.documentPoint.y
                )
              )
            );
          }
        },
        ObjectDoubleClicked: (e) => {
          if (e.diagram.isReadOnly) return;
          const node = e.subject.part;

          if (node instanceof go.Node) {
            // Get the node's position
            scrollToNode(node);
          }
          nodeDoubleClicked(e, node);
        },
        ObjectSingleClicked: (e) => {
          if (e.subject.part.name === "LINKOPTIONADORNMENTTEMPLATEGO") {
            if (e.diagram.isReadOnly) return;
            linkContextClicked(
              e,
              e.subject.part,
              e.diagram.transformDocToView(e.diagram.lastInput.documentPoint)
            );
            return;
          }
          if (e.subject.name === "ERRORNODEGO") {
            if (e.diagram.isReadOnly) return;
            onBadgeClick(
              e,
              {
                errors: e.subject?.part?.data?.errors || [],
                warnings: e.subject?.part?.data?.warnings || [],
                nodeKey: e.subject?.part?.data?.key,
                nodeType: e.subject?.part?.data?.type,
                nodeName: e.subject?.part?.data?.text || e.subject?.part?.data?.name || '',
                nodeIcon: e.subject?.part?.data?.icon || '',
                validationIssues: e.subject?.part?.data?.validationIssues || null,
              },
              e.diagram.transformDocToView(e.diagram.lastInput.documentPoint),
              "errors"
            );
            return;
          } else if (e.subject.name === "EXECUTIONRESULTGO") {
            onBadgeClick(
              e,
              e.subject?.part?.data,
              e.diagram.transformDocToView(e.diagram.lastInput.documentPoint),
              "executions"
            );
            return;
          }
          nodeClicked(e, e.subject.part);
        },
        LinkDrawn: (e) => {
          if (e.diagram.isReadOnly) return;
          onLinkDrawn(e);
        },
        SelectionDeleting: (e) => {
          if (e.diagram.isReadOnly) return;
          onSelectionDeleting(e, e.diagram.selection);
        },
        ChangedSelection: (e) => {
          const diagram = e.diagram;
          const loopTypes = ['LOOP_START', 'FOR_EACH', 'REPEAT', 'LOOP_UNTIL', 'LOOP_END'];
          diagram.nodes.each((node) => {
            if (loopTypes.includes(node.data?.type) && !node.isSelected) {
              node.isShadowed = true;
              node.shadowBlur = 16;
              node.shadowColor = "rgba(0, 0, 0, 0.08)";
            }
          });
          diagram.selection.each((part) => {
            if (part instanceof go.Node && part.data?.pairedNodeKey) {
              const pairedNode = diagram.findNodeForKey(part.data.pairedNodeKey);
              if (pairedNode && !pairedNode.isSelected) {
                const color = pairedNode.data?.dark || pairedNode.data?.background || "#F97316";
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                pairedNode.isShadowed = true;
                pairedNode.shadowBlur = 24;
                pairedNode.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
              }
            }
          });
        },
        BackgroundContextClicked: (e) => {
          if (e.diagram.isReadOnly) return;
          const lastDocPoint = go.Point.stringify(
            e.diagram.lastInput.documentPoint
          );
          setLastDocumentCoords(lastDocPoint);
          canvasContextClicked(
            e,
            e.diagram.transformDocToView(
              new go.Point(
                e.diagram.lastInput.documentPoint.x,
                e.diagram.lastInput.documentPoint.y
              )
            )
          );
        },
      }),
      [
        canvasClicked,
        canvasContextClicked,
        canvasDoubleClicked,
        linkContextClicked,
        nodeClicked,
        nodeContextClicked,
        nodeDoubleClicked,
        onBadgeClick,
        onLinkDrawn,
        onSelectionDeleting,
      ]
    );
    const memoizedNodeTemplates = useMemo(() => {
      return getNodeTemplates(mode, { stickyNoteHandlers, customTemplates });
    }, [mode, stickyNoteHandlers, customTemplates]);

    const memoizedLinkTemplates = useMemo(() => {
      return customLinkTemplates || getLinkTemplates(mode);
    }, [mode, customLinkTemplates]);

    const initDiagram = () => {
      // eslint-disable-next-line no-undef
      go.Diagram.licenseKey = process.env.REACT_APP_GOJS_LICENSE || "";
      const d = $(go.Diagram, {
        "undoManager.isEnabled": true,
        "linkingTool.direction": allowBackwardLinking
          ? go.LinkingDirection.Either
          : go.LinkingDirection.ForwardsOnly,
        "linkingTool.isEnabled": false,
        grid: $(
          go.Panel,
          "Grid",
          {
            gridCellSize: new go.Size(50, 50),
          },
          $(go.Shape, "LineH", {
            stroke: "#b0bec5",
            strokeWidth: 2,
            strokeDashArray: [2, 48],
          })
        ),
        "draggingTool.isGridSnapEnabled": true,
        "draggingTool.gridSnapCellSpot": go.Spot.TopLeft,
        ModelChanged: (e) => {
          if (e.isTransactionFinished) {
            onModelChanged(e);
          }
          if (
            e.change === go.ChangeType.Property &&
            e.propertyName === "_state"
          ) {
            const node = d.findPartForKey(e.object.key);
            if (!node) return;

            if (e.newValue === "running") {
              const anim = new go.Animation();
              anim.duration = ANIMATION_DURATION_MS;
              anim.easing = go.Animation.EaseLinear;
              anim.runCount = Infinity;
              const spn = node.findObject("SPINNER");
              if (spn !== null) {
                anim.add(spn, "strokeDashOffset", 56, 0);
                anim.start();
              }

              node.findLinksInto().each((link) => {
                const linkShape = link.findObject("LINKSHAPE");
                if (linkShape) {
                  linkShape.strokeDashArray = [8, 4];
                  linkShape.stroke = "#3B82F6";
                  linkShape.strokeWidth = 4;
                  const linkAnim = new go.Animation();
                  linkAnim.duration = 600;
                  linkAnim.easing = go.Animation.EaseLinear;
                  linkAnim.runCount = Infinity;
                  linkAnim.add(linkShape, "strokeDashOffset", 24, 0);
                  linkAnim.start();
                }
              });
            } else {
              const animationManager = node.diagram.animationManager;
              animationManager.activeAnimations?.each((anim) => {
                if (anim.isAnimating) {
                  anim.stop();
                }
              });

              node.findLinksInto().each((link) => {
                const linkShape = link.findObject("LINKSHAPE");
                if (linkShape) {
                  linkShape.strokeDashArray = null;
                  linkShape.stroke = LINK_STROKE;
                  linkShape.strokeWidth = 3;
                }
              });

              if (e.newValue === "completed") {
                const shape = node.findObject("SELECTIONADORNMENTGO");
                if (shape) {
                  const flashAnim = new go.Animation();
                  flashAnim.duration = 400;
                  flashAnim.reversible = true;
                  flashAnim.add(shape, "strokeWidth", shape.strokeWidth || 1, 3);
                  flashAnim.add(shape, "stroke", shape.stroke, "#22C55E");
                  flashAnim.start();
                }
              }
            }
          }
        },
        layout: $(go.LayeredDigraphLayout, {
          layerSpacing: 100,
          isOngoing: false,
          isInitial: false,
        }),
        minScale: 0.5,
        maxScale: 2.5,
        scrollMode: go.ScrollMode.Infinite,
        initialDocumentSpot: go.Spot.Top,
        initialViewportSpot: go.Spot.Top,
        initialAutoScale: go.AutoScale.UniformToFill,
      });

      d.allowCopy = false;
      d.allowUndo = true;
      d.isReadOnly = isReadOnly;
      // d.renderer = "svg";
      d.model = new go.GraphLinksModel({
        linkKeyProperty: "key",
        linkCategoryProperty: "category",
        nodeCategoryProperty: "template",
        groupKeyProperty: "group",
      });
      d.nodeTemplateMap = memoizedNodeTemplates;
      d.linkTemplateMap = memoizedLinkTemplates;
      if (customGroupTemplates) {
        d.groupTemplateMap = customGroupTemplates;
      }
      d.toolManager.dragSelectingTool.box = new go.Part({
        layerName: "Tool",
      }).add(
        new go.Shape("RoundedRectangle", {
          name: "SHAPE",
          fill: null,
          stroke: LINK_STROKE,
          strokeWidth: 2,
          parameter1: 20,
        })
      );
      d.toolManager.linkingTool.temporaryLink = $(
        go.Link,
        {
          layerName: "Tool",
          // curve: go.Curve.None,
          adjusting: go.LinkAdjusting.None,
        },
        $(go.Shape, {
          strokeWidth: 2,
          stroke: LINK_STROKE,
        }),
        $(go.Shape, {
          toArrow: "Feather",
          strokeWidth: 2,
          stroke: LINK_STROKE,
          scale: 2,
        })
      );
      d.toolManager.linkingTool.temporaryFromNode = $(go.Node, {
        layerName: "Tool",
        selectable: false,
      });
      d.toolManager.linkingTool.temporaryToNode = $(go.Node, {
        layerName: "Tool",
        selectable: false,
      });
      d.toolManager.linkingTool.findTargetPort = function (toend) {
        const p = d.lastInput.documentPoint;
        let gravity = this.portGravity;
        if (gravity <= 0) gravity = 0.1;
        const node = d.findPartAt(p);
        if (node === null) return null;
        const nearports = node.ports;
        let bestDist = Infinity;
        let bestPort = null;
        const temp = new go.Point();
        const it = nearports.iterator;
        while (it.next()) {
          const port = it.value;
          const node = port.part;
          if (!(node instanceof go.Node)) continue;
          const toPoint = port.getDocumentPoint(go.Spot.Center, temp); // ?? assumes center point of port
          const dx = p.x - toPoint.x;
          const dy = p.y - toPoint.y;
          const dist = dx * dx + dy * dy; // don't bother taking sqrt
          if (dist < bestDist) {
            // closest so far
            // try isValidLink in the appropriate direction
            if (
              (toend &&
                this.isValidLink(
                  this.originalFromNode,
                  this.originalFromPort,
                  node,
                  port
                )) ||
              (!toend &&
                this.isValidLink(
                  node,
                  port,
                  this.originalToNode,
                  this.originalToPort
                ))
            ) {
              bestPort = port;
              bestDist = dist;
            }
          }
        }
        if (bestPort !== null) return node;
        return null;
      };
      d.toolManager.hoverDelay = 0;
      d.validCycle = allowBackwardLinking
        ? go.CycleMode.All
        : go.CycleMode.NotDirected; //go.Diagram.CycleNotDirected;
      d.commandHandler.canDeleteSelection = () => {
        return !isReadOnlyRef.current;
      };
      let isInitialized = false;
      d.addDiagramListener("InitialLayoutCompleted", () => {
        isInitialized = true;
        if (d.nodes.count > 0) {
          d.centerRect(d.nodes?.first().actualBounds);
        }
        updateNodeStats(d);
      }).addDiagramListener("ViewportBoundsChanged", (e) => {
        if (isInitialized) {
          updateFixedNodes(e.diagram);
        }
        if (e.diagram) {
          setZoomPct(Math.round(e.diagram.scale * 100));
        }
        if (gridIdleTaskRef.current) cancelIdleTask(gridIdleTaskRef.current);
        gridIdleTaskRef.current = scheduleIdleTask(() => {
          debounce(() => {
            if (e.diagram.scale !== e.subject.scale) {
              const gridline = e.diagram.grid.elt(0);
              const newStrokeWidth = Math.max(2, 2 / e.diagram.scale);
              gridline.strokeWidth = newStrokeWidth;
              gridline.strokeDashArray = [newStrokeWidth, 50 - newStrokeWidth];
            }
          }, 100)();
        }, 1000);
        if (viewportIdleTaskRef.current) cancelIdleTask(viewportIdleTaskRef.current);
        viewportIdleTaskRef.current = scheduleIdleTask(() => {
          debounce(() => checkNodesOutsideViewport(e), VIEWPORT_CHECK_DEBOUNCE_MS)();
        }, 1000);
      });
      return d;
    };
    /**
     *
     * @param {number} value The value in percentage
     * @returns
     */
    const changeDiagramScale = useCallback((value) => {
      if (!value) return;
      const diagram = canvasRef.current.getDiagram();
      diagram.startTransaction();
      diagram.scale = value / 100;
      diagram.commitTransaction();
    }, []);
    const findNode = (nodeKey) => {
      const diagram = canvasRef.current.getDiagram();
      return diagram.findNodeForKey(nodeKey);
    };
    const getSnapshot = (
      options = {
        scale: 1,
        type: "image/webp",
        background: CANVAS_BG,
      }
    ) => {
      return new Promise((resolve, reject) => {
        const diagram = canvasRef.current.getDiagram();

        diagram.makeImageData({
          ...options,
          returnType: "blob",
          callback: (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to generate blob"));
            }
          },
        });
      });
    };
    const getSelectedNodes = () => {
      const diagram = canvasRef.current.getDiagram();
      return diagram?.selection;
    };
    const findNodesBetween = useCallback((fromNodeKey, toNodeKey) => {
      /**
       * @type {go.Node} from
       */
      const from = findNode(fromNodeKey);
      // const to = findNode(toNodeKey);

      function findNodesOutOf(node, visitedKeys = new Set()) {
        // Base case: if the node key is equal to toNodeKet or if the key is already visited, return an empty array
        if (node.key === toNodeKey || visitedKeys.has(node.key)) {
          return [];
        }

        // Add the current node's key to the set of visited keys
        visitedKeys.add(node.key);

        // Initialize an array to store child nodes
        let childNodes = [];

        // Check if the current node has children
        if (node.findNodesOutOf().count > 0) {
          // Iterate through each child node

          node.findNodesOutOf().each((n) => {
            childNodes = childNodes.concat(findNodesOutOf(n, visitedKeys));
          });
        }
        // Add the current node to the array
        childNodes.push(node);
        return childNodes;
      }
      const nodesBetween = findNodesOutOf(from);
      return nodesBetween;
    }, []);
    const createStickyNote = useCallback(
      (data = {}, position = null) => {
        const diagram = canvasRef.current.getDiagram();
        const documentPoint =
          position || (lastDocumentCoords ? lastDocumentCoords : "100 100");
        // Create sticky note data similar to how regular nodes are created
        const stickyData = {
          key: data.key || generateKey(),
          template: NODE_TEMPLATES.STICKY_NOTE,
          text: data.text || "Double-click to edit",
          backgroundColor: data.backgroundColor,
          fontColor: data.fontColor,
          location: documentPoint,
          is_executable: false,
          denyToLink: true,
          denyFromLink: true,
          ...data,
        };
        // Use the same pattern as createNode
        diagram.startTransaction("createStickyNote");
        diagram.model.addNodeData(stickyData);
        diagram.commitTransaction("createStickyNote");
      },
      [lastDocumentCoords]
    );
    const findAllPreviousNodes = useCallback((node, visited = new go.Set()) => {
      if (!node || visited.has(node)) return [];
      visited.add(node);
      node.findNodesInto().each((n) => {
        findAllPreviousNodes(n, visited);
      });
      return visited.toArray().map((node) => node.data);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getModelJSON: () => canvasRef.current.getDiagram().model.toJson(),
        loadModelJSON: async (json) => {
          const migrated = migrateCanvasModelTypesFromJSON(json);
          const newModel = go.Model.fromJson(migrated);
          const nodeCount = (newModel.nodeDataArray || []).length;
          embedLog("canvas loadModelJSON start", "nodeCount=" + nodeCount);

          /**
           * @type {go.Diagram} diagram
           */
          const diagram = canvasRef.current.getDiagram();

          const hasStickyLayer = !!diagram.findLayer(STICKY_NOTES_LAYER);
          embedLog("canvas hasStickyLayer=" + hasStickyLayer);

          // Add StickyNotes layer if needed (must be in a transaction)
          diagram.startTransaction("loadModelJSON");
          if (!diagram.findLayer(STICKY_NOTES_LAYER)) {
            embedLog("canvas adding StickyNotes layer");
            const defaultLayer = diagram.findLayer("");
            diagram.addLayerAfter(
              new go.Layer({ name: STICKY_NOTES_LAYER }),
              defaultLayer != null ? defaultLayer : diagram.findLayer("Background")
            );
            embedLog("canvas StickyNotes layer added");
          }
          diagram.commitTransaction("loadModelJSON");

          // Replace model only when no transaction is active (GoJS forbids model replacement during a transaction)
          embedLog("canvas setting model nodeCount=" + nodeCount);
          diagram.model = newModel;
          embedLog("canvas model set");

          let projectsInfo = {};
          const updateNodeSrc = async (node, callback) => {
            if (node.template === NODE_TEMPLATES.STICKY_NOTE) return callback();
            let updatedNode = cloneDeep(node);
            const project_id = updatedNode?.go_data?.flow?.project_id;
            const projectInfo = projectsInfo[project_id];
            if (!projectInfo) {
              const src = await getNodeSrc(updatedNode, true);
              if (project_id) projectsInfo[project_id] = { src };
              updatedNode._src = src;
            } else {
              updatedNode._src = projectInfo.src;
            }
            createNode(updatedNode, { autoLink: false });
            callback();
          };
          mapLimit(newModel.nodeDataArray || [], 2, (node, callback) => {
            updateNodeSrc(node, () => {
              callback();
            });
          });
          diagram.nodes.each((node) => {
            if (
              node.data?.nodeNumber === null ||
              node.data?.nodeNumber === undefined
            ) {
              lastNodeNumber.current += 1;
              updateNode(node.data.key, { nodeNumber: lastNodeNumber.current });
            } else {
              lastNodeNumber.current = node.data.nodeNumber;
            }
          });
        },
        createNode,
        removeNode,
        createLink,
        removeLink,
        updateLink,
        removeOutgoingLinks,
        findLinksOutOf,
        getSelectedNodes,
        autoAlign: () => {
          const diagram = canvasRef.current.getDiagram();
          diagram.layoutDiagram(true);
          diagram.zoomToFit();
          diagram.centerRect(diagram.documentBounds);
          updateFixedNodes(diagram);
        },
        cancelCurrentTool: () => {
          const diagram = canvasRef.current.getDiagram();
          diagram?.currentTool?.doCancel();
        },
        getAllNodes: () => {
          /**
           * @type {go.Diagram} diagram
           */
          const diagram = canvasRef.current.getDiagram();
          let returnNodes = [];
          diagram.nodes.each((n) => {
            returnNodes = [...returnNodes, n.data];
          });
          return returnNodes;
        },
        getPreviousNodes: (nodeKey) => {
          return findAllPreviousNodes(findNode(nodeKey));
        },
        getDiagram: () => canvasRef.current.getDiagram(),
        findNode,
        findLinksInto,
        getSnapshot,
        findNodesBetween,
        animateNode: (node_id, state, skipAnimation = false) => {
          animateNode(findNode(node_id), state, skipAnimation);
        },
        goToNode: (id, params = { openAfterScroll: true }) => {
          const node = findNode(id);
          if (!node) return;
          scrollToNode(node);
          selectNode(node);
          if (params?.openAfterScroll) nodeDoubleClicked(null, node);
        },
        updateNode,
        transformDocToView: (x, y) => {
          const diagram = canvasRef.current.getDiagram();
          return diagram.transformDocToView(new go.Point(x, y));
        },
        transformViewToDoc: (x, y) => {
          const diagram = canvasRef.current.getDiagram();
          const docCoords = diagram.transformViewToDoc(new go.Point(x, y));
          return docCoords;
        },
        deleteSelection: () => {
          const diagram = canvasRef.current.getDiagram();
          diagram.commandHandler.deleteSelection();
        },
        moveNode,
        shiftNodes,
        selectNode,
        // duplicateNode: (node) => {
        //   let data = node.data;
        //   const location = data?.location?.split(" ");
        //   delete data["key"];
        //   delete data["location"];
        //   return createNode(data, {
        //     openNodeAfterCreate: false,
        //     autoLink: false,
        //     location: {
        //       x: +location?.[0] || 0 + 100,
        //       y: +location?.[1] || 0 + 100,
        //     },
        //   });
        // },
        changeDiagramScale,
        createStickyNote,
        checkErrors: () => {
          const diagram = canvasRef.current.getDiagram();
          let errors = [];

          diagram.nodes?.each((node) => {
            if (node.data.errors?.length > 0) {
              errors.push(node);
            }
          });
          return errors;
        },
        undo: () => {
          const diagram = canvasRef.current.getDiagram();
          if (diagram.commandHandler.canUndo()) {
            diagram.commandHandler.undo();
            return true;
          }
          return false;
        },
        redo: () => {
          const diagram = canvasRef.current.getDiagram();
          if (diagram.commandHandler.canRedo()) {
            diagram.commandHandler.redo();
            return true;
          }
          return false;
        },
        canUndo: () => {
          const diagram = canvasRef.current.getDiagram();
          return diagram.commandHandler.canUndo();
        },
        canRedo: () => {
          const diagram = canvasRef.current.getDiagram();
          return diagram.commandHandler.canRedo();
        },
        clearUndoHistory: () => {
          const diagram = canvasRef.current.getDiagram();
          diagram.undoManager.clear();
        },
        clearExecutionHalos: () => {
          const diagram = canvasRef.current.getDiagram();
          clearExecutionState(diagram);
        },
      }),
      [
        changeDiagramScale,
        createLink,
        createNode,
        createStickyNote,
        findNodesBetween,
        moveNode,
        nodeDoubleClicked,
        removeLink,
        removeNode,
        removeOutgoingLinks,
        shiftNodes,
        updateFixedNodes,
        updateNode,
        findAllPreviousNodes,
      ]
    );
    const initOverview = useCallback(() => {
      // const overview = $(go.Overview, { contentAlignment: go.Spot.Center });
      // overview.box.elt(0).stroke = getLinkTemplateStroke(mode);
      // return overview;
      const overview = new go.Overview({
        contentAlignment: go.Spot.Center,
        box: new go.Part({
          selectable: true,
          selectionAdorned: false,
          selectionObjectName: "BOXSHAPE",
          locationObjectName: "BOXSHAPE",
          resizeObjectName: "BOXSHAPE",
          cursor: "move",
        }).add(
          new go.Shape({
            name: "BOXSHAPE",
            fill: "transparent",
            stroke: LINK_STROKE,
            strokeWidth: 2,
          })
        ),
      });
      return overview;
    }, []);
    useEffect(() => {
      /**
       * @type {go.Diagram} diagram
       */
      const diagram = canvasRef.current?.getDiagram();
      if (!diagram) return;

      // Attach all listeners dynamically
      Object.entries(diagramListeners).forEach(([event, handler]) => {
        diagram.removeDiagramListener(event, handler); // Prevent duplication
        diagram.addDiagramListener(event, handler);
      });

      // Cleanup all listeners on unmount
      return () => {
        Object.entries(diagramListeners).forEach(([event, handler]) => {
          diagram.removeDiagramListener(event, handler); // Prevent duplication
        });
      };
    }, [diagramListeners]);
    useEffect(() => {
      isReadOnlyRef.current = isReadOnly;
    }, [isReadOnly]);
    useEffect(() => {
      return () => {
        const diagram = canvasRef.current?.getDiagram();
        if (diagram) {
          diagram.animationManager.stopAnimation();
        }
        if (gridIdleTaskRef.current) cancelIdleTask(gridIdleTaskRef.current);
        if (viewportIdleTaskRef.current) cancelIdleTask(viewportIdleTaskRef.current);
      };
    }, []);
    const applyZoom = (pct) => {
      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;
      diagram.startTransaction("zoom");
      diagram.scale = pct / 100;
      diagram.commitTransaction("zoom");
      setZoomPct(pct);
    };

    const handleZoomIn = () => {
      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;
      applyZoom(findNextZoom(diagram.scale, "in"));
    };

    const handleZoomOut = () => {
      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;
      applyZoom(findNextZoom(diagram.scale, "out"));
    };

    const handleFitToScreen = () => {
      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;
      diagram.zoomToFit();
      diagram.centerRect(diagram.documentBounds);
      setZoomPct(Math.round(diagram.scale * 100));
    };

    return (
      <>
        <ReactDiagram
          ref={canvasRef}
          divClassName={"myDiagramDiv"}
          initDiagram={initDiagram}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "1.25rem",
            bottom: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            zIndex: 101,
          }}
          className={`transition-opacity duration-300 ${showOverview ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem",
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "0.5rem",
              filter: "drop-shadow(0px 7px 29px rgba(100, 100, 111, 0.20))",
            }}
          >
            <button
              onClick={handleZoomOut}
              title="Zoom out"
              style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: "#71717a",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#18181b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >
              <ZoomOut style={{ width: "16px", height: "16px" }} />
            </button>
            <span
              style={{
                minWidth: "2.5rem",
                textAlign: "center",
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#71717a",
                fontVariantNumeric: "tabular-nums",
                cursor: "default",
                userSelect: "none",
              }}
              title="Current zoom level"
            >
              {zoomPct}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom in"
              style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: "#71717a",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#18181b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >
              <ZoomIn style={{ width: "16px", height: "16px" }} />
            </button>
            <div style={{ width: "1px", height: "1rem", background: "#e4e4e7" }} />
            <button
              onClick={handleFitToScreen}
              title="Fit to screen"
              style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: "#71717a",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#18181b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >
              <Maximize style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
          <div
            style={{
              width: "16rem",
              height: "auto",
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: "0.375rem",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "#fff",
              filter: "drop-shadow(0px 7px 29px rgba(100, 100, 111, 0.20))",
            }}
          >
            <ReactOverview
              initOverview={initOverview}
              divClassName="overview"
              observedDiagram={canvasRef.current?.getDiagram() || null}
              style={{
                width: "16rem",
                height: "9.75rem",
                backgroundColor: "aliceblue",
                borderBottom: "0.75px solid #cfd8dc",
              }}
            />
            {nodeStats.total > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.375rem 0.625rem",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.6875rem",
                  color: "#64748b",
                }}
              >
                <span style={{ fontWeight: 500 }}>{nodeStats.total} nodes</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {nodeStats.running > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-indicator" />
                      <span>{nodeStats.running}</span>
                    </span>
                  )}
                  {nodeStats.success > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: "#22C55E" }} />
                      <span>{nodeStats.success}</span>
                    </span>
                  )}
                  {nodeStats.error > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                      <span>{nodeStats.error}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

Canvas.propTypes = {
  divClassName: PropTypes.string,
  canvasClicked: PropTypes.func,
  canvasDoubleClicked: PropTypes.func,
  canvasContextClicked: PropTypes.func,
  nodeClicked: PropTypes.func,
  nodeDoubleClicked: PropTypes.func,
  nodeContextClicked: PropTypes.func,
  linkContextClicked: PropTypes.func,
  onNodeCreated: PropTypes.func,
  onLinkDrawn: PropTypes.func,
  onSelectionDeleting: PropTypes.func,
  onBadgeClick: PropTypes.func,
};
