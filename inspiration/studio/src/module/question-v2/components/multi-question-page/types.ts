import { Mode, ViewPort } from "@oute/oute-ds.core.constants";

export type QuestionValue = {
  response: any;
  error: string;
};

type MultiQuestionPageValue = Record<string, QuestionValue>;

export interface IMultiQuestionPage {
  mode: Mode;
  viewPort: ViewPort;
  isCreator: boolean;
  onChange: any;
  theme: any;
  variables: any;
  state: any;
  answers: any;
  question: any;
  node: any;
  onAddQuestionClick: (questionId: string | null) => void;
  onQuestionSelect: (questionId: string | null) => void;
  selectedQuestionId: string;
  value?: MultiQuestionPageValue;
  isAlignmentCenter?: boolean;
}
