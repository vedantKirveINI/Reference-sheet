import { motion, AnimatePresence } from "framer-motion";
import { styles } from "./styles";
import React, { forwardRef } from "react";

interface TextExpanderProps {
  text: string;
  showFullText?: boolean;
  collapsedLines?: number;
  theme?: any;
}

export default forwardRef(function TextExpander(
  { text, showFullText, collapsedLines = 2, theme }: TextExpanderProps,
  ref: React.ForwardedRef<HTMLParagraphElement>
) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {showFullText ? (
        <motion.div
          key="full"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={styles.textContainer}
        >
          <motion.p style={styles.text({ theme, styles: {} })}>{text}</motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="less"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={styles.textContainer}
        >
          <motion.p
            ref={ref}
            style={{
              ...(styles.collapsedText),
              ...(styles.text({ theme, styles: {} })),
              WebkitLineClamp: collapsedLines,
            }}
          >
            {text}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
