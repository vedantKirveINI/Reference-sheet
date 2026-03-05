import { useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "./styles";
type RedirectScreenProps = {
  theme?: any;
  redirectUrl: string;
};

const RedirectScreen = ({ theme, redirectUrl }: RedirectScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);

    return () => clearTimeout(timer);
  }, [redirectUrl]);

  const buttonColor = theme?.styles?.buttons || "#0D0D0D";
  const fontFamily = theme?.styles?.fontFamily || "inherit";

  return (
    <motion.div
      style={styles.container}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        style={styles.content}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.div
          style={{ ...(styles.spinner), borderTopColor: buttonColor }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <h2
          style={{
            ...(styles.title),
            fontFamily: fontFamily,
            color: buttonColor,
          }}
        >
          Redirecting...
        </h2>
        <p
          style={{
            ...(styles.subtitle),
            fontFamily: fontFamily,
          }}
        >
          Please wait while we redirect you
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RedirectScreen;
