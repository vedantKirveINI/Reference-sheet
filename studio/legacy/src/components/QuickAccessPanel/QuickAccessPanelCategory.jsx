import React from "react";
import QuickAccessPanelItem from "./QuickAccessPanelItem";
import styles from "./styles.module.css";

const QuickAccessPanelCategory = ({ label, nodes = [], onNodeClick }) => {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel_category}>
      <div className={styles.category_header}>
        <span className={styles.category_label}>{label}</span>
      </div>
      <div className={styles.category_items}>
        {nodes.map((node, index) => (
          <QuickAccessPanelItem
            key={`${node.type}-${node.name}-${index}`}
            node={node}
            onClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccessPanelCategory;
