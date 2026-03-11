import React, { useMemo } from "react";
import { motion } from "framer-motion";
// import { ODSIcon as Icon } from "@src/module/ods";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";
const NODE_SUGGESTIONS = {
  HTTP: ["TRANSFORMER", "IFELSE_V2", "ITERATOR", "TINY_GPT"],
  WEBHOOK: ["TRANSFORMER", "IFELSE_V2", "HTTP", "FIND_ALL"],
  TRANSFORMER: ["IFELSE_V2", "HTTP", "ITERATOR", "FIND_ALL"],
  IFELSE_V2: ["HTTP", "TRANSFORMER", "SEND_EMAIL", "SLACK"],
  ITERATOR: ["HTTP", "TRANSFORMER", "UPSERT", "IFELSE_V2"],
  FIND_ALL: ["ITERATOR", "TRANSFORMER", "IFELSE_V2", "AGGREGATOR"],
  TINY_GPT: ["TRANSFORMER", "IFELSE_V2", "HTTP", "SEND_EMAIL"],
  FORM_TRIGGER: ["TRANSFORMER", "IFELSE_V2", "HTTP", "SEND_EMAIL"],
  MANUAL_TRIGGER: ["HTTP", "FIND_ALL", "TRANSFORMER", "TINY_GPT"],
  SCHEDULE_TRIGGER: ["HTTP", "FIND_ALL", "TRANSFORMER", "ITERATOR"],
  TABLE_TRIGGER: ["TRANSFORMER", "IFELSE_V2", "HTTP", "UPSERT"],
};

const SUGGESTION_REASONS = {
  HTTP: "Make an API call",
  TRANSFORMER: "Transform the data",
  IFELSE_V2: "Add a condition",
  ITERATOR: "Loop through items",
  FIND_ALL: "Query your data",
  TINY_GPT: "Use AI to process",
  SEND_EMAIL: "Send a notification",
  SLACK: "Post to Slack",
  UPSERT: "Save to database",
  AGGREGATOR: "Combine results",
};

const COMPATIBILITY = {
  perfect: { color: "#10b981", label: "Perfect fit", icon: "OUTECheckCircleIcon" },
  good: { color: "#f59e0b", label: "May need transform", icon: "OUTEInfoIcon" },
  possible: { color: "#94a3b8", label: "Compatible", icon: "OUTECircleIcon" },
};

const ContextualSuggestions = ({ previousNode, onNodeClick, tabData = [] }) => {
  const suggestions = useMemo(() => {
    if (!previousNode?.type) return [];

    const allNodes = [];
    tabData.forEach((tab) => {
      tab.components?.forEach((component) => {
        allNodes.push({ ...component, categoryLabel: tab.label });
      });
    });

    const findNodeByType = (type) => allNodes.find((n) => n.type === type);
    
    const suggestedTypes = NODE_SUGGESTIONS[previousNode.type] || 
      NODE_SUGGESTIONS[previousNode.subType] || 
      ["TRANSFORMER", "IFELSE_V2", "HTTP"];
    
    const result = [];
    suggestedTypes.forEach((type, index) => {
      const node = findNodeByType(type);
      if (node) {
        result.push({
          ...node,
          reason: SUGGESTION_REASONS[type] || "Common next step",
          compatibility: index === 0 ? "perfect" : index === 1 ? "good" : "possible",
        });
      }
    });

    return result.slice(0, 4);
  }, [previousNode, tabData]);

  if (!previousNode || suggestions.length === 0) return null;

  const previousNodeName = previousNode.name || previousNode.type || "this node";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>🎯</span>
          <h3 className={styles.headerTitle}>
            After <span className={styles.nodeName}>{previousNodeName}</span>, you might want to...
          </h3>
        </div>
        <span className={styles.headerBadge}>Context-aware</span>
      </div>
      
      <div className={styles.suggestionsList}>
        {suggestions.map((node, index) => {
          const compat = COMPATIBILITY[node.compatibility];
          return (
            <motion.button
              key={node.type}
              className={styles.suggestionCard}
              onClick={() => onNodeClick && onNodeClick(node)}
              style={{ "--accent-color": compat.color }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.compatIndicator} style={{ background: compat.color }} />
              
              <div className={styles.nodeIcon}>
                <Icon 
                  imageProps={{
                    src: node._src,
                    style: { width: "1.5rem", height: "1.5rem" },
                  }}
                />
              </div>
              
              <div className={styles.nodeContent}>
                <span className={styles.nodeName}>{node.name}</span>
                <span className={styles.nodeReason}>{node.reason}</span>
              </div>
              
              <div className={styles.compatBadge} style={{ color: compat.color }}>
                <Icon 
                  outeIconName={compat.icon}
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextualSuggestions;
