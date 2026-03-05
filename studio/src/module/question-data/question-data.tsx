import { Mode, QuestionType, ViewPort } from "@oute/oute-ds.core.constants";
import DropdownData from "./components/dropdown";
import TextPreviewData from "./components/textPreview";

export interface IQuestionDataProps {
  question: any;
  onChange: (question: any) => void;
  viewPort: ViewPort;
  mode: Mode;
  variables: any;
}

export const QuestionData = ({
  question,
  onChange,
  viewPort,
  mode,
  variables = {},
}: IQuestionDataProps) => {
  const QuestionTabComponent = {
    [QuestionType.DROP_DOWN]: DropdownData,
    [QuestionType.TEXT_PREVIEW]: TextPreviewData,
  }[question.type];

  return QuestionTabComponent ? (
    <QuestionTabComponent
      question={question}
      onChange={onChange}
      viewPort={viewPort}
      mode={mode}
      variables={variables}
    />
  ) : null;
};
