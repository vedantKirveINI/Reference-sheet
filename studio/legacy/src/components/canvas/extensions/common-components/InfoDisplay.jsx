import React from "react";
import styles from "./InfoDisplay.module.css";

function InfoDisplay({ title = "", description = "" }) {
  return (
    <div className={styles.container} data-testid="info-display">
      <h2 className={styles.title} data-testid="info-display-title">
        {title}
      </h2>
      <p className={styles.description} data-testid="info-display-description">
        {description}
      </p>
    </div>
  );
}

export default InfoDisplay;
