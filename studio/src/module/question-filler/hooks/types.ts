import { QuestionType } from "@src/module/constants";

type TPipelineValue = {
  nodeId: string;
  index: number | null;
  isValidated?: boolean;
};

export type TPipelines = Record<string, TPipelineValue>;

export type TAnswerValue = {
  id?: string;
  response: any;
  error?: string;
};

export type TAnswers = Record<string, TAnswerValue>;

export type TNode = {
  type: QuestionType;
  id: string;
} & {
  [key: string]: any;
};

export type TNodes = Record<string, TNode>;

export type TEventType = {
  node: TNode;
  response: any;
  type: "success" | "error";
};
