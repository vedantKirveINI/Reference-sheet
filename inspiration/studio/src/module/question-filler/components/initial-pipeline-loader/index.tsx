
import React from "react";
import { styles } from "./styles";
import { motion } from "framer-motion";

const InitialPipelineLoader = ({ theme }: { theme: any }) => {
  return (
    <motion.div
      style={styles.container}
      initial={{
        opacity: 0,
        backdropFilter: "blur(10px)",
        backgroundColor: "transparent",
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(0px)",
        backgroundColor: "transparent",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(10px)",
        backgroundColor: "transparent",
      }}
      transition={{ duration: 0.2, ease: "easeIn", delay: 0.2 }}
    >
      <span
        style={{ ...(styles.subTitle), fontFamily: theme?.styles?.fontFamily }}
      >
        Powered by
      </span>
      <span
        style={{ ...(styles.title), fontFamily: theme?.styles?.fontFamily }}
      >
        Tiny Command
      </span>
      <motion.div
        style={styles.loader}
        animate={{ width: ["0%", "20%", "0%"] }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          ease: "easeIn",
          bounce: 0.5,
          bounceDamping: 0.5,
          bounceStiffness: 100,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
};

export default InitialPipelineLoader;
