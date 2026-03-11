import { Play, RotateCcw } from "lucide-react";
import styles from "./ContextualTestScreen.module.css";

const ContextualTestScreen = ({
  title = "Ready to Test",
  description = "Run a test to validate your configuration and see how your node processes data.",
  tips = [],
  icon: IconComponent = Play,
  theme = {},
  onRunTest,
  isProcessing = false,
  isRerun = false,
}) => {
  const accentColor = theme.accentColor || "#3b82f6";
  const primaryButtonBg = theme.primaryButtonBg || accentColor;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div 
          className={styles.iconWrapper}
          style={{ 
            background: `${accentColor}10`,
            borderColor: `${accentColor}20`
          }}
        >
          <IconComponent 
            className={styles.icon} 
            style={{ color: accentColor }}
          />
        </div>

        <div className={styles.textContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        {tips.length > 0 && (
          <div className={styles.tipsSection}>
            <span className={styles.tipsLabel}>Quick tips</span>
            <ul className={styles.tipsList}>
              {tips.map((tip, index) => (
                <li key={index} className={styles.tipItem}>
                  <span 
                    className={styles.tipBullet}
                    style={{ background: accentColor }}
                  />
                  <span className={styles.tipText}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className={styles.testButton}
          style={{ 
            background: primaryButtonBg,
            boxShadow: `0 4px 14px ${accentColor}30`
          }}
          onClick={onRunTest}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className={styles.buttonSpinner} />
              <span>Running Test...</span>
            </>
          ) : isRerun ? (
            <>
              <RotateCcw className={styles.buttonIcon} />
              <span>Rerun Test</span>
            </>
          ) : (
            <>
              <Play className={styles.buttonIcon} />
              <span>Run Test</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContextualTestScreen;
