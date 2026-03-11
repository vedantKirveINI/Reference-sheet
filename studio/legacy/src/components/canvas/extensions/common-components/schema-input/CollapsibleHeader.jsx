import styles from "./CollapsibleHeader.module.css";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
const CollapsibleHeader = ({
  isCollapsed,
  onToggle,
  title,
  children,
  className = "",
  isEmpty,

  showRemoveButton = false,
  onRemove,
}) => {
  return (
    <div
      className={`${styles.collapsibleHeader} ${className}`}
      onClick={onToggle}
    >
      {!isEmpty && (
        <Icon
          outeIconName={"OUTEChevronRightIcon"}
          outeIconProps={{
            sx: {
              color: "#212121",
              width: "1.25rem",
              height: "1.25rem",
              transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
            },
          }}
        />
      )}
      <span className={styles.title}>{title}</span>
      {children}
      {showRemoveButton && (
        <Icon
          outeIconName="OUTETrashIcon"
          outeIconProps={{
            sx: { color: "#212121", width: "1.25rem", height: "1.25rem" },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        />
      )}
    </div>
  );
};

export default CollapsibleHeader;
