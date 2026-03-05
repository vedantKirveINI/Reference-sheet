import { QuestionType } from "@src/module/constants";

export type TAnswers =
  | {
      [qId: string]: {
        response: string;
        error?: string;
      };
    }
  | {};

export type TPipeLine = {
  qId: string;
  index: number;
  isAnswered?: boolean;
};

export type TNode = {
  type: QuestionType;
  id: string;
} & {
  [key: string]: any;
};

export type UseCardNewRunnerReturnType = {
  answers: TAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<TAnswers>>;
  loading: boolean;
  pipeline: TPipeLine[] | undefined;
  restart: () => void;
  goPreviousQuestion: () => void;
  executeIndependentNode: ({
    ref,
    userAnswers,
  }: {
    ref: any;
    userAnswers: any;
  }) => void;
  allNodes: TNode;
  error: string | null;
  setError: (error: string | null) => void;
  restarting: boolean;
  isFormSubmitted: boolean;
};
