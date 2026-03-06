import React, { useCallback, useEffect, useRef } from "react";
import isEmpty from "lodash/isEmpty";
import { ODSIcon as Icon } from "../../../ods/index.js";
import highlightText from "../../utils/highlightText.jsx";
import styles from "./styles.module.css";

const PremiumCrownIcon = () => (
  <svg
    className={styles.premiumIcon}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 18.5L4 10L8.5 13L12 6L15.5 13L20 10L21.5 18.5H2.5Z"
      fill="#fbbf24"
      stroke="#f59e0b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="6" r="1.5" fill="#f59e0b" />
    <circle cx="4" cy="10" r="1.5" fill="#f59e0b" />
    <circle cx="20" cy="10" r="1.5" fill="#f59e0b" />
  </svg>
);

const getCategoryColor = (categoryLabel) => {
  const lowerLabel = categoryLabel?.toLowerCase() || "";
  if (lowerLabel.includes("ai")) return { border: "#a855f7", bg: "#faf5ff" };
  if (lowerLabel.includes("flow") || lowerLabel.includes("fc"))
    return { border: "#eab308", bg: "#fefce8" };
  if (lowerLabel.includes("loop") || lowerLabel === "l")
    return { border: "#14b8a6", bg: "#f0fdfa" };
  if (lowerLabel.includes("io"))
    return { border: "#3b82f6", bg: "#eff6ff" };
  if (lowerLabel.includes("agent"))
    return { border: "#8b5cf6", bg: "#f5f3ff" };
  if (lowerLabel.includes("tiny tables") || lowerLabel.includes("sheet"))
    return { border: "#06b6d4", bg: "#ecfeff" };
  if (lowerLabel.includes("enrichment"))
    return { border: "#10b981", bg: "#ecfdf5" };
  if (lowerLabel.includes("text parser"))
    return { border: "#f97316", bg: "#fff7ed" };
  if (lowerLabel.includes("utils"))
    return { border: "#6366f1", bg: "#eef2ff" };
  return { border: "#94a3b8", bg: "#f8fafc" };
};

function RenderNodes({
  components = [],
  categoryLabel = "",
  options = {},
  onEventClick = () => {},
  onClick = () => {},
  disabledNodes = [],
  plan = "basic",
  searchText = "",
  focusedNodeIndex = -1,
  startIndex = 0,
  viewMode = "grid",
}) {
  const {
    gridClassName = "",
    gridTestId = `node-grid-${categoryLabel?.toLowerCase() || "default"}`,
    testIdPrefix = `node-${categoryLabel?.toLowerCase() || "default"}`,
    keyPrefix = "component",
  } = options;

  const categoryColors = getCategoryColor(categoryLabel);
  const nodeRefs = useRef({});

  const getNodeDisabledReasons = useCallback(
    (node) => {
      const disabledReasons = disabledNodes
        .filter((disabled) => disabled.type === node.type)
        .map((disabled) => disabled.reason);

      if (disabledReasons.length === 0) return null;
      return disabledReasons;
    },
    [disabledNodes]
  );

  useEffect(() => {
    components.forEach((_, index) => {
      const globalIndex = startIndex + index;
      if (globalIndex === focusedNodeIndex && nodeRefs.current[globalIndex]) {
        nodeRefs.current[globalIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }, [focusedNodeIndex, startIndex, components]);

  if (isEmpty(components)) return null;

  return (
    <div className={gridClassName} data-testid={gridTestId}>
      {components.map((component, index) => {
        const globalIndex = startIndex + index;
        const disabledReasons = getNodeDisabledReasons(component);
        const isFocused = globalIndex === focusedNodeIndex;
        const dontShow =
          component?.type === "Integration" &&
          !component?.events?.components?.find(
            (c) => c?.annotation === "ACTION"
          );
        if (dontShow) return null;

        const displayName = searchText 
          ? highlightText(component.name, searchText, styles.searchHighlight)
          : component.name;

        return (
          <div
            key={`${keyPrefix}-${component.name}-${index}`}
            ref={(el) => { nodeRefs.current[globalIndex] = el; }}
            className={`${styles.node} ${
              plan === "basic" && component.premium ? styles.premium : ""
            } ${isFocused ? styles.keyboardFocused : ""} ${
              disabledReasons ? styles.disabled : ""
            } ${viewMode === "compact" ? styles.compactNode : ""} ${
              viewMode === "list" ? styles.listNode : ""
            }`}
            style={{
              "--node-hover-border": categoryColors.border,
              "--node-hover-bg": categoryColors.bg,
            }}
            data-category={categoryLabel}
            title={component.description || component.name}
            onClick={() => {
              if (!disabledReasons) {
                if (!component.events) {
                  onClick(component);
                } else {
                  onEventClick(component.events);
                }
              }
            }}
            data-testid={`${testIdPrefix}-${index}`}
            tabIndex={0}
            role="button"
            aria-label={`Add ${component.name} node`}
          >
            <div className={styles.nodeIcon}>
              <Icon
                imageProps={{
                  src: component._src,
                  style: { width: "100%", height: "100%" },
                  "data-testid": `${testIdPrefix}-${index}-icon`,
                }}
              />
            </div>
            
            <div className={styles.nodeContent}>
              <span className={styles.nodeLabel}>
                {displayName}
              </span>
              {component.description && searchText && (
                <span className={styles.nodeDescription}>
                  {highlightText(component.description, searchText, styles.searchHighlight)}
                </span>
              )}
            </div>

            {plan === "basic" && component.premium && (
              <div className={styles.premiumBadge}>
                <PremiumCrownIcon />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RenderNodes;
