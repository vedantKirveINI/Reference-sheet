import React, { useState, useRef, useEffect } from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./SchemaList.module.css";
import { NODE_VARIABLES } from "../constants/types.jsx";

export function SchemaList({
  node,
  depth = 0,
  parentKey = "",
  nodeId = "",
  parentContext = null,
  isChildOfArray = false,
  onClick = () => {},
  onHover = () => {},
  hoveredBlockId = null,
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const childrenRef = useRef(null);
  const nodeName = node.label || node.description || node.name || node.key;

  const extractPath = (node) => {
    let nodePath = node.path || [];
    if (nodePath[0] === "response") {
      nodePath = nodePath.slice(1);
    }
    if (node.label) {
      nodePath.splice(nodePath.length - 1, 1, node.label);
    }
    return nodePath.length > 0 ? `.${nodePath.join(".")}` : "";
  };

  const getBlockId = () => {
    const name = parentContext?.nodeName || node.description || node.name;
    return `${name}${extractPath(node)}`;
  };

  const isCurrentlyHovered = hoveredBlockId === getBlockId();

  // Check if node has displayable children
  const hasDisplayableChildren =
    node.schema?.length > 0 &&
    (node.type !== "array" ||
      node.schema[0]?.type === "object" ||
      node.schema[0]?.type === "array") &&
    (showArrayStructure || node.type !== "array");

  // Check if node should be clickable
  const isClickable =
    !isChildOfArray &&
    Array.isArray(node.path) &&
    node.path.length > 0 &&
    node.type !== "object";

  // Handle the schema structure from the data
  const schemaData = node.schema || [];

  const buildBlockData = (isRawData = false) => {
    const nodeNameForData =
      parentContext?.nodeName || node.description || node.name;
    return {
      subCategory: NODE_VARIABLES,
      type: NODE_VARIABLES,
      subType: `${nodeNameForData}${extractPath(node)}`,
      value: `${nodeNameForData}${extractPath(node)}`,
      description: node.description || `Variable: ${nodeName}`,
      returnType: node.type || "any",
      background: node.background || parentContext?.background,
      foreground: node.foreground || parentContext?.foreground,
      nodeNumber: node.nodeNumber || parentContext?.nodeNumber,
      variableData: {
        schema: node.schema,
        key: node.key,
        label: node.label,
        module: node.module,
        type: node.type,
        sample_value: node.default,
        default: node.default,
        path: node.path || [],
        pathStr: node.pathStr || "",
        nodeName: nodeNameForData,
        nodeId: `${parentContext?.nodeId || node.nodeId}`,
        nodeType: node.nodeType,
      },
    };
  };

  const handleHover = () => {
    if (isClickable) {
      onHover(buildBlockData());
    }
  };

  // Handle click event
  const handleClick = (e, isRawData = false) => {
    e.preventDefault();
    if (isClickable) e.stopPropagation();
    // If this is not clickable and not raw data, don't handle the click
    if (!isClickable && !isRawData) {
      if (hasDisplayableChildren) {
        setIsExpanded(!isExpanded);
      }
      return;
    }
    onClick(buildBlockData(isRawData));
  };

  useEffect(() => {
    let timeoutId = null;
    if (isExpanded && childrenRef.current) {
      // Add a small delay to ensure the content is rendered
      timeoutId = setTimeout(() => {
        childrenRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
    return () => clearTimeout(timeoutId);
  }, [isExpanded]);

  return (
    <div className={classes.container}>
      <div className={classes.itemContainer}>
        <div
          className={`${classes.content} ${
            isClickable ? classes.clickable : classes.notClickable
          } ${isCurrentlyHovered ? classes.hovered : ""}`}
          onClick={handleClick}
          onMouseEnter={handleHover}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
        >
          <div
            className={classes.indicator}
            style={{
              backgroundColor:
                node.background || parentContext?.background || "#e5e5e5",
            }}
          />
          <span className={classes.name} title={nodeName}>
            {node.nodeNumber ? `${node.nodeNumber}. ${nodeName}` : nodeName}
          </span>
          {node.module !== "Question" && node.type !== "object" && (
            <span className={classes.type}>{node.type}</span>
          )}
        </div>
        {hasDisplayableChildren && (
          <Icon
            outeIconName="OUTEChevronRightIcon"
            outeIconProps={{
              sx: {
                width: "1.5rem",
                height: "1.5rem",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                cursor: "pointer",
              },
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          />
        )}
      </div>
      <div
        ref={childrenRef}
        className={`${classes.children} ${
          isExpanded ? classes.expanded : classes.collapsed
        }`}
      >
        {/* Raw Data child for objects when isVerbose is true */}
        {isVerbose &&
          node.type === "object" &&
          node.path &&
          node.path.length > 0 && (
            <div key={`${parentKey}_raw_data`} className={classes.childItem}>
              <div className={classes.itemContainer}>
                <div
                  className={`${classes.content} ${classes.clickable}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClick(e, true);
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    marginLeft: "0.75rem",
                  }}
                >
                  <span className={classes.name} title="Raw Data">
                    {node.pathStr || `{Raw Data}`}
                  </span>
                  <span className={classes.type}>json</span>
                </div>
              </div>
            </div>
          )}
        {schemaData.map((child, index) => {
          if (
            node.type === "array" &&
            child.type !== "object" &&
            child.type !== "array"
          ) {
            return null;
          }
          const schemaToShow =
            node.type === "array" && child.type === "object"
              ? child.schema
              : [child];

          return schemaToShow.map((schemaItem, schemaIndex) => {
            const childKey = `${parentKey}_${
              schemaItem.key || `child_${schemaIndex}`
            }`;
            return (
              <div key={childKey} className={classes.childItem}>
                <SchemaList
                  node={{
                    ...schemaItem,
                    background: node.background,
                    foreground: node.foreground,
                    nodeId: node.nodeId,
                    module: node.module,
                    nodeType: node.nodeType,
                  }}
                  depth={depth + 1}
                  parentKey={childKey}
                  nodeId={nodeId}
                  parentContext={{
                    ...parentContext,
                    nodeName:
                      parentContext?.nodeName || node.description || node.name,
                    background: node.background,
                    foreground: node.foreground,
                    nodeId: node.nodeId,
                    nodeNumber: parentContext?.nodeNumber || node.nodeNumber,
                  }}
                  isChildOfArray={isChildOfArray || node.type === "array"}
                  onClick={onClick}
                  onHover={onHover}
                  hoveredBlockId={hoveredBlockId}
                  isVerbose={isVerbose}
                  showArrayStructure={showArrayStructure}
                />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
