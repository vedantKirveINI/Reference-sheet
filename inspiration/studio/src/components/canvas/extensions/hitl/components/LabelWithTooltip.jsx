import { ODSTooltip as Tooltip, ODSIcon as Icon } from "@src/module/ods";
import styles from "./LabelWithTooltip.module.css";

export function LabelWithTooltip({
  htmlFor,
  label,
  tooltip,
  required = false,
}) {
  return (
    <div className={styles.labelWithTooltip}>
      <div htmlFor={htmlFor} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </div>
      {tooltip && (
        <Tooltip title={tooltip}>
          <div
            style={{ height: "100%", display: "flex", alignItems: "center" }}
          >
            <Icon outeIconName="OUTEHelpIcon" />
          </div>
        </Tooltip>
      )}
    </div>
  );
}
