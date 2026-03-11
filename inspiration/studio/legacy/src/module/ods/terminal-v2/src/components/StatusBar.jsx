import React from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../index.jsx";
import styles from '../Terminal.module.css';
import TooltipWrapper from './TooltipWrapper.jsx';

const StatusBar = ({
  showOnlyErrors,
  setShowOnlyErrors,
  showVerbose,
  setShowVerbose,
  clearTerminal,
}) => {
  return (
    <div className={styles.statusBar}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={showOnlyErrors}
          onChange={(e) => setShowOnlyErrors(e.target.checked)}
        />
        Show only errors
      </label>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={showVerbose}
          onChange={(e) => setShowVerbose(e.target.checked)}
        />
        Verbose
      </label>

      <TooltipWrapper
        title="Clear terminal"
        placement="top"
        component={Icon}
        onClick={clearTerminal}
        outeIconName="OUTEClearIcon"
        outeIconProps={{
          sx: { color: "#dc2626", width: "2rem", height: "2rem" },
        }}
      />
    </div>
  );
};

export default StatusBar;
