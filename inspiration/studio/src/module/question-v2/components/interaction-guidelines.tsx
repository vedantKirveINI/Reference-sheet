import { QuestionType } from "@oute/oute-ds.core.constants";
import { getMCQGuideline } from "../utils";
export type InteractionGuidelinesProps = {
  type: string;
  settings: any;
  value: any;
  style: any;
};

export const InteractionGuidelines = ({
  type,
  settings,
  value,
  style,
}: InteractionGuidelinesProps) => {
  const guidelineMessages = {
    [QuestionType.MCQ]: getMCQGuideline({ settings, value }),
  };

  const message = guidelineMessages[type];

  if (!message) {
    return null;
  }
  return (
    <div style={style} data-testid="question-interaction-guideline">
      {message}
    </div>
  );
};
