import {
  Mode,
  TQuestion,
  TVariables,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import {
  Handlers,
  StateConfig,
  UIConfig,
  NodeDataConfig,
} from "../../shared/lib";

export type QuestionValue = {
  response: any;
  error: string;
};

type CreatorQuestionRepeatorValue = Record<string, QuestionValue>;

export interface ICreatorQuestionRepeator {
  mode: Mode;
  viewPort: ViewPort;
  isCreator: StateConfig["isCreator"];
  onChange: Handlers["onChange"];
  theme: UIConfig["theme"];
  variables: TVariables;
  state: NodeDataConfig["state"];
  answers: StateConfig["answers"];
  question: TQuestion;
  node: NodeDataConfig["node"];
  onAddQuestionClick: (questionId: string | null) => void;
  onQuestionSelect: (questionId: string | null) => void;
  selectedQuestionId: StateConfig["selectedSubQuestionId"];
  value?: CreatorQuestionRepeatorValue[];
  isAlignmentCenter?: boolean;
}
