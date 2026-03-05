import React, { useMemo } from "react";
import { motion } from "framer-motion";
// import { ODSIcon as Icon } from "@src/module/ods";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";
const SUGGESTED_NODE_TYPES = ["HTTP", "TRANSFORMER", "IFELSE_V2", "ITERATOR", "TINY_GPT"];

const SUGGESTION_COLORS = {
  HTTP: "#3b82f6",
  TRANSFORMER: "#8b5cf6",
  IFELSE_V2: "#f59e0b",
  ITERATOR: "#10b981",
  TINY_GPT: "#ec4899",
  DEFAULT: "#64748b",
};

const SuggestedNodes = ({ onNodeClick, recentNodes = [], tabData = [] }) => {
  const suggestedNodes = useMemo(() => {
    const allNodes = [];
    tabData.forEach((tab) => {
      tab.components?.forEach((component) => {
        allNodes.push({ ...component, categoryLabel: tab.label });
      });
    });

    const findNodeByType = (type) => allNodes.find((n) => n.type === type);
    
    const recentTypes = new Set(recentNodes.map((n) => n.type));
    const suggestions = [];
    
    if (recentTypes.has("HTTP") || recentTypes.has("WEBHOOK")) {
      const transformer = findNodeByType("TRANSFORMER");
      if (transformer) suggestions.push(transformer);
    }
    if (recentTypes.has("TRANSFORMER") || recentTypes.has("FIND_ALL")) {
      const iterator = findNodeByType("ITERATOR");
      if (iterator) suggestions.push(iterator);
    }
    if (recentTypes.has("ITERATOR")) {
      const ifElse = findNodeByType("IFELSE_V2");
      if (ifElse) suggestions.push(ifElse);
    }

    SUGGESTED_NODE_TYPES.forEach((type) => {
      if (suggestions.length < 4) {
        const node = findNodeByType(type);
        if (node && !suggestions.find((s) => s.type === node.type)) {
          suggestions.push(node);
        }
      }
    });

    return suggestions.slice(0, 4);
  }, [tabData, recentNodes]);

  if (suggestedNodes.length === 0) return null;

  const getNodeColor = (node) => SUGGESTION_COLORS[node.type] || SUGGESTION_COLORS.DEFAULT;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>✨</span>
          <h3 className={styles.headerTitle}>Suggested for You</h3>
        </div>
        <span className={styles.headerBadge}>Smart picks</span>
      </div>
      
      <div className={styles.nodesList}>
        {suggestedNodes.map((node, index) => {
          const color = getNodeColor(node);
          return (
            <motion.button
              key={node.type}
              className={styles.nodeCard}
              onClick={() => onNodeClick && onNodeClick(node)}
              style={{ "--accent-color": color }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.nodeIcon} style={{ background: `${color}15` }}>
                <Icon 
                  imageProps={{
                    src: node._src,
                    style: { width: "1.25rem", height: "1.25rem" },
                  }}
                />
              </div>
              <div className={styles.nodeContent}>
                <span className={styles.nodeName}>{node.name}</span>
                <span className={styles.nodeCategory}>{node.categoryLabel}</span>
              </div>
              <Icon 
                outeIconName="OUTEChevronRightIcon" 
                style={{ color: "#94a3b8", fontSize: "1rem" }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedNodes;
