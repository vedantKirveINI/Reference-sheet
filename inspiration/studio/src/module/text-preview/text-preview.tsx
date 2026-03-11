import React, { useCallback, useEffect, useState } from "react";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { ODSIcon, ODSButton } from "@src/module/ods";
import { styles } from "./styles";
import { QuestionTab, removeTagsFromString,  } from "@oute/oute-ds.core.constants";
export type TextPreviewProps = {
  /**
   * a node to be rendered in the special component.
   */
  onChange?: (value) => void;
  isCreator?: boolean;
  theme?: any;
  question?: any;
  answers?: any;
  state?: any;
  goToTab: any;
  dataTestId?: string;
};

export function TextPreview({
  isCreator,
  theme,
  question,
  answers = {},
  state = {},
  goToTab,
  dataTestId,
}: TextPreviewProps) {
  const [value, setValue] = useState("");

  const contentType = question?.settings?.contentType;
  const dynamicContent = question?.settings?.dynamicContent;
  const staticContent = question?.settings?.staticContent;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(removeTagsFromString(value));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
    }
  };

  const safeStringify = (value) => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return "";
    }
  };

  const resolveFX = (_value) => {
    try {
      const res = OuteServicesFlowUtility?.resolveValue(
        { ...answers, ...state },
        "",
        _value,
        null
      );
      return res?.value;
    } catch (error) {
    }
  };

  useEffect(() => {
    if (contentType === "Dynamic") {
      const resolvedValue = resolveFX(dynamicContent);
      if (typeof resolvedValue === "string") {
        setValue(resolvedValue);
      } else {
        setValue(safeStringify(resolvedValue));
      }
    } else {
      setValue(staticContent);
    }
  }, [value, isCreator]);

  const onClickEdit = useCallback(() => {
    isCreator && goToTab(QuestionTab.DATA);
  }, [goToTab, isCreator]);

  if (isCreator) {
    return (
      <div
        style={{
          ...(styles.editor),
          color: theme?.styles?.buttons,
          overflowY: "auto",
          cursor: "pointer",
          fontFamily: `${theme?.styles?.fontFamily || "Helvetica Neue"}`,
        }}
        data-testid={dataTestId}
        dangerouslySetInnerHTML={{
          __html:
            "💡 This is a read-only preview field. Use it to show important instructions, reference information, or personalized messages. Choose between static text or dynamic values pulled from previous answers.",
        }}
        onClick={onClickEdit}
      />
    );
  }

  const isDisabled = isCopied || !removeTagsFromString(value);

  return (
    <div>
      <div
        style={{
          ...styles.editor,
          color: theme?.styles?.buttons,
          background: "rgba(255, 255, 255, 0.70)",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          display: "flex",
          flexDirection: "column",
        }}
        data-testid={dataTestId}
        dangerouslySetInnerHTML={{ __html: value }}
      />
      <div style={styles.buttonContainer}>
        <ODSButton
          variant="black-text"
          onClick={handleCopy}
          data-testid={`${dataTestId}-copy-button`}
          label={isCopied ? <p style={styles.copiedText}>Copied!</p> : "Copy"}
          disabled={isDisabled}
          endIcon={
            <ODSIcon
              outeIconName={isCopied ? "OUTEDoneIcon" : "OUTECopyContentIcon"}
              outeIconProps={{
                sx: {
                  color: isCopied
                    ? "#50aa34ff"
                    : isDisabled
                      ? "#c0bcbcff"
                      : "#212121",
                },
              }}
            />
          }
        />
      </div>
    </div>
  );
}
