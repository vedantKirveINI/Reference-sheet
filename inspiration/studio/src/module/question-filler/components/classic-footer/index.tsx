import React, { useMemo } from "react";
import { ODSTooltip as Tooltip } from "@src/module/ods";
import { getContainerStyles } from "./styles";
import { borderRadiusMappingForButton, ViewPort, Mode, SUBMISSION_STATES, QuestionAlignments } from "@src/module/constants";
import { ODSButton as Button, BUTTON_STATES } from "@src/module/ods";
import BrandingButton from "../branding-button";
import { RetryStatus } from "@oute/oute-ds.skeleton.question-v2";

interface ClassicFooterProps {
  isLastNode: boolean;
  viewPort: ViewPort;
  mode: Mode;
  theme: any;
  goNextQuestion: () => void;
  isLoading: boolean;
  hideBrandingButton: boolean;
  submissionState?: string;
}

const ClassicFooter = ({
  viewPort,
  theme,
  isLastNode,
  goNextQuestion,
  isLoading,
  mode,
  hideBrandingButton = false,
  submissionState,
}: ClassicFooterProps) => {
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

  const btnLabel = isLastNode ? "Submit" : "Next";
  const isRetrying = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING;

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
      onClick={goNextQuestion}
      theme={buttonTheme}
      testId="classic-submit-button"
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
      {isRetrying ? (
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

export default ClassicFooter;
