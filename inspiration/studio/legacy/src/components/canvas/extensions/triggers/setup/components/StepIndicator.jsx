import React from "react";
import styles from "./StepIndicator.module.css";

const StepIndicator = ({ 
  currentStep, 
  totalSteps = 3, 
  steps = ["Select app", "Trigger Type", "Connection"],
  completedSteps = []
}) => {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((stepLabel, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className={styles.stepItem}>
            <div className={styles.stepContent}>
              <div 
                className={`${styles.stepCircle} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ""} ${isCompleted ? styles.completedLabel : ""}`}>
                {stepLabel}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.stepConnector} ${isCompleted ? styles.completedConnector : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
