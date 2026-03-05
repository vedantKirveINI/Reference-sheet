import React from "react";
import DangerErrorIcon from "./assets/danger-error-icon";
import { styles } from "./styles";
import { motion } from "framer-motion";
export type ErrorProps = {
  text?: string;
  style?: any;
  animate?: boolean;
};

const container = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      bounce: 0.5,
      ease: "backIn",
      duration: "0.5",
    },
  },
  remove: {
    opacity: 0,
    x: -60,
    transition: {
      ease: "backOut",
      duration: "0.5",
    },
  },
};

export const Error = ({ text, style = {}, animate = true }: ErrorProps) => {
  return (
    <motion.div
      variants={container}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "show" : undefined}
      exit="remove"
      style={{...styles.container, ...style}}
      data-testid="oute-ds-error-box"
    >
      <DangerErrorIcon width={20} height={21} />
      <p style={styles.text}>{text}</p>
    </motion.div>
  );
};
