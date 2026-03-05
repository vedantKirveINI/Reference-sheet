interface VariableData {
  key: string;
  module: string;
  type: string;
  sample_value: string[];
  default: string[];
  path: string[];
  originalPath: string[];
  label: undefined | string;
  pathStr: string;
  nodeName: string;
  nodeId: string;
  nodeType: string;
}

export interface BlockData {
  subCategory: string;
  type: string;
  subType: string;
  value: string;
  background: string;
  foreground: string;
  variableData: VariableData;
}

export function formatQuestionWithNumber(
  question: string | undefined | null,
  questionNumber: number | undefined | null
): string {
  if (!question || typeof question !== "string") return "";
  if (questionNumber == null || isNaN(questionNumber)) return question;

  return `${questionNumber}. ${question.trim()}`;
}

export interface RecallPayload {
  question: string;
  path: string;
  theme: Record<string, string>;
  nodeData: Record<string, any>;
  originalPath: string;
}

export const createRecallPayload = ({
  nodeVariables,
  blockData,
}: {
  nodeVariables: any;
  blockData: BlockData;
}): RecallPayload => {
  const filteredNodeData = nodeVariables?.filter(
    (variable: any) => variable?.key === blockData.variableData.nodeId
  );

  const recallTheme = {
    background: blockData.background,
    foreground: blockData.foreground,
  };

  const nodeData = filteredNodeData[0];

  return {
    question: formatQuestionWithNumber(blockData?.value, nodeData?.nodeNumber),
    path: blockData?.variableData?.path?.join?.("."),
    originalPath: blockData?.variableData?.originalPath?.join?.("."),
    theme: recallTheme,
    nodeData: nodeData,
  };
};
