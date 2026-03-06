import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ODSButton as Button, BUTTON_STATES } from "@src/module/ods";
import { borderRadiusMappingForButton } from "@src/module/constants";
import { ODSIcon } from '@src/module/ods';
import { styles } from "./styles";
import { TRuntimeErrorScreenProps } from "./types";
import { cn } from "@/lib/utils";

const RuntimeErrorScreen = ({
  theme = {},
  errorType = "generic",
  errorMessage,
  technicalDetails,
  onRestart,
}: TRuntimeErrorScreenProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const buttonTheme = useMemo(
    () => ({
      buttonBgColor: theme?.styles?.buttons || "#0066ff",
      buttonTextColor: theme?.styles?.buttonText || "#ffffff",
      borderRadius:
        borderRadiusMappingForButton[theme?.styles?.buttonCorners] ||
        borderRadiusMappingForButton.rounded,
      fontFamily: theme?.styles?.fontFamily,
      padding: "0.625rem 1.5rem",
    }),
    [theme]
  );

  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }

    switch (errorType) {
      case "infinite_loop":
        return "We detected a navigation loop in the form. This prevents you from continuing.";
      case "invalid_jump":
        return "The form tried to navigate to a section that's not available in your current path.";
      default:
        return "A navigation error occurred while processing the form flow. Please try restarting the form to resolve the issue.";
    }
  };

  const getTechnicalDetailsText = () => {
    if (!technicalDetails) {
      return "No technical details available.";
    }

    const details = [
      technicalDetails.errorCode && `Error Code: ${technicalDetails.errorCode}`,
      technicalDetails.timestamp && `Timestamp: ${technicalDetails.timestamp}`,
      technicalDetails.sessionId && `Session ID: ${technicalDetails.sessionId}`,
    ]
      .filter(Boolean)
      .join("\n");

    return details || "No technical details available.";
  };

  const fontFamily = theme?.styles?.fontFamily || "Inter, sans-serif";

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={styles.contentWrapper}
        className="sm:gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Warning Icon */}
        <motion.div
          style={styles.iconContainer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ODSIcon
            outeIconName="OUTEWarningIcon"
            outeIconProps={{
              sx: {
                color: "#f59e0b",
                width: "2.5rem",
                height: "2.5rem",
              },
            }}
          />
        </motion.div>

        {/* Content */}
        <div style={styles.content}>
          <h1
            style={{
              ...styles.heading,
              fontFamily,
            }}
          >
            Something Went Wrong
          </h1>
          <p
            style={{
              ...styles.description,
              fontFamily,
            }}
          >
            {getErrorMessage()}
          </p>
        </div>

        {/* Restart Button */}
        <motion.div
          style={styles.buttonContainer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            label="Restart Form"
            editable={false}
            onClick={onRestart}
            theme={buttonTheme}
            testId="runtime-error-restart-button"
            state={BUTTON_STATES?.DEFAULT}
          />
        </motion.div>

        {/* Technical Details */}
        {technicalDetails && (
          <div style={styles.divider}>
            <details
              style={styles.detailsContainer}
              open={isDetailsOpen}
              onToggle={(e) => {
                const target = e.currentTarget as HTMLDetailsElement;
                setIsDetailsOpen(target.open);
              }}
            >
              <summary style={styles.detailsSummary} className="[&::-webkit-details-marker]:hidden">
                <p
                  style={{
                    ...styles.detailsSummaryText,
                    fontFamily,
                  }}
                >
                  Show technical details
                </p>
                <ODSIcon
                  outeIconName="OUTEExpandLessIcon"
                  outeIconProps={{
                    sx: {
                      color: "#71717a",
                      width: "1.25rem",
                      height: "1.25rem",
                      transform: isDetailsOpen
                        ? "rotate(0deg)"
                        : "rotate(180deg)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                />
              </summary>
              <motion.div
                initial={false}
                animate={{
                  height: isDetailsOpen ? "auto" : 0,
                  opacity: isDetailsOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={styles.detailsContentWrapper}
              >
                <div style={styles.detailsContent}>
                  <pre style={styles.detailsPre}>
                    <code>{getTechnicalDetailsText()}</code>
                  </pre>
                </div>
              </motion.div>
            </details>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RuntimeErrorScreen;
