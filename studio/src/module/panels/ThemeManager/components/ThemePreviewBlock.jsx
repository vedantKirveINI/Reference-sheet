import React from "react";
import { DEFAULT_STYLES } from "../utils/themeShapeUtils";
import {
  fontSizeMappingForQuestion,
  fontSizeMappingForDescription,
} from "@/module/constants/question";

/**
 * Compact live preview of theme styles (question text, answer text, button).
 * Used in the custom theme form so users see how their choices will look.
 * Accepts theme in legacy shape with theme.styles.
 * Uses same questionSize -> fontSize mapping as question-section (S/M/L).
 */
const ThemePreviewBlock = ({ theme }) => {
  const themeData = theme || {};
  const styles = { ...DEFAULT_STYLES, ...themeData.styles };
  const nested = themeData.theme;

  const questionSize = styles?.questionSize || "M";
  const questionFontSize = fontSizeMappingForQuestion[questionSize] || fontSizeMappingForQuestion.M;
  const descriptionFontSize = fontSizeMappingForDescription[questionSize] || fontSizeMappingForDescription.M;

  const backgroundColor =
    styles?.backgroundColor ||
    themeData?.background?.color ||
    nested?.background?.color ||
    themeData?.colors?.background ||
    themeData?.backgroundColor ||
    "#FFFFFF";

  const backgroundImage =
    styles?.backgroundImage ||
    themeData?.background?.image ||
    nested?.background?.image ||
    themeData?.backgroundImage;

  const questionColor =
    styles?.questions ||
    themeData?.fonts?.questionColor ||
    themeData?.font?.question?.color ||
    nested?.font?.question?.color ||
    themeData?.colors?.question ||
    themeData?.questionColor ||
    "#1a1a1a";

  const answerColor =
    styles?.answer ||
    themeData?.fonts?.answerColor ||
    themeData?.font?.answer?.color ||
    nested?.font?.answer?.color ||
    themeData?.colors?.answer ||
    themeData?.answerColor ||
    "#666666";

  const fontFamily =
    styles?.fontFamily ||
    themeData?.fonts?.style ||
    themeData?.font?.question?.family ||
    nested?.font?.question?.family ||
    themeData?.fontFamily ||
    "Inter, sans-serif";

  const buttonColor =
    styles?.buttons ||
    themeData?.buttons?.fillColor ||
    themeData?.components?.button?.background ||
    nested?.components?.button?.background ||
    themeData?.colors?.button ||
    themeData?.buttonColor ||
    "#4E97FE";

  const buttonTextColor =
    styles?.buttonText ||
    themeData?.buttons?.textColor ||
    themeData?.components?.button?.text ||
    nested?.components?.button?.text ||
    themeData?.buttonTextColor ||
    "#FFFFFF";

  const buttonCornersValue = styles?.buttonCorners;
  const buttonBorderRadius =
    buttonCornersValue === "rounded"
      ? "8px"
      : buttonCornersValue === "pill"
        ? "9999px"
        : buttonCornersValue === "square"
          ? "0px"
          : themeData?.buttons?.borderRadius ||
            themeData?.components?.button?.borderRadius ||
            nested?.components?.button?.borderRadius ||
            "4px";

  const isImageUrl =
    backgroundImage &&
    typeof backgroundImage === "string" &&
    (backgroundImage.startsWith("http") || backgroundImage.startsWith("data:"));

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-border h-[120px] w-full shrink-0"
      style={{ backgroundColor }}
    >
      {isImageUrl ? (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
      <div
        className="absolute z-10 flex flex-col gap-2"
        style={{ left: "16px", top: "24px", width: "80px" }}
      >
        <div className="flex flex-col">
          <span
            className="font-semibold leading-[32px] tracking-[1px]"
            style={{ color: questionColor, fontFamily, fontSize: questionFontSize }}
          >
            Question
          </span>
          <span
            className="leading-[22px]"
            style={{ color: answerColor, fontFamily, fontSize: descriptionFontSize }}
          >
            Answer
          </span>
        </div>
        <div
          className="w-[44px] h-[20px] shadow-sm rounded-sm"
          style={{
            backgroundColor: buttonColor,
            borderRadius: buttonBorderRadius,
            color: buttonTextColor,
          }}
        />
      </div>
    </div>
  );
};

export default ThemePreviewBlock;
