import React, { forwardRef } from "react";
import { styles } from "./styles";
import { QuestionType } from "@oute/oute-ds.core.constants";
import { answerToText } from "../../utils";
import { CountryInputAnswerRender } from "./country-input-answer-renderer";
import { FileUploadAnswerRender } from "./file-input-answer-renderer";
import { AddressAnswerRenderer } from "./address-input-answer-renderer";
import TextExpander from "../text-expander";

export interface AnswerRendererProps {
  type: QuestionType;
  value: any;
  showFullText?: boolean;
  theme?: any;
  questionData: any;
}

export const AnswerRenderer = forwardRef<
  HTMLParagraphElement,
  AnswerRendererProps
>(({ type, value, showFullText, theme, questionData }, ref) => {
  if (type === QuestionType.TERMS_OF_USE) {
    if (value?.response === "Yes") {
      return <p style={styles.text({ showFullText, theme })}>Agreed</p>;
    }
    if (value?.response === "No") {
      return <p style={styles.text({ showFullText, theme })}>Not Agreed</p>;
    }
    return (
      <p ref={ref} style={styles.text({ showFullText, theme })}>
        No Response
      </p>
    );
  }
  if (
    !value ||
    value?.response === undefined ||
    value?.response === null ||
    value?.response === "" ||
    value?.response?.length === 0 ||
    (questionData?.type === QuestionType.SLIDER && isNaN(value?.response)) ||
    (questionData?.type === QuestionType.PHONE_NUMBER &&
      !value?.response?.phoneNumber) ||
    (questionData?.type === QuestionType.ZIP_CODE &&
      !value?.response?.zipCode) ||
    (questionData?.type === QuestionType.CURRENCY &&
      !value?.response?.currencyValue) ||
    (questionData?.type === QuestionType.DATE && !value?.response?.value) ||
    (questionData?.type === QuestionType.TIME && !value?.response?.time) ||
    (questionData?.type === QuestionType.RANKING &&
      value?.response?.value?.some((item) => !item.rank))
  )
    return (
      <p ref={ref} style={styles.text({ showFullText, theme })}>
        No Response
      </p>
    );
  switch (type) {
    case QuestionType.SHORT_TEXT:
    case QuestionType.LONG_TEXT:
    case QuestionType.MCQ:
    case QuestionType.SCQ:
    case QuestionType.YES_NO:
    case QuestionType.NUMBER:
    case QuestionType.EMAIL:
    case QuestionType.DROP_DOWN_STATIC:
    case QuestionType.DROP_DOWN:
    case QuestionType.SLIDER:
      return (
        <TextExpander
          ref={ref}
          text={answerToText(type, value)}
          showFullText={showFullText}
          collapsedLines={1}
        />
      );
    case QuestionType.STRIPE_PAYMENT:
      return (
        <p style={styles.text({ showFullText, theme })}>
          {`${value?.response?.name} paid ${value?.response?.amount}`}
        </p>
      );
    case QuestionType.DATE:
      const formattedDate = value?.response?.value;

      return <p style={styles.text({ showFullText, theme })}>{formattedDate}</p>;

    //refactor the time response to display the results in chat mode
    case QuestionType.TIME:
      return (
        <p style={styles.text({ showFullText, theme })}>
          {questionData.settings?.isTwentyFourHour
            ? value?.response?.time
            : `${value?.response?.time} ${value?.response?.meridiem}`}
        </p>
      );

    //refactor the ranking response to display the results in chat mode

    case QuestionType.RANKING:
      return (
        <div style={styles.text({ showFullText, theme })}>
          {value?.response?.value?.map((item) => (
            <p key={item.id}>
              {item.rank}.{" "}
              <span>
                {showFullText
                  ? item.label
                  : item.label.length > 10
                    ? `${item.label.slice(0, 30)}...`
                    : item.label}
              </span>
            </p>
          ))}
        </div>
      );

    case QuestionType.RATING:
      return (
        <p style={styles.text({ showFullText, theme })}>
          {value?.response}/{questionData?.settings?.maxRating}
        </p>
      );
    case QuestionType.OPINION_SCALE:
      return (
        <p style={styles.text({ showFullText, theme })}>
          {value?.response}/{questionData?.settings?.maxValue}
        </p>
      );

    case QuestionType.PHONE_NUMBER:
    case QuestionType.CURRENCY:
    case QuestionType.ZIP_CODE:
      return <CountryInputAnswerRender type={type} value={value} />;

    case QuestionType.FILE_PICKER:
      return <FileUploadAnswerRender type={type} value={value} />;
    case QuestionType.SIGNATURE:
      return (
        <img src={value?.response} alt="Signature" style={{ width: "100%" }} />
      );
    case QuestionType.ADDRESS:
      return (
        <AddressAnswerRenderer
          value={value}
          style={styles.text({ showFullText, theme })}
        />
      );
    default:
      return "No Response";
  }
});
