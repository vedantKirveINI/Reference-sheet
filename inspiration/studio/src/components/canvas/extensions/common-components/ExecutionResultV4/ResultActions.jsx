import React from "react";
import { Button } from "@/components/ui/button";
import styles from "./styles.module.css";

const ResultActions = ({ actions = [], theme = {} }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.actionsBar}>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className={styles.actionButton}
          style={{
            "--accent-color": theme.accentColor || "#3b82f6",
          }}
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ResultActions;
