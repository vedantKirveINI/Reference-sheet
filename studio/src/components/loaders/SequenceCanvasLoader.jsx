import React, { useState, useEffect } from "react";
import styles from "./canvas-loader.module.css";

const journeySteps = [
  "Preparing your sequence...",
  "Loading sequence builder...",
  "Setting up timeline...",
  "Almost ready...",
];

const SequenceCanvasLoader = () => {
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
        <div className={styles.timelineContainer}>
          <div className={`${styles.timelineLine} ${styles.shimmer}`} />
          <div className={`${styles.timelineStep} ${styles.floatUp} ${styles.stagger1}`}>
            <div className={`${styles.timelineBlock} ${styles.shimmer}`} />
            <div className={`${styles.timelineDot} ${styles.pulse}`} />
          </div>
          <div className={`${styles.timelineStep} ${styles.floatUp} ${styles.stagger2}`}>
            <div className={`${styles.timelineBlock} ${styles.shimmer}`} />
            <div className={`${styles.timelineDot} ${styles.pulse}`} />
          </div>
          <div className={`${styles.timelineStep} ${styles.floatUp} ${styles.stagger3}`}>
            <div className={`${styles.timelineBlock} ${styles.shimmer}`} />
            <div className={`${styles.timelineDot} ${styles.pulse}`} />
          </div>
          <div className={`${styles.timelineStep} ${styles.floatUp} ${styles.stagger4}`}>
            <div className={`${styles.timelineBlock} ${styles.shimmer}`} />
            <div className={`${styles.timelineDot} ${styles.pulse}`} />
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

export default SequenceCanvasLoader;
