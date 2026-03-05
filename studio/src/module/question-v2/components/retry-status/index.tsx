import { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TTheme } from "@oute/oute-ds.core.constants";
import { useRetryStatus } from "./use-retry-status";
import { getRetryStatusStyles } from "./styles";
export interface RetryStatusProps {
  isRetrying?: boolean;
  theme?: TTheme;
  style?: CSSProperties;
  questionAlignment?: string;
}

const CONSTANT_MESSAGE = "Your response hasn't been sent yet.";

const RETRY_MESSAGES = {
  1: "Trying to submit. We'll try again in {X} seconds…",
  2: "Hmm... still no luck. We'll retry in {X} seconds…",
  3: "Sorry, still trying to submit. Retrying in {X} seconds…",
  4: "Well, this is embarrassing. Retrying in {X} seconds...",
} as const;

export const RetryStatus = ({
  isRetrying = false,
  theme,
  style,
  questionAlignment,
}: RetryStatusProps) => {
  const { messageIndex, countdown } = useRetryStatus(isRetrying);
  const styles = getRetryStatusStyles({ theme, style, questionAlignment });

  if (!isRetrying) {
    return null;
  }

  const getRetryMessage = () => {
    const messageTemplate =
      RETRY_MESSAGES[messageIndex as keyof typeof RETRY_MESSAGES];
    if (!messageTemplate) {
      return null;
    }

    return messageTemplate.replace("{X}", countdown.toString());
  };

  const retryMessage = getRetryMessage();

  return (
    <div style={styles.container} data-testid="retry-status">
      <motion.div
        style={styles.constantMessage}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {CONSTANT_MESSAGE}
      </motion.div>
      <AnimatePresence mode="wait">
        {retryMessage && (
          <motion.div
            key={messageIndex}
            style={styles.retryMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {retryMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
