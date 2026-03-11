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
import { CANVAS_BG, LINK_STROKE, STICKY_NOTES_LAYER } from "./constants";
import { animateNode } from "./templates/template-utils";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import { mapLimit } from "async";

import styles from "./canvas.module.css";
import { IF_ELSE_TYPE_V2 } from "./extensions";

export { generateKey, getNodeSrc, validateIfElseData };

const $ = go.GraphObject.make;
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
      // hideOverview = false,
      // onScaleChange = () => {},
    },
    ref
  ) => {
    const canvasRef = useRef();
    const isReadOnlyRef = useRef(isReadOnly);
    const lastNodeNumber = useRef(0);
    const [showOverview, setShowOverview] = useState(false);
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
        diagram.startTransaction("udpateNodeData");
        Object.keys(data).forEach((k) => {
          diagram.model.setDataProperty(node.data, k, data[k]);
        });
        diagram.commitTransaction("udpateNodeData");
      } else {
        console.error(`Node with key ${key} not found`);
      }
    }, []);

    const createLink = useCallback((linkData) => {
      const diagram = canvasRef.current.getDiagram();
      const model = diagram.model;

      let nodeToCheck = diagram.findNodeForKey(linkData.from);

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
      const diagram = canvasRef.current.getDiagram();
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
        300
      ); // 300ms duration
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
    const shiftNodes = useCallback((anchorNode, shiftAmount = 300) => {
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
                .findPartsNear(documentPoint, 9999, true, true)
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
            nodeToConnect.location.x + 300,
            nodeToConnect.location.y
          );
          createLink({ to: newNode.key, from: nodeToConnect.key });
          const animation = new go.Animation();
          animation.add(newNode, "location", newNode.location, newLocation);
          animation.duration = 500; // Animation duration in milliseconds
          animation.start();

          // Create the link after animation
          animation.finished = () => {
            moveNode(newNode, newLocation.x, newLocation.y);
          };
        }
        // if (!params?.skipScroll) {
        //   setTimeout(() => scrollToNode(newNode), 300);
        // }
        if (params.openNodeAfterCreate) {
          selectNode(newNode);
          nodeDoubleClicked(null, newNode);
          setTimeout(() => scrollToNode(newNode), 300);
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
    }, []);
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
            if (e.newValue === "running") {
              const anim = new go.Animation();
              anim.duration = 500;
              anim.easing = go.Animation.EaseLinear;
              anim.runCount = Infinity;
              const spn = node.findObject("SPINNER");
              if (spn !== null) {
                anim.add(spn, "strokeDashOffset", 100, 0);
                anim.start();
              }
            } else {
              const animationManager = node.diagram.animationManager;
              animationManager.activeAnimations?.each((anim) => {
                if (anim.isAnimating) {
                  anim.stop();
                }
              });
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
        nodeCategoryProperty: "template",
      });
      d.nodeTemplateMap = getNodeTemplates(mode);
      d.linkTemplateMap = getLinkTemplates(mode);
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
      }).addDiagramListener("ViewportBoundsChanged", (e) => {
        if (isInitialized) {
          updateFixedNodes(e.diagram);
        }
        debounce(() => {
          // onScaleChange(e.diagram.scale);
          if (e.diagram.scale !== e.subject.scale) {
            const gridline = e.diagram.grid.elt(0);
            const newStrokeWidth = Math.max(2, 2 / e.diagram.scale);
            gridline.strokeWidth = newStrokeWidth;
            gridline.strokeDashArray = [newStrokeWidth, 50 - newStrokeWidth];
          }
        }, 100)();
        debounce(() => checkNodesOutsideViewport(e), 500)();
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
          const newModel = go.Model.fromJson(json);
          /**
           * @type {go.Diagram} diagram
           */
          const diagram = canvasRef.current.getDiagram();

          // Make sure the StickyNotes layer exists
          if (!diagram.findLayer(STICKY_NOTES_LAYER)) {
            diagram.addLayerBefore(
              new go.Layer({ name: STICKY_NOTES_LAYER }),
              diagram.findLayer("Background")
            );
          }

          diagram.model = newModel;

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
            width: "16rem",
            height: "auto",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "0.375rem",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
            background: "#fff",
            filter: "drop-shadow(0px 7px 29px rgba(100, 100, 111, 0.20))",
          }}
          className={`${styles["overview-container"]} ${showOverview ? styles["fade-in"] : styles["fade-out"]}`}
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
