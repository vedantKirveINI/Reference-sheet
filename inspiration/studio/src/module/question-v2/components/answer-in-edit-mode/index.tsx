
import React, { useRef, useEffect } from "react";

import { QuestionType, ViewPort } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import EditIcon from "../../assets/icon/edit-icon";
import { AnswerRenderer } from "../answer-renderer";

type AnswerInEditModeProps = {
  onEdit: any;
  type: QuestionType;
  value: any;
  viewPort?: ViewPort;
  theme?: any;
  questionData?: any;
  index?: any;
};

export const AnswerInEditMode = ({
  value,
  type,
  onEdit,
  viewPort,
  theme,
  index,
  questionData,
}: AnswerInEditModeProps) => {
  const [showFullText, setShowFullText] = React.useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = React.useState<
    boolean | null
  >(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!textRef.current) return;
      const { scrollWidth, clientWidth, scrollHeight, clientHeight } =
        textRef.current;
      const overflowHorizontal = scrollWidth > clientWidth;
      const overflowVertical = scrollHeight > clientHeight;
      setIsTextOverflowing(
        overflowHorizontal || overflowVertical ? true : null
      );
    };
    const raf = requestAnimationFrame(() => {
      checkOverflow();
    });
    const fallbackId = setTimeout(checkOverflow, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallbackId);
    };
  }, [value]);

  const questionToExclude = [
    QuestionType.WELCOME,
    QuestionType.ENDING,
    QuestionType.QUOTE,
    QuestionType.LOADING,
  ];

  const excludeQuestion = questionToExclude.includes(type);
  if (excludeQuestion) {
    return null;
  }

  return (
    <div style={styles.container}>
      <button
        aria-label="edit"
        data-testid={`chat-${type}-edit-${index}`}
        onClick={onEdit}
        style={styles.editBtn}
      >
        <EditIcon />
      </button>
      <div
        style={styles.textContainer({ viewPort, theme })}
        data-testid={`chat-${type}-response-${index}`}
      >
        <AnswerRenderer
          ref={textRef}
          type={type}
          value={value}
          showFullText={showFullText}
          theme={theme}
          questionData={questionData}
        />

        {isTextOverflowing && (
          <span
            style={styles.text({
              styles: { cursor: "pointer", textDecorationLine: "underline" },
              showFullText,
              theme,
            })}
            onClick={() => setShowFullText(!showFullText)}
          >
            {showFullText ? "Read less" : "Read more"}
          </span>
        )}
      </div>
    </div>
  );
};
