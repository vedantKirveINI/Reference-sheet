import { QuestionType } from "@oute/oute-ds.core.constants";
import { TAnswers, TNode } from "../execute-transform-node/types";

type TAllNodes = {
  [key: string]: TNode;
};

export type TCheckNodeDependencyProps = {
  answers: TAnswers;
  node: TNode;
  executedNodesHashSet?: Set<string>;
};

export type QuestionConfig = {
  question: string;
  description: string;
  type: QuestionType;
  used_ref_src_ids?: string[];
  settings: { [key: string]: any };
};
