import React, { useState, useRef, useEffect } from "react";
import { ODSIcon as Icon } from "../../../index.js";
import styles from "./SchemaListV3.module.css";
import { NODE_VARIABLES } from "../constants/types.js";

export function SchemaListV3({
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

  const extractPath = (nodeData) => {
    let nodePath = nodeData.path || [];
    if (nodePath[0] === "response") {
      nodePath = nodePath.slice(1);
    }
    if (nodeData.label) {
      nodePath.splice(nodePath.length - 1, 1, nodeData.label);
    }
    return nodePath.length > 0 ? `.${nodePath.join(".")}` : "";
  };
  
  const getBlockId = () => {
    const name = parentContext?.nodeName || node.description || node.name;
    return `${name}${extractPath(node)}`;
  };
  
  const isCurrentlyHovered = hoveredBlockId === getBlockId();
  
  const hasDisplayableChildren =
    node.schema?.length > 0 &&
    (node.type !== "array" ||
      node.schema[0]?.type === "object" ||
      node.schema[0]?.type === "array") &&
    (showArrayStructure || node.type !== "array");

  const isClickable =
    !isChildOfArray &&
    Array.isArray(node.path) &&
    node.path.length > 0 &&
    node.type !== "object";

  const schemaData = node.schema || [];

  const buildBlockData = (isRawData = false) => {
    const nodeNameForData = parentContext?.nodeName || node.description || node.name;
    return {
      subCategory: NODE_VARIABLES,
      type: NODE_VARIABLES,
      subType: `${nodeNameForData}${extractPath(node)}`,
      value: `${nodeNameForData}${extractPath(node)}`,
      displayValue: nodeName,
      description: node.description || `Variable: ${nodeName}`,
      returnType: node.type || 'any',
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

  const handleClick = (e, isRawData = false) => {
    e.preventDefault();
    if (isClickable) e.stopPropagation();
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
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <div
          className={`${styles.content} ${
            isClickable ? styles.clickable : styles.notClickable
          } ${isCurrentlyHovered ? styles.hovered : ""}`}
          onClick={handleClick}
          onMouseEnter={handleHover}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
        >
          <div className={styles.indicator} />
          <span className={styles.name} title={nodeName}>
            {node.nodeNumber ? `${node.nodeNumber}. ${nodeName}` : nodeName}
          </span>
          {node.module !== "Question" && node.type !== "object" && (
            <span className={styles.type}>
              {node.type}
            </span>
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
              },
            }}
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
          />
        )}
      </div>
      <div
        ref={childrenRef}
        className={`${styles.children} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {isVerbose &&
          node.type === "object" &&
          node.path &&
          node.path.length > 0 && (
            <div key={`${parentKey}_raw_data`} className={styles.childItem}>
              <div className={styles.itemContainer}>
                <div
                  className={`${styles.content} ${styles.clickable}`}
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
                  <span className={styles.name} title="Raw Data">
                    {node.pathStr || `{Raw Data}`}
                  </span>
                  <span className={styles.type}>
                    json
                  </span>
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
              <div key={childKey} className={styles.childItem}>
                <SchemaListV3
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
