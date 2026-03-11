import React, { useCallback, useEffect, useRef } from "react";
import isEmpty from "lodash/isEmpty";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../ods";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import premiumLottie from "../../assets/lotties/premium.json";
import highlightText from "../../utils/highlightText.jsx";
import styles from "./styles.module.css";

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
      <AnimatePresence mode="popLayout">
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
            <motion.div
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.15, 
                delay: Math.min(index * 0.02, 0.2),
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
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
                  <Lottie
                    animationData={premiumLottie}
                    loop={true}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "2rem",
                      height: "2rem",
                    }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default RenderNodes;
