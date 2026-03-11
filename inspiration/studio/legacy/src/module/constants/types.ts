import { QuestionType } from "./questionType";

export type TTheme = Record<string, any>;
export type TVariables = Record<string, any>;
export type TRescourcesIds = Record<string, any>;

export type TQuestion = {
  _id: string;
  question: string;
  type: QuestionType;
  description: string;
  module: "Question";
  value?: any;
  buttonLabel: string;
  options?: any[];
  placeholder?: string;
  augmentor?: Record<string, any>;
  settings?: Record<string, any>;
} & Record<string, any>;
