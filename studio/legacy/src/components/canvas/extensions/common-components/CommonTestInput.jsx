import { useState, useEffect } from "react";
import styles from "./CommonTestInput.module.css";
import CollapsibleHeader from "./schema-input/CollapsibleHeader";
import SchemaInput from "./schema-input/SchemaInput";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSLabel as Label, ODSIcon as Icon } from "@src/module/ods";

import { QUESTIONS_NODES } from "../question-setup/constants/questionNodes";

const RenderHeader = ({ inputData, inputKey }) => {
  const questionType = inputData?.schema?.[0]?.schema?.[0]?.nodeType;
  const nodeIcon = QUESTIONS_NODES?.[questionType]?._src;

  return (
    <div className={styles.header}>
      {nodeIcon && (
        <img src={nodeIcon} alt={questionType} className={styles.nodeIcon} />
      )}
      <span>{inputData?.nodeName || `Input ${inputKey}`}</span>
    </div>
  );
};

const CommonTestInput = ({ inputs = {}, onValuesChange }) => {
  const [allValues, setAllValues] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(allValues);
    }
  }, [allValues, onValuesChange]);

  const handleSchemaChange = (inputKey, values) => {
    setAllValues((prev) => ({
      ...prev,
      [inputKey]: values,
    }));
  };

  const toggleSection = (inputKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [inputKey]: !prev[inputKey],
    }));
  };

  return (
    <div className={styles.commonTestContainer}>
      <div className={styles.infoContainer}>
        <Icon
          outeIconName="OUTEInfoIcon"
          outeIconProps={{
            sx: { color: "#2196F3", width: "1.25rem", height: "1.25rem" },
          }}
        />
        <Label variant="subtitle1">
          This node uses mapped responses from previous steps. Please fill in
          sample inputs and click TEST to run the test.
        </Label>
      </div>
      {Object.entries(inputs?.blocks).map(([inputKey, inputData]) => (
        <div key={inputKey} className={styles.inputSection}>
          <CollapsibleHeader
            title={<RenderHeader inputData={inputData} inputKey={inputKey} />}
            isCollapsed={collapsedSections[inputKey] || false}
            onToggle={() => toggleSection(inputKey)}
          />

          {!collapsedSections[inputKey] && (
            <SchemaInput
              schema={inputData.schema}
              onValuesChange={(values) => handleSchemaChange(inputKey, values)}
            />
          )}
        </div>
      ))}

      {Object.keys(inputs?.blocks).length === 0 && (
        <div className={styles.emptyState}>No inputs provided</div>
      )}
    </div>
  );
};

export default CommonTestInput;
