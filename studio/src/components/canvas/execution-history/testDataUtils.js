import { testOutputCache } from "../extensions/common-components/CommonTestModuleV3";

export const getTestDataSummary = (nodeKey) => {
  const cached = testOutputCache.get(nodeKey);
  if (!cached || !cached.isTestComplete) return null;

  const output = cached.executionOutput || cached.output;
  let fieldCount = 0;
  if (output && typeof output === "object") {
    fieldCount = Object.keys(output).length;
  }

  return {
    hasTestData: true,
    fieldCount,
    output,
    executionInput: cached.executionInput,
  };
};

export const syncTestDataToNodes = (canvasRef) => {
  if (!canvasRef?.current) return;
  const diagram = canvasRef.current.getDiagram?.();
  if (!diagram) return;

  diagram.startTransaction("syncTestData");
  testOutputCache.forEach((cached, nodeKey) => {
    const node = diagram.findNodeForKey(nodeKey);
    if (node && cached.isTestComplete) {
      const output = cached.executionOutput || cached.output;
      let fieldCount = 0;
      if (output && typeof output === "object") {
        fieldCount = Object.keys(output).length;
      }
      diagram.model.setDataProperty(node.data, "_hasTestData", true);
      diagram.model.setDataProperty(node.data, "_testDataFieldCount", fieldCount);
    }
  });
  diagram.commitTransaction("syncTestData");
};

export const clearNodeTestData = (canvasRef, nodeKey) => {
  if (!canvasRef?.current) return;
  const diagram = canvasRef.current.getDiagram?.();
  if (!diagram) return;

  const node = diagram.findNodeForKey(nodeKey);
  if (!node) return;

  diagram.startTransaction("clearTestData");
  diagram.model.setDataProperty(node.data, "_hasTestData", false);
  diagram.model.setDataProperty(node.data, "_testDataFieldCount", 0);
  diagram.commitTransaction("clearTestData");
};

export const markNodeTestData = (canvasRef, nodeKey, output) => {
  if (!canvasRef?.current) return;
  const diagram = canvasRef.current.getDiagram?.();
  if (!diagram) return;

  const node = diagram.findNodeForKey(nodeKey);
  if (!node) return;

  let fieldCount = 0;
  if (output && typeof output === "object") {
    fieldCount = Object.keys(output).length;
  }

  diagram.startTransaction("markTestData");
  diagram.model.setDataProperty(node.data, "_hasTestData", true);
  diagram.model.setDataProperty(node.data, "_testDataFieldCount", fieldCount);
  diagram.commitTransaction("markTestData");
};
