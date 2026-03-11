import React from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";

const VIEW_MODES = [
  { id: "grid", label: "Grid", icon: "OUTEGridIcon" },
  { id: "list", label: "List", icon: "OUTEListIcon" },
  { id: "compact", label: "Compact", icon: "OUTECompactIcon" },
];

const ViewModeToggle = ({ mode = "grid", onModeChange }) => {
  return (
    <div className={styles.container}>
      {VIEW_MODES.map((viewMode) => (
        <button
          key={viewMode.id}
          className={`${styles.modeButton} ${mode === viewMode.id ? styles.active : ""}`}
          onClick={() => onModeChange?.(viewMode.id)}
          title={viewMode.label}
          type="button"
        >
          <Icon outeIconName={viewMode.icon} sx={{ fontSize: "1rem" }} />
        </button>
      ))}
    </div>
  );
};

export default ViewModeToggle;
