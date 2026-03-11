import React from "react";
import { SchemaList } from "./SchemaList.jsx";
import { processNodeVariablesForSchemaList } from "../utils/fx-utils.jsx";

const NodeVariableSection = ({
  nodeVariables,
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
  onClick = () => {},
  onHover = () => {},
  hoveredBlockId = null,
}) => {
  const processedNodes = processNodeVariablesForSchemaList(nodeVariables || []);

  return (
    <div>
      {processedNodes.map((node, index) => (
        <SchemaList
          key={`${node.key}_${index}`}
          node={node}
          parentKey={node.key}
          onClick={onClick}
          onHover={onHover}
          hoveredBlockId={hoveredBlockId}
          isVerbose={isVerbose}
          defaultExpanded={defaultExpanded}
          showArrayStructure={showArrayStructure}
        />
      ))}
    </div>
  );
};

export default NodeVariableSection;
