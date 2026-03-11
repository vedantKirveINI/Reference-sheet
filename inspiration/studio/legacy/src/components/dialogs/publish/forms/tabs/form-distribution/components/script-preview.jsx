import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import {
  generateEmbedScript,
  extractDomainFromUrl,
  BASE_SCRIPT,
} from "../../../../utils";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./script-preview.module.css";

const ScriptPreview = ({ assetId, mode }) => {
  const { embedMode, embedSettings } = useFormPublishContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const getScriptContent = useCallback(() => {
    const fullUrl = process.env.REACT_APP_FORM_URL;
    const domain = extractDomainFromUrl(fullUrl);
    const divContent = generateEmbedScript(
      embedMode,
      assetId,
      domain,
      mode,
      embedSettings,
    );
    return `${BASE_SCRIPT}
${divContent}`;
  }, [embedMode, assetId, embedSettings, mode]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getScriptContent());
      setShowCopyTooltip(true);
      setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000); // Hide tooltip after 2 seconds
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [getScriptContent]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={classes.container} data-testid="script-preview">
      <motion.div
        className={classes.codeBlock}
        initial={{ height: "6.25rem" }}
        animate={{ height: isExpanded ? "12rem" : "6.25rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className={classes.codeContent}>
          <pre className={classes.codeText}>
            <code>{getScriptContent()}</code>
          </pre>
        </div>
      </motion.div>

      <div className={classes.actionBar}>
        <div
          className={classes.buttonContainer}
          onClick={handleToggleExpand}
          data-testid="expand-button"
        >
          <Icon
            outeIconName={
              isExpanded ? "OUTEExpandLessIcon" : "OUTEOpenFullscreenIcon"
            }
            outeIconProps={{
              sx: {
                fontSize: "1.5rem",
                color: "#212121",
              },
            }}
          />
          <span className={classes.buttonText}>
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </div>

        <div className={classes.copyButtonWrapper}>
          {showCopyTooltip && (
            <div className={classes.copyTooltip}>Content copied</div>
          )}
          <div
            className={classes.buttonContainer}
            onClick={handleCopyCode}
            data-testid="copy-button"
          >
            <Icon
              outeIconName="OUTECopyContentIcon"
              outeIconProps={{
                sx: {
                  fontSize: "1.5rem",
                  color: "#212121",
                },
              }}
            />
            <span className={classes.buttonText}>Copy code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptPreview;
