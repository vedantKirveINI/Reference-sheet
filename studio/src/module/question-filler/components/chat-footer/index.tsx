import React, { useMemo } from "react";
import { ODSTooltip as Tooltip } from "@src/module/ods";
import { borderRadiusMappingForButton, ViewPort, SUBMISSION_STATES, QuestionAlignments } from "@src/module/constants";
import { ODSButton as Button, BUTTON_STATES } from "@src/module/ods";
import { getContainerStyles } from "./styles";
import BrandingButton from "../branding-button";
import { ODSError as Error } from "@src/module/ods";
import { RetryStatus } from "@oute/oute-ds.skeleton.question-v2";

interface ChatFooterProps {
  error?: string;
  theme: any;
  mode: any;
  goNextQuestion: () => void;
  viewPort: any;
  isLoading: boolean;
  isInEditMode: boolean;
  hideBrandingButton?: boolean;
  submissionState?: string;
}

const ChatFooter = ({
  theme = {},
  goNextQuestion,
  viewPort,
  isInEditMode,
  isLoading,
  error = "",
  mode,
  hideBrandingButton = false,
  submissionState,
}: ChatFooterProps) => {
  const isError = Boolean(error);
  const isRetrying = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING;

  const buttonTheme = useMemo(
    () => ({
      // "#D70090"
      buttonBgColor: theme?.styles?.buttons || "#000000",
      buttonTextColor: theme?.styles?.buttonText || "#ffffff",
      borderRadius:
        borderRadiusMappingForButton[theme?.styles?.buttonCorners] ||
        borderRadiusMappingForButton.rounded,
      fontFamily: theme?.styles?.fontFamily,
      padding: "8px 32px",
    }),
    [theme]
  );

  const btnLabel = isInEditMode ? "Save Changes" : "Next";

  const retryStatusTooltipStyles = {
    width: "20rem",
    backgroundColor: "#ffffff",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: ".5rem",
  };

  const buttonElement = (
    <Button
      key={`Card-footer-${btnLabel}-button`}
      label={btnLabel}
      editable={false}
      onClick={goNextQuestion}
      theme={buttonTheme}
      testId="question-cta-button"
      state={isLoading ? BUTTON_STATES?.LOADING : BUTTON_STATES?.DEFAULT}
    />
  );

  return (
    <div
      style={getContainerStyles({
        viewPort: viewPort,
        hideBrandingButton: hideBrandingButton,
      })}
    >
      {!hideBrandingButton && (
        <BrandingButton theme={buttonTheme} viewPort={viewPort} />
      )}

      {isError ? (
        <Error text={error} />
      ) : isRetrying ? (
        <Tooltip
          title={
            <RetryStatus
              isRetrying={isRetrying}
              theme={theme}
              style={retryStatusTooltipStyles}
              questionAlignment={QuestionAlignments.CENTER}
            />
          }
          placement="top"
          arrow
          open={isRetrying}
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 5],
                  },
                },
              ],
            },
            tooltip: {
              sx: {
                backgroundColor: "transparent",
                padding: 0,
                boxShadow: "none",
                "& .MuiTooltip-arrow": {
                  color: "#ffffff",
                },
              },
            },
          }}
        >
          {buttonElement}
        </Tooltip>
      ) : (
        buttonElement
      )}
    </div>
  );
};

export default ChatFooter;
