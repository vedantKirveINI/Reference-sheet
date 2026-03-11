import React from "react";
import styles from './index.module.css';
import { SchemaList } from '../schema-list/index.jsx';
import { processNodeVariablesForSchemaList } from '../../utils/fx-utils.jsx';

const NodeVariableSection = ({
  nodeVariables,
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
  onClick = () => {},
}) => {
  // const processedSchemaData = nodeVariables.map((node) => {
  //   const firstSchema = node.data?.schema?.schema[0];
  //   if (firstSchema?.schema?.length === 1) {
  //     return {
  //       ...firstSchema.schema[0],
  //       background: node.light,
  //       foreground: node.foreground,
  //       name: node.description || node.name,
  //       type: firstSchema.schema[0]?.type || node.type,
  //       key: firstSchema.schema[0].key,
  //       nodeId: node.key,
  //       module: node.module,
  //     };
  //   } else {
  //     return {
  //       ...firstSchema,
  //       background: node.light,
  //       foreground: node.foreground,
  //       name: node.description || node.name,
  //       type: firstSchema?.type || node.type,
  //       key: node.key,
  //       nodeId: node.key,
  //       module: node.module,
  //     };
  //   }
  // });

  return (
    <div className={styles.list}>
      {processNodeVariablesForSchemaList(nodeVariables).map((node, index) => (
        <SchemaList
          key={`${node.key}_${index}`}
          node={node}
          parentKey={node.key}
          onClick={onClick}
          isVerbose={isVerbose}
          defaultExpanded={defaultExpanded}
          showArrayStructure={showArrayStructure}
        />
      ))}
    </div>
  );
};

export default NodeVariableSection;
