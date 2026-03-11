export type TNode = {
  type: string;
  id: string;
} & {
  [key: string]: any;
};

export type TAnswers =
  | {
      [qId: string]: {
        response: string;
        error?: string;
        isMapped?: boolean;
      };
    }
  | object;

export type TStateMap = {
  [key: TNode["id"]]: string;
};

export type ExecuteTransformNodeOptions = {
  currentNode: TNode;
  type: string;
  answers: TAnswers;
  allNodes: any;
  taskGraph: any;
  variables: any;
};
