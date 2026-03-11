import { QuestionType, QuestionAlignments } from "@oute/oute-ds.core.constants";

type CollectionTreeChild = {
  title: string;
  id?: string;
  type?: string;
  children: CollectionTreeChild[];
};

export type Collection = {
  title: string;
  id?: string;
  children: CollectionTreeChild[];
};

export type IQuestionRepeator = {
  _id: string;
  question: string;
  description: string;
  type: QuestionType;
  module: "Question";
  buttonLabel: string;
  value: Collection[];
  settings: {
    questionAlignment: keyof typeof QuestionAlignments;
    required: boolean;
    accessKey: string;
    collectionData: Collection;
  };
};

export interface QuestionRepeatorProps {
  isCreator: boolean;
  question: IQuestionRepeator;
  onChange: (key: string, value: any) => void;
  variables: Record<string, any>;
  answers: Record<string, any>;
  theme: Record<string, any>;
  value: Record<string, any>[];
}
