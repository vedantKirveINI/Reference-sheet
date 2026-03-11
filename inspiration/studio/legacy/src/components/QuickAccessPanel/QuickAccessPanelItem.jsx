import React from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import styles from "./styles.module.css";

const QuickAccessPanelItem = ({ node, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(node);
    }
  };

  // Get icon name from node or use default
  const iconName = node.icon || "OUTEAddIcon";

  // Get background color from node or use default
  const backgroundColor = node.background || "rgba(0, 0, 0, 0.05)";
  const foregroundColor = node.foreground || "#212121";

  return (
    <div
      className={styles.panel_item}
      onClick={handleClick}
      data-testid={`quick-access-item-${node.type}`}
      style={{
        "--item-bg": backgroundColor,
        "--item-fg": foregroundColor,
      }}
    >
      <div
        className={styles.item_icon}
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        {node._src ? (
          <img
            src={node._src}
            alt={node.name}
            className={styles.item_icon_image}
          />
        ) : (
          <Icon
            outeIconName={iconName}
            outeIconProps={{
              sx: {
                color: foregroundColor,
                width: "1.25rem",
                height: "1.25rem",
              },
            }}
          />
        )}
      </div>
      <span className={styles.item_label}>{node.name}</span>
    </div>
  );
};

export default QuickAccessPanelItem;
