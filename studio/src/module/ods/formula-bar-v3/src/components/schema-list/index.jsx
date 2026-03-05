import React, { useState, useRef, useEffect } from "react";
import { ODSIcon as Icon, ODSTooltip as Tooltip, ODSLabel as Label } from "../../../../index.js";
import styles from "./index.module.css";
import { NODE_VARIABLES } from "../../constants/types.js";

export function SchemaList({
  node,
  depth = 0,
  parentKey = "",
  nodeId = "",
  parentContext = null,
  isChildOfArray = false,
  onClick = () => {},
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const childrenRef = useRef(null);
  const nodeName = node.label || node.name || node.description || node.key;
  // Check if node has displayable children
  const hasDisplayableChildren =
    node.schema?.length > 0 &&
    (node.type !== "array" || // Not an array
      node.schema[0]?.type === "object" || // Array of objects
      node.schema[0]?.type === "array") && // Array of arrays
    (showArrayStructure || node.type !== "array"); // Show array structure if enabled

  // Check if node should be clickable
  //if node type is childofArray or object it should not be clickable
  const isClickable =
    !isChildOfArray &&
    Array.isArray(node.path) &&
    node.path.length > 0 &&
    node.type !== "object";

  // Handle the schema structure from the data
  const schemaData = node.schema || [];

  // Get default value for primitive array items
  const getDefaultValue = () => {
    if (
      node.type === "array" &&
      node.schema?.[0]?.type !== "object" &&
      node.schema?.[0]?.type !== "array"
    ) {
      return node.schema[0]?.default !== undefined
        ? [node.schema[0].default]
        : node.default;
    }
    return node.default;
  };

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

    const nodeName = parentContext?.nodeName || node.name || node.description;

    // Format the data according to the sample
    const clickData = {
      subCategory: NODE_VARIABLES,
      type: NODE_VARIABLES,
      subType: `${nodeName}${extractPath(node)}`,
      value: `${nodeName}${extractPath(node)}`,
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
        nodeName: nodeName,
        nodeId: `${parentContext?.nodeId || node.nodeId}`,
        nodeType: node.nodeType,
      },
    };
    onClick(clickData);
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
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <div
          className={`${styles.content} ${
            isClickable ? styles.clickable : styles.notClickable
          }`}
          onClick={handleClick}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          style={{
            overflow: "hidden",
            background:
              node.background || parentContext?.background || "transparent",
            color: node.foreground || parentContext?.foreground || "inherit",
          }}
        >
          <span className={styles.name} title={nodeName}>
            {node.nodeNumber ? `${node.nodeNumber}. ${nodeName}` : nodeName}
          </span>
          {node.module !== "Question" && node.type !== "object" && (
            <>
              :
              <span className={styles.type} style={{ color: node.foreground }}>
                {node.type}
              </span>
            </>
          )}
          {getDefaultValue() !== undefined && (
            <Tooltip
              title={
                <Label color={"#fff"} variant="subtitle2">
                  Default:{" "}
                  <pre>{JSON.stringify(getDefaultValue(), null, 2)}</pre>
                </Label>
              }
              placement="auto-start"
              arrow={false}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -14],
                      },
                    },
                  ],
                },
                tooltip: {
                  sx: {
                    background: `${"rgba(38, 50, 56, 0.9)"}`,
                    maxWidth: "40rem",
                    maxHeight: "24rem",
                    overflow: "auto",
                  },
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Icon
                  outeIconName="OUTEInfoIcon"
                  outeIconProps={{
                    sx: {
                      color: node.foreground,
                      width: "1rem",
                      height: "1rem",
                    },
                  }}
                />
              </div>
            </Tooltip>
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
              // e.stopPropagation();
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
        {/* Raw Data child for objects when isVerbose is true */}
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
                    // Call handleClick with isRawData=true to bypass the return statement
                    handleClick(e, true);
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    width: "auto",
                    marginLeft: "1rem",
                    overflow: "hidden",
                    background:
                      node.background ||
                      parentContext?.background ||
                      "transparent",
                    color:
                      node.foreground || parentContext?.foreground || "inherit",
                  }}
                >
                  <span className={styles.name} title="Raw Data">
                    {node.pathStr || `{Raw Data}`}
                  </span>
                  <>
                    :
                    <span
                      className={styles.type}
                      style={{ color: node.foreground }}
                    >
                      json
                    </span>
                  </>
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
