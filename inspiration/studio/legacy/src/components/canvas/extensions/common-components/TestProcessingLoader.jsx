import { useState, useEffect } from "react";
import styles from "./TestProcessingLoader.module.css";

const PROCESSING_STAGES = [
  {
    id: "preparing",
    label: "Preparing inputs",
    description: "Validating and formatting your test data",
    duration: 1000,
  },
  {
    id: "sending",
    label: "Sending request",
    description: "Transmitting data to processing server",
    duration: 2000,
  },
  {
    id: "processing",
    label: "Processing",
    description: "Executing node logic and calculations",
    duration: 2000,
  },
  {
    id: "receiving",
    label: "Receiving results",
    description: "Fetching and formatting output data",
    duration: 1500,
  },
];

const TestProcessingLoader = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStage >= PROCESSING_STAGES.length) return;

    const stage = PROCESSING_STAGES[currentStage];
    let stageProgress = 0;
    const progressInterval = 50;
    const increment = (100 / stage.duration) * progressInterval;

    const progressTimer = setInterval(() => {
      stageProgress += increment;
      if (stageProgress >= 100) {
        stageProgress = 100;
        clearInterval(progressTimer);
        setTimeout(() => {
          if (currentStage < PROCESSING_STAGES.length - 1) {
            setCurrentStage((prev) => prev + 1);
            setProgress(0);
          }
        }, 200);
      } else {
        const overallProgress =
          (currentStage / PROCESSING_STAGES.length) * 100 +
          stageProgress / PROCESSING_STAGES.length;
        setProgress(overallProgress);
      }
    }, progressInterval);

    return () => clearInterval(progressTimer);
  }, [currentStage]);

  const currentStageData =
    PROCESSING_STAGES[currentStage] || PROCESSING_STAGES[0];

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderContent}>
        {/* Minimalist Spinner */}
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <h3 className={styles.title}>{currentStageData.label}</h3>
          </div>

          <p className={styles.description}>{currentStageData.description}</p>

          {/* Minimal Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stage Dots */}
        <div className={styles.stageDots}>
          {PROCESSING_STAGES.map((_, index) => (
            <div
              key={index}
              className={`${styles.stageDot} ${
                index < currentStage
                  ? styles.completed
                  : index === currentStage
                    ? styles.active
                    : styles.pending
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestProcessingLoader;
