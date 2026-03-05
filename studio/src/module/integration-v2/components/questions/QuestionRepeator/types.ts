import { TVariables } from "@oute/oute-ds.core.constants";

export type QuestionValue = {
  response: any;
  error: string;
};

type QuestionRepeatorValue = Record<string, QuestionValue> & {
  _id: number;
};

export interface IQuestionRepeatorProps {
  onChange: (key: string, value: any) => void;
  theme: Record<string, any>;
  variables: TVariables;
  answers: Record<string, any>;
  question: any;
  value?: QuestionRepeatorValue[];
}
