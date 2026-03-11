import React from "react";
import styles from "./index.module.css";
import { motion } from "framer-motion";
// import ODSIcon from "oute-ds-icon";
// import ODSButton from "oute-ds-button";
// import ODSLabel from "oute-ds-label";
import { ODSIcon, ODSButton, ODSLabel } from "@src/module/ods";

export const TroubleShootCard = ({ onContactUsClicked = () => {} }) => {
  return (
    <motion.div
      className={styles.container}
      data-testid="trouble-shoot-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
    >
      <motion.div
        className={styles.card}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Content */}
        <div className={styles.content}>
          <ODSLabel
            variant="h6"
            sx={{
              fontWeight: 600,
              maxWidth: "16rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            data-testid="title"
          >
            Having trouble?
          </ODSLabel>
          <ODSLabel variant="body2" color="#607D8B">
            Need assistance? We&apos;re here to help you through any issues
            you&apos;re facing.
          </ODSLabel>
        </div>

        <ODSButton
          label="CONTACT US"
          variant="black"
          onClick={onContactUsClicked}
          startIcon={
            <ODSIcon
              outeIconName="OUTESupportAgentIcon"
              outeIconProps={{
                sx: { color: "#fff" },
              }}
            />
          }
          size="large"
          sx={{
            width: "100%",
            cursor: "pointer !important",
            borderRadius: "0.875rem",
            height: "2.75rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: "0.02em",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.18)",
            },
          }}
        />
      </motion.div>
    </motion.div>
  );
};
