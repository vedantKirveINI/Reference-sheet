import React from "react";
import styles from "./circular-loader.module.css";

export const CircularLoader = () => {
  return (
    <div
      data-testid="fds-atom-button-loading-indicator"
      className={styles.loader}
    />
  );
};
