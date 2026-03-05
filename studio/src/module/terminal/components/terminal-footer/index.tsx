import React from "react";
import styles from "./index.module.css";
import { ODSCheckbox, ODSIcon } from "@src/module/ods";
import TooltipWrapper from "../tooltip-wrapper";

interface TerminalFooterProps {
  verbose: boolean;
  showErrorOnly: boolean;
  onVerboseChange: (checked: boolean) => void;
  onShowErrorOnlyChange: (checked: boolean) => void;
  onClearTerminal: () => void;
  showClearTerminal?: boolean;
}

const TerminalFooter = ({
  verbose,
  showErrorOnly,
  onVerboseChange,
  onShowErrorOnlyChange,
  onClearTerminal,
  showClearTerminal = false,
}: TerminalFooterProps) => {
  return (
    <div className={`${styles.footer} terminal-footer`}>
      <div className={styles.checkboxContainerWrapper}>
        <div
          className={`${styles.checkboxContainer} terminal-checkbox-container`}
        >
          <ODSCheckbox
            variant="black"
            checked={verbose}
            onChange={(e) => onVerboseChange(e?.target?.checked)}
          />
          <span>Verbose</span>
        </div>
        <div
          className={`${styles.checkboxContainer} terminal-checkbox-container`}
        >
          <ODSCheckbox
            variant="black"
            checked={showErrorOnly}
            onChange={(e) => onShowErrorOnlyChange(e?.target?.checked)}
          />
          <span>Show Errors Only</span>
        </div>
      </div>
      {showClearTerminal && (
        <TooltipWrapper
          title="Clear terminal"
          placement="top"
          component={ODSIcon}
          onClick={onClearTerminal}
          outeIconName="OUTEClearIcon"
          outeIconProps={{
            sx: { color: "#dc2626", width: "2rem", height: "2rem" },
          }}
        />
      )}
    </div>
  );
};

export default TerminalFooter;
