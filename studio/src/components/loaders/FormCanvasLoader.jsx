import React, { useState, useEffect } from "react";
import styles from "./canvas-loader.module.css";

const journeySteps = [
  "Preparing your form...",
  "Loading form builder...",
  "Setting up components...",
  "Almost ready...",
];

const FormCanvasLoader = () => {
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
        <div className={`${styles.formFieldsContainer} ${styles.floatUp}`}>
          <div className={`${styles.formHeader} ${styles.shimmer} ${styles.stagger1}`} />
          <div className={`${styles.formTextField} ${styles.shimmer} ${styles.stagger1}`} />
          <div className={`${styles.formTextFieldShort} ${styles.shimmer} ${styles.stagger2}`} />
          <div className={`${styles.formDropdown} ${styles.shimmer} ${styles.stagger3}`}>
            <div className={styles.formDropdownArrow} />
          </div>
          <div className={styles.formCheckboxGroup}>
            <div className={`${styles.formCheckboxRow} ${styles.pulse} ${styles.stagger2}`}>
              <div className={styles.formCheckbox} />
              <div className={styles.formCheckboxLabel} style={{ width: '120px' }} />
            </div>
            <div className={`${styles.formCheckboxRow} ${styles.pulse} ${styles.stagger3}`}>
              <div className={styles.formCheckbox} />
              <div className={styles.formCheckboxLabel} style={{ width: '150px' }} />
            </div>
            <div className={`${styles.formCheckboxRow} ${styles.pulse} ${styles.stagger4}`}>
              <div className={styles.formCheckbox} />
              <div className={styles.formCheckboxLabel} style={{ width: '100px' }} />
            </div>
          </div>
          <div className={`${styles.formButton} ${styles.shimmer} ${styles.stagger4}`} />
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

export default FormCanvasLoader;
