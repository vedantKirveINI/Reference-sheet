import { ODSLabel } from "@src/module/ods";
import { ODSIcon } from "@src/module/ods";
import { Mode, ViewPort, localStorageConstants,  } from "@oute/oute-ds.core.constants";
import { getAlignmentContainerStyles, getAlignmentIconContainerStyles, getAlignmentIconStyle, getAlignmentWrapContainerStyles, getBackgroundInnerDivStyles, getBackgroundOuterDivStyles,  } from "./styles";
import { ALIGNEMENT, OBJECTFIT } from "../../utils/contants";
import { ODSTooltip as ToolTip, cookieUtils } from "@src/module/ods";
import { ImageAlignmentButton } from "./imageAlignmentButton";
export const AlignmentSection = ({
  updateAlignment,
  alignment,
  updateObjectFit,
  objectFit,
}: any) => {
  const mode =
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
    Mode.CARD;
  const viewPort =
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_VIEWPORT) ||
    ViewPort.MOBILE;

  const handleUpdateAlignment = (newAlignment: string) => {
    if (mode === Mode.CARD) {
      updateAlignment({
        ...alignment,
        cardDesktop: newAlignment,
      });
    } else {
      updateAlignment({
        ...alignment,
        classicDesktop: newAlignment,
      });
    }
  };

  const getRightAlignmentColor = () => {
    if (viewPort === ViewPort.MOBILE) return "#C7C7C7";
    if (
      (mode === Mode.CARD && alignment?.cardDesktop === ALIGNEMENT.RIGHT) ||
      (mode === Mode.CLASSIC && alignment?.classicDesktop === ALIGNEMENT.RIGHT)
    ) {
      return "#212121";
    }
    return "#C7C7C7";
  };

  const getLeftAlignmentColor = () => {
    if (viewPort === ViewPort.MOBILE) return "#C7C7C7";
    if (
      (mode === Mode.CARD && alignment?.cardDesktop === ALIGNEMENT.LEFT) ||
      (mode === Mode.CLASSIC && alignment?.classicDesktop === ALIGNEMENT.LEFT)
    ) {
      return "#212121";
    }
    return "#C7C7C7";
  };

  const isBackgroundAlignmentActive = () => {
    if (viewPort === ViewPort.MOBILE) return false;
    if (
      mode === Mode.CARD &&
      alignment?.cardDesktop === ALIGNEMENT.BACKGROUND
    ) {
      return true;
    }
    return false;
  };

  const getResizeColor = ({ buttonType }) => {
    if (
      alignment?.cardDesktop === ALIGNEMENT.BACKGROUND &&
      mode === Mode.CARD &&
      viewPort === ViewPort.DESKTOP
    ) {
      return "#C7C7C7";
    }
    if (buttonType === objectFit) {
      return "#212121";
    }
    return "#C7C7C7";
  };

  const shouldAlignmentButtonDisabled = ({ buttonType }) => {
    if (viewPort === ViewPort.MOBILE || mode === Mode.CHAT) {
      return true;
    }
    if (mode === Mode.CLASSIC && buttonType === ALIGNEMENT.BACKGROUND) {
      return true;
    }
    return false;
  };

  const shouldDisableResizeButtons = () => {
    if (
      alignment?.cardDesktop === ALIGNEMENT.BACKGROUND &&
      mode === Mode.CARD &&
      viewPort === ViewPort.DESKTOP
    ) {
      return true;
    }
    return false;
  };

  return (
    <div
      style={getAlignmentContainerStyles()}
      data-testid="question-augmentor-alignment-root"
    >
      <ODSLabel
        children="Alignment"
        style={{ fontSize: "1.125rem", color: "#000" }}
      />
      <div style={getAlignmentWrapContainerStyles()}>
        <div style={getAlignmentIconContainerStyles()}>
          <ImageAlignmentButton
            title="Align Right"
            iconName="OUTEImageRightAlignIcon"
            iconColor={getRightAlignmentColor()}
            onClick={() => handleUpdateAlignment(ALIGNEMENT.RIGHT)}
            isDisabled={shouldAlignmentButtonDisabled({
              buttonType: ALIGNEMENT.RIGHT,
            })}
            testId="edit-image-alignment-right-icon"
          />
          <ImageAlignmentButton
            title="Align Left"
            iconName="OUTEImageLeftAlignIcon"
            iconColor={getLeftAlignmentColor()}
            onClick={() => handleUpdateAlignment(ALIGNEMENT.LEFT)}
            isDisabled={shouldAlignmentButtonDisabled({
              buttonType: ALIGNEMENT.LEFT,
            })}
            testId="edit-image-alignment-left-icon"
          />

          <ToolTip
            title={"Align Background"}
            placement={"bottom"}
            arrow={false}
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "0.975em",
                },
              },
            }}
          >
            <div
              style={{
                ...getBackgroundOuterDivStyles({
                  isActive: isBackgroundAlignmentActive(),
                  isDisabled: shouldAlignmentButtonDisabled({
                    buttonType: ALIGNEMENT.BACKGROUND,
                  }),
                }),
              }}
              onClick={() => {
                if (
                  !shouldAlignmentButtonDisabled({
                    buttonType: ALIGNEMENT.BACKGROUND,
                  })
                ) {
                  handleUpdateAlignment(ALIGNEMENT.BACKGROUND);
                }
              }}
            >
              <div
                style={{
                  ...getBackgroundInnerDivStyles({
                    isActive: isBackgroundAlignmentActive(),
                  }),
                }}
              >
                <ODSIcon
                  outeIconName="OUTEImageBackgroundAlignIcon"
                  outeIconProps={{
                    "data-testid": "edit-image-alignment-left-icon",
                    sx: {
                      color: isBackgroundAlignmentActive() ? "#fff" : "#C7C7C7",
                    },
                  }}
                  buttonProps={{
                    disabled: shouldAlignmentButtonDisabled({
                      buttonType: ALIGNEMENT.BACKGROUND,
                    }),
                    sx: {
                      padding: "0rem",
                    },
                  }}
                />
              </div>
            </div>
          </ToolTip>
        </div>
        <div
          style={{
            width: "0.0625rem",
            height: "3.02rem",
            backgroundColor: "#CFD8DC",
          }}
        ></div>
        <div style={getAlignmentIconContainerStyles()}>
          <ImageAlignmentButton
            title="Fill"
            iconName="OUTEOpenFullscreenIcon"
            iconColor={getResizeColor({
              buttonType: OBJECTFIT.COVER,
            })}
            onClick={() => updateObjectFit(OBJECTFIT.COVER)}
            isDisabled={shouldDisableResizeButtons()}
            testId="edit-image-alignment-left-icon"
          />

          <ImageAlignmentButton
            title="Fit"
            iconName="OUTECloseFullscreenIcon"
            iconColor={getResizeColor({
              buttonType: OBJECTFIT.CONTAIN,
            })}
            onClick={() => updateObjectFit(OBJECTFIT.CONTAIN)}
            isDisabled={shouldDisableResizeButtons()}
            testId="edit-image-alignment-left-icon"
          />
        </div>
      </div>
    </div>
  );
};
