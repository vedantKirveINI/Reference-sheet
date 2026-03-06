import LineIcon from "../../assets/icons/LineIcon";
import IconToolTipButton from "../icon-tool-tip-button";
import FillBigIcon from "../../assets/icons/FIllBigIcon";
import FillBigSelectedIcon from "../../assets/icons/FillBigSelectedIcon";
import FitBigIcon from "../../assets/icons/FitBigIcon";
import FitBigSelectedIcon from "../../assets/icons/FitBigSelectedIcon";
import LeftAlignSelected from "../../assets/icons/leftAlignSelected.svg";
import LeftAlignNotSelected from "../../assets/icons/leftAlignNotSelected.svg";
import RightAlignSelected from "../../assets/icons/rightAlignSelected.svg";
import RightAlignNotSelected from "../../assets/icons/rightAlignNotSelected.svg";
import TopAlignSelected from "../../assets/icons/topAlignSelected.svg";
import TopAlignNotSelected from "../../assets/icons/topAlignNotSelected.svg";
import CenterAlignSelected from "../../assets/icons/centerAlignSelected.svg";
import CenterAlignNotSelected from "../../assets/icons/centerAlignNotSelected.svg";
import { Mode, ViewPort, localStorageConstants,  } from "@oute/oute-ds.core.constants";
import { getAlignmentContainerStyles, getAlignmentWrapContainerStyles, getHeadingTextStyles, getAlignmentIconsStyles, getAlignmentIconContainerStyles, getImagesIconsStyles,  } from "./styles";
import { cookieUtils } from "@src/module/ods";
export const AlignmentSection = ({
  updateAlignment,
  alignment,
  updateObjectFit,
  objectFit,
  viewPort,
}: any) => {
  const mode =
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
    Mode.CARD;

  const isMobileView = viewPort === ViewPort.MOBILE;
  let augmentorAlignment = "";
  if (mode === Mode.CARD) {
    if (isMobileView) {
      augmentorAlignment = alignment?.cardMobile;
    } else {
      augmentorAlignment = alignment?.cardDesktop;
    }
  } else {
    if (isMobileView) {
      augmentorAlignment = "top";
    } else {
      augmentorAlignment = alignment?.classicDesktop;
    }
  }

  const handleUpdateAlignment = (newAlignment: string) => {
    if (isMobileView) {
      if (mode === Mode.CARD) {
        updateAlignment({
          ...alignment,
          cardMobile: newAlignment,
        });
      }
    } else {
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
    }
  };

  return (
    <div
      style={getAlignmentContainerStyles()}
      data-testid="question-augmentor-alignment-root"
    >
      {mode !== Mode.CHAT ? (
        <>
          <div style={getAlignmentWrapContainerStyles()}>
            <span style={getHeadingTextStyles()}>Alignment</span>
            <div style={getAlignmentIconContainerStyles()}>
              {!isMobileView && (
                <>
                  <IconToolTipButton
                    onClick={() => {
                      handleUpdateAlignment("left");
                    }}
                    dataTestId="question-augmentor-alignment-left-button"
                    icon={
                      augmentorAlignment === "left" ? (
                        <img
                          src={LeftAlignSelected}
                          style={getImagesIconsStyles}
                          alt=""
                        />
                      ) : (
                        <img
                          src={LeftAlignNotSelected}
                          style={getImagesIconsStyles}
                          alt=""
                        />
                      )
                    }
                    tooltip="Align Left"
                    style={getAlignmentIconsStyles()}
                  />
                  <IconToolTipButton
                    onClick={() => {
                      handleUpdateAlignment("right");
                    }}
                    dataTestId="question-augmentor-alignment-right-button"
                    icon={
                      augmentorAlignment === "right" ? (
                        <img
                          src={RightAlignSelected}
                          style={getImagesIconsStyles}
                          alt=""
                        />
                      ) : (
                        <img
                          src={RightAlignNotSelected}
                          style={getImagesIconsStyles}
                          alt=""
                        />
                      )
                    }
                    tooltip="Align Right"
                    style={getAlignmentIconsStyles()}
                  />
                </>
              )}
              {mode === Mode.CARD && (
                <IconToolTipButton
                  onClick={() => {
                    handleUpdateAlignment("background");
                  }}
                  dataTestId="question-augmentor-alignment-background-button"
                  icon={
                    augmentorAlignment === "background" ? (
                      <img
                        src={CenterAlignSelected}
                        style={getImagesIconsStyles}
                        alt=""
                      />
                    ) : (
                      <img
                        src={CenterAlignNotSelected}
                        style={getImagesIconsStyles}
                        alt=""
                      />
                    )
                  }
                  tooltip="Background"
                  style={getAlignmentIconsStyles()}
                />
              )}
              {isMobileView && (
                <IconToolTipButton
                  onClick={() => {
                    handleUpdateAlignment("top");
                  }}
                  dataTestId="question-augmentor-alignment-top-button"
                  icon={
                    augmentorAlignment === "top" ? (
                      <img
                        src={TopAlignSelected}
                        style={getImagesIconsStyles}
                        alt=""
                      />
                    ) : (
                      <img
                        src={TopAlignNotSelected}
                        style={getImagesIconsStyles}
                        alt=""
                      />
                    )
                  }
                  tooltip="Align Top"
                  style={getAlignmentIconsStyles()}
                />
              )}
            </div>
          </div>
          <LineIcon height={61} />
        </>
      ) : null}
      <div style={getAlignmentWrapContainerStyles()}>
        <span style={getHeadingTextStyles()}>Object Fit</span>
        <div style={getAlignmentIconContainerStyles()}>
          <IconToolTipButton
            onClick={() => {
              updateObjectFit("cover");
            }}
            dataTestId="question-augmentor-object-fill-button"
            icon={
              objectFit === "cover" ? (
                <FillBigSelectedIcon style={getImagesIconsStyles} />
              ) : (
                <FillBigIcon style={getImagesIconsStyles} />
              )
            }
            tooltip="Fill"
            style={getAlignmentIconsStyles()}
          />
          <IconToolTipButton
            onClick={() => {
              updateObjectFit("contain");
            }}
            dataTestId="question-augmentor-object-fit-button"
            icon={
              objectFit === "contain" ? (
                <FitBigSelectedIcon style={getImagesIconsStyles} />
              ) : (
                <FitBigIcon style={getImagesIconsStyles} />
              )
            }
            tooltip="Fit"
            style={getAlignmentIconsStyles()}
          />
        </div>
      </div>
    </div>
  );
};
