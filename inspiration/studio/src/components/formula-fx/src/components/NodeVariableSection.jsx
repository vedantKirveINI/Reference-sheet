import React from "react";
import { SchemaList } from "./SchemaList.jsx";
import { processNodeVariablesForSchemaList } from "../utils/fx-utils.jsx";

const NodeVariableSection = ({
  nodeVariables,
  processedNodes: processedNodesProp = null,
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
  onClick = () => { },
  onHover = () => { },
  onInsertFormula = null,
  selectedBlockId = null,
  expectedType = "any",
}) => {
  const processedNodes =
    Array.isArray(processedNodesProp) && processedNodesProp.length > 0
      ? processedNodesProp
      : processNodeVariablesForSchemaList(nodeVariables || []);

  return (
    <div>
      {processedNodes.map((node, index) => (
        <SchemaList
          key={`${node.key}_${index}`}
          node={node}
          parentKey={node.key}
          onClick={onClick}
          onHover={onHover}
          onInsertFormula={onInsertFormula}
          selectedBlockId={selectedBlockId}
          isVerbose={isVerbose}
          defaultExpanded={defaultExpanded}
          showArrayStructure={showArrayStructure}
          expectedType={expectedType}
        />
      ))}
    </div>
  );
};

export default NodeVariableSection;
