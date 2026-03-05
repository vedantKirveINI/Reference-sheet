import React, { useState, useEffect } from "react";
import styles from "./canvas-loader.module.css";

const journeySteps = [
  "Preparing your workspace...",
  "Loading workflow components...",
  "Setting up your canvas...",
  "Almost ready...",
];

const WorkflowCanvasLoader = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % journeySteps.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.progressBar} />
      <div className={styles.skeletonArea}>
        <div className={styles.workflowGrid}>
          <div className={styles.workflowRow}>
            <div className={`${styles.node} ${styles.shimmer} ${styles.floatUp} ${styles.stagger1}`} />
            <div className={`${styles.connectorLine} ${styles.shimmer} ${styles.pulse}`} />
            <div className={`${styles.node} ${styles.shimmer} ${styles.floatUp} ${styles.stagger2}`} />
          </div>
          <div className={`${styles.connectorLineVertical} ${styles.shimmer} ${styles.pulse}`} />
          <div className={styles.workflowRow}>
            <div className={`${styles.nodeSmall} ${styles.shimmer} ${styles.floatUp} ${styles.stagger3}`} />
            <div className={`${styles.connectorLine} ${styles.shimmer} ${styles.pulse}`} />
            <div className={`${styles.nodeSmall} ${styles.shimmer} ${styles.floatUp} ${styles.stagger4}`} />
          </div>
        </div>
      </div>
      <div className={styles.journeyText}>
        <span className={visible ? styles.fadeEnter : styles.fadeExit}>
          {journeySteps[stepIndex]}
        </span>
      </div>
    </div>
  );
};

export default WorkflowCanvasLoader;
