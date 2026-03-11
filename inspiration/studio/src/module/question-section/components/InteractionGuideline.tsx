import { QuestionType } from "@oute/oute-ds.core.constants";
import { getMCQGuideline } from "../utils/index";
export type InteractionGuidelineProps = {
  type: string;
  settings: any;
  value: any;
  style: any;
  theme: any;
};

export const InteractionGuideline = ({
  type,
  settings,
  value,
  style,
  theme,
}: InteractionGuidelineProps) => {
  const guidelineMessages = {
    [QuestionType.MCQ]: getMCQGuideline({ settings, value }),
  };

  const message = guidelineMessages[type];

  if (!message) {
    return null;
  }
  return (
    <div
      style={{
        ...style,
        color: theme?.styles?.buttons,
        fontFamily: theme?.styles?.fontFamily,
        fontSize: "1.125em",
      }}
      data-testid="question-interaction-guideline"
    >
      {message}
    </div>
  );
};
