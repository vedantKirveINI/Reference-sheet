import { ODSInfoCard as InfoCard } from "@src/module/ods";
import {
  borderRadiusMappingForButton,
  DEFAULT_QUESTION_CONFIG,
} from "@oute/oute-ds.core.constants";
import { useDeferredValue, useMemo, useState } from "react";
import { serverConfig } from "@src/module/ods";
import { Button } from "@/components/ui/button";
import styles from "./styles";
import FacebookIcon from "./icons/facebook.svg";
import LinkedinIcon from "./icons/linkedin.svg";
import XIcon from "./icons/x-icon.svg";

export type EndingProps = {
  isCreator?: boolean;
  theme?: any;
  question?: any;
  onChange?: any;
  onRestart?: any;
  isPreviewMode?: boolean;
  focusButtonLabelEditor?: () => void;
};

export function Ending({
  isCreator,
  theme,
  question,
  onChange,
  onRestart = () => {},
  isPreviewMode,
  focusButtonLabelEditor = () => {},
}: EndingProps) {
  const [showHelper, setShowHelper] = useState(false);
  const questionAlignment = question?.settings?.questionAlignment || "center";
  // const shareUrl = window.location.href;
  const shareUrl = `${serverConfig.TINY_COMMAND_URL}/`;
  const title = "Fill the form with TinyCommand";
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=filler.tinycommand.com&p[title]=${title}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `filler.tinycommand.com`
  )}`;
  const xHref = `https://twitter.com/intent/post?url=filler.tinycommand.com&text=${title}`;

  const buttonTheme = {
    buttonBgColor: theme?.styles?.buttons || "#000000",
    buttonTextColor: theme?.styles?.buttonText || "#ffffff",
    borderRadius:
      borderRadiusMappingForButton[theme?.styles?.buttonCorners] ||
      borderRadiusMappingForButton.rounded,
    fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
    fontSize: "1.25em !important",
    padding: "0.5em 2em",
    minHeight: "2.3em",
  };

  const showCTA = useMemo(() => {
    if (
      question?.settings?.showCTA === undefined ||
      question?.settings?.showCTA === null
    ) {
      return true;
    }
    return question?.settings?.showCTA;
  }, [question?.settings?.showCTA]);

  const buttonThemeDeffered = useDeferredValue(buttonTheme);

  const getRedirectUrl = () => {
    let redirectURL = question?.settings?.redirectURL;
    if (redirectURL) {
      if (
        !redirectURL.startsWith("http://") &&
        !redirectURL.startsWith("https://")
      ) {
        redirectURL = `https://${redirectURL}`;
      }
      return redirectURL;
    }

    return "https://tinycommand.com";
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      style={{ alignItems: questionAlignment }}
      data-testid="ending-question-root"
    >
      {question?.settings?.promotionalText && (
        <div
          className="w-full min-w-0 max-w-full text-center mb-4"
          style={{ color: theme?.styles?.questions }}
          data-testid="ending-promotional-text"
        >
          <p className="break-words break-all">
            {question.settings.promotionalText}
          </p>
        </div>
      )}
      {showCTA && (
        <div className="flex flex-col items-center justify-center">
          <Button
            type="button"
            size="lg"
            className="min-h-[2.3em] text-[1.25em] px-8 font-medium"
            style={{
              backgroundColor: buttonThemeDeffered?.buttonBgColor,
              color: buttonThemeDeffered?.buttonTextColor,
              borderRadius: buttonThemeDeffered?.borderRadius,
              fontFamily: buttonThemeDeffered?.fontFamily,
              pointerEvents: isCreator ? "none" : undefined,
              cursor: isCreator ? "default" : undefined,
            }}
            onClick={() => {
              if (!isCreator) {
                window.open(getRedirectUrl(), "_blank");
              } else {
                setShowHelper(true);
              }
            }}
            data-testid="ending-question-button"
          >
            <span
              dangerouslySetInnerHTML={{
                __html:
                  question?.buttonLabel ||
                  DEFAULT_QUESTION_CONFIG[question?.type]?.buttonLabel ||
                  "",
              }}
            />
          </Button>
          {question?.settings?.brandText && (
            <p
              className="text-sm mt-2"
              style={{ color: theme?.styles?.questions }}
            >
              {question.settings.brandText}
            </p>
          )}
        </div>
      )}

      {isCreator && showHelper && (
        <InfoCard
          helperText={
            <div data-testid="ending-helper-text">
              Button is clickable in preview mode and when form is filled.
              Although you can{" "}
              <span
                style={styles.editableText}
                onClick={() => {
                  focusButtonLabelEditor();
                  setShowHelper(false);
                }}
                data-testid="ending-helper-editable-text"
              >
                Edit button text
              </span>{" "}
              in settings.
            </div>
          }
          style={{
            alignSelf: question?.settings?.questionAlignment,
          }}
          onClickAway={() => setShowHelper(false)}
        />
      )}
      {question?.settings?.submitAnotherResponse && (
        <Button
          type="button"
          size="lg"
          className="min-h-[2.3em] px-8 font-medium mt-2"
          style={{
            backgroundColor: theme?.styles?.buttons || "#000000",
            color: theme?.styles?.buttonText || "#ffffff",
            fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
            borderRadius: buttonThemeDeffered?.borderRadius,
            cursor: isCreator ? "default" : undefined,
            pointerEvents: isCreator ? "none" : undefined,
          }}
          onClick={isPreviewMode ? onRestart : () => window.location.reload()}
          data-testid="ending-question-submit-button"
        >
          SUBMIT AGAIN
        </Button>
      )}
      {question?.settings?.socialShareIcons && (
        <div className="flex gap-4 mt-4">
          <a
            href={facebookHref}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition-opacity"
            data-testid="ending-question-facebook-button"
          >
            <img src={FacebookIcon} alt="facebook" className="w-8 h-8" />
          </a>

          <a
            href={xHref}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition-opacity"
            data-testid="ending-question-twitter-button"
          >
            <img src={XIcon} alt="twitter" className="w-8 h-8" />
          </a>
          <a
            href={linkedinHref}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition-opacity"
            data-testid="ending-question-linkedin-button"
          >
            <img src={LinkedinIcon} alt="linkedin" className="w-8 h-8" />
          </a>
        </div>
      )}
    </div>
  );
}
