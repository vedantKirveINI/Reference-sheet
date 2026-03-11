import { useCallback, useMemo } from "react";
import { borderRadiusMappingForButton, ViewPort, Mode } from "@src/module/constants";
import { getButtonContainerStyles, getContainerStyles, getButtonIconStyles, } from "./styles";
import DownArrow from "../../assets/icon/down-arrow";
import UpArrow from "../../assets/icon/up-arrow";
import BrandingButton from "../branding-button";
import { icons } from "@/components/icons";

const LoaderIcon = icons.loader2;

interface CardFooterProps {
  theme?: any;
  goNextQuestion: () => void;
  goPreviousQuestion: () => void;
  viewPort?: ViewPort;
  isLastNode: boolean;
  isFirstNode: boolean;
  mode?: Mode;
  hideBrandingButton?: boolean;
  loading?: boolean;
}

const CardFooter = ({
  theme = {},
  goNextQuestion,
  goPreviousQuestion,
  viewPort,
  isFirstNode,
  isLastNode,
  mode,
  hideBrandingButton = false,
  loading = false,
}: CardFooterProps) => {
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

  const handlePreviousclick = useCallback(() => {
    goPreviousQuestion();
  }, [goPreviousQuestion]);

  const handleNextclick = useCallback(() => {
    if (!loading) goNextQuestion();
  }, [goNextQuestion, isLastNode, isFirstNode, loading]);

  return (
    <div style={getContainerStyles({ viewPort: viewPort, mode: mode })}>
      {!hideBrandingButton && (
        <BrandingButton theme={buttonTheme} mode={mode} viewPort={viewPort} />
      )}
      <div style={getButtonContainerStyles()}>
        <UpArrow
          fill={buttonTheme.buttonTextColor}
          style={getButtonIconStyles({
            theme: buttonTheme,
            disabled: isFirstNode,
          })}
          onClick={handlePreviousclick}
          data-testid="prev-button"
        />
        <span
          style={{
            ...getButtonIconStyles({
              theme: buttonTheme,
              disabled: isLastNode || loading,
            }),
            pointerEvents: loading ? "none" : undefined,
          }}
          onClick={handleNextclick}
          data-testid="next-button"
          role="button"
          aria-busy={loading}
          aria-label={loading ? "Loading" : "Next"}
        >
          {loading ? (
            <LoaderIcon
              className="animate-spin"
              style={{ color: buttonTheme.buttonTextColor, width: "1.25em", height: "1.25em" }}
            />
          ) : (
            <DownArrow fill={buttonTheme.buttonTextColor} />
          )}
        </span>
      </div>
    </div>
  );
};

export default CardFooter;
