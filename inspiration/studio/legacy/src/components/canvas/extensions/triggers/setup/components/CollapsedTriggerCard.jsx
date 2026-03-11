import React from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import styles from "./SelectTrigger.module.css";

const CollapsedTriggerCard = ({ trigger, onChangeClick = () => {} }) => {
  if (!trigger) return null;

  return (
    <div className={styles.collapsedContainer}>
      <div className={styles.collapsedInfo}>
        <div className={styles.collapsedIcon}>
          <Icon
            imageProps={{
              src: trigger._src,
              style: { width: "1.5rem", height: "1.5rem" },
            }}
          />
        </div>
        <span className={styles.collapsedTitle}>{trigger.name}</span>
      </div>
      <button
        className={styles.changeButton}
        onClick={onChangeClick}
        type="button"
      >
        Change
      </button>
    </div>
  );
};

export default CollapsedTriggerCard;
