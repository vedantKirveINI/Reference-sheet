import React, { useRef, useCallback, useEffect, useState } from "react";
import classes from "../../FormulaFXNode.module.css";
import { ODSLabel } from "@src/module/ods";
import FormulaFX from "@src/module/ods/formula-fx/src/FormulaFX";

const Configure = ({ variables, fxContent, setFxContent }) => {
  const formulaRef = useRef();
  const inputContainerRef = useRef(null);
  const [isPopperOpen, setIsPopperOpen] = useState(false);

  const handleInputContentChanged = useCallback(
    (content) => {
      const formulaText = content
        .map((item) => {
          if (typeof item === "string") return item;
          if (item.type === "variable") return `{{${item.value}}}`;
          if (item.type === "function") return item.value;
          return item.value || "";
        })
        .join("");

      setFxContent((prev) => ({
        ...prev,
        formula: formulaText,
        blocks: content,
        type: "fx",
        lastUpdated: Date.now(),
      }));
    },
    [setFxContent]
  );

  const handleError = useCallback(
    (hasError, errors) => {
      setFxContent((prev) => ({
        ...prev,
        errors: errors || [],
      }));
    },
    [setFxContent]
  );

  const handlePopperClose = useCallback(() => {
    setIsPopperOpen(false);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsPopperOpen(true);
  }, []);

  // Only initialize content on mount if it exists and hasn't been set yet
  useEffect(() => {
    if (formulaRef.current && fxContent?.blocks?.length > 0) {
      // Use a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        const currentContent = formulaRef.current?.getContent();
        // Only set if content is empty or different (to avoid resetting user input)
        if (!currentContent || currentContent.length === 0) {
          formulaRef.current.setContent(fxContent.blocks);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  return (
    <div className={classes["formula-fx-container"]}>
      <ODSLabel variant="h6" fontWeight="600">
        Formula FX Input
      </ODSLabel>

      <div ref={inputContainerRef}>
        <FormulaFX
          ref={formulaRef}
          open={isPopperOpen}
          anchorEl={inputContainerRef.current}
          inline={false}
          variables={variables}
          defaultInputContent={fxContent?.blocks || []}
          onInputContentChanged={handleInputContentChanged}
          onError={handleError}
          onClose={handlePopperClose}
          onOpen={handleInputFocus}
          placeholder="Type a formula or describe what you want with AI..."
          showAIAssistant={true}
          showPreview={true}
        />
      </div>

      <ODSLabel variant="capital">How to use Formula FX?</ODSLabel>
      <div className={classes["info-section"]}>
        <div className={classes["info-item"]}>
          <span className={classes["info-icon"]}>1.</span>
          <span>Type naturally - AI will convert your text to a formula</span>
        </div>
        <div className={classes["info-item"]}>
          <span className={classes["info-icon"]}>2.</span>
          <span>Use @ to insert variables from previous steps</span>
        </div>
        <div className={classes["info-item"]}>
          <span className={classes["info-icon"]}>3.</span>
          <span>Click "Fix with AI" if you see any errors</span>
        </div>
      </div>
    </div>
  );
};

export default Configure;
