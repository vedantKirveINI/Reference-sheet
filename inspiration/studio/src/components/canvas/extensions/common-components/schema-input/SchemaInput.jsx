import { useState, useCallback } from "react";
import PrimitiveInput from "./PrimitiveInput";
import ArrayInput from "./ArrayInput";
import ObjectInput from "./ObjectInput";
import AnyInput from "./AnyInput";
import DirectJsonInput from "./DirectJsonInput";
import JsonOutput from "./JsonOutput";
import styles from "./SchemaInput.module.css";
import DateInput from "./DateInput";

const SchemaInput = ({ schema, onValuesChange, path = [], value = {} }) => {
  const [localValues, setLocalValues] = useState(value);

  const getDisplayName = useCallback((item) => {
    return item.displayKeyName || item.label || item.key || "field";
  }, []);

  const getActualKey = useCallback((item) => {
    return (
      item.keys || item.key || item.displayKeyName || item.label || "field"
    );
  }, []);

  const handleValueChange = useCallback(
    (newPath, newValue) => {
      //   console.log("[v0] Schema values changed:", {
      //     [newPath.join(".")]: newValue,
      //   });
      const updatedValues = { ...localValues };

      // Set nested value using path
      let current = updatedValues;
      for (let i = 0; i < newPath.length - 1; i++) {
        if (!current[newPath[i]]) {
          current[newPath[i]] = {};
        }
        current = current[newPath[i]];
      }
      current[newPath[newPath.length - 1]] = newValue;

      setLocalValues(updatedValues);
      onValuesChange?.(updatedValues);
    },
    [localValues, onValuesChange]
  );

  const getCurrentValue = (inputPath) => {
    let current = localValues;
    for (const pathSegment of inputPath) {
      current = current?.[pathSegment];
    }
    return current;
  };

  const renderInput = useCallback(
    (item, key, currentValue, onChange) => {
      const itemType = item.type?.toLowerCase() || item.Type?.toLowerCase();
      const itemKey = getDisplayName(item);

      switch (itemType) {
        case "string":
        case "number":
        case "boolean":
          return (
            <div key={item.id || key}>
              <PrimitiveInput
                type={itemType}
                label={itemKey}
                value={currentValue}
                onChange={onChange}
              />
            </div>
          );
        case "date":
          return (
            <div key={item.id || key}>
              <DateInput
                label={itemKey}
                value={currentValue}
                onChange={onChange}
              />
            </div>
          );

        case "any":
          return (
            <div key={item.id || key}>
              <AnyInput
                label={itemKey}
                value={currentValue}
                onChange={onChange}
              />
            </div>
          );

        case "array": {
          const arraySchema = item.schema?.[0];
          const hasValidArraySchema =
            arraySchema && (arraySchema.type || arraySchema.Type);

          if (!hasValidArraySchema) {
            return (
              <div key={item.id || key}>
                <DirectJsonInput
                  label={itemKey}
                  value={currentValue}
                  onValueChange={onChange}
                  type="array"
                />
              </div>
            );
          }

          return (
            <div key={item.id || key}>
              <ArrayInput
                label={itemKey}
                value={currentValue}
                arraySchema={arraySchema}
                onValueChange={onChange}
                renderInput={renderInput}
                getActualKey={getActualKey}
                getDisplayName={getDisplayName}
              />
            </div>
          );
        }
        case "json":
        case "object": {
          const objectSchema = item.schema;
          const hasValidObjectSchema =
            objectSchema &&
            Array.isArray(objectSchema) &&
            objectSchema.length > 0;

          if (!hasValidObjectSchema) {
            return (
              <div key={item.id || key}>
                <DirectJsonInput
                  label={itemKey}
                  value={currentValue}
                  onValueChange={onChange}
                  type="object"
                />
              </div>
            );
          }

          return (
            <div key={item.id || key}>
              <ObjectInput
                label={itemKey}
                value={currentValue}
                schema={objectSchema}
                onValueChange={onChange}
                renderInput={renderInput}
                getActualKey={getActualKey}
              />
            </div>
          );
        }
        default:
          return null;
      }
    },
    [getDisplayName, getActualKey]
  );

  const renderSchema = (schemaItems, basePath = []) => {
    if (!Array.isArray(schemaItems)) return null;

    return schemaItems.map((item, index) => {
      const itemKey = getActualKey(item) || `item_${index}`;
      const currentPath = [...basePath, itemKey];
      const currentValue = getCurrentValue(currentPath);
      const adjustedPath =
        currentPath.length === 1 && itemKey === "field" ? [] : currentPath; // updated the path for correct output mapping

      if (
        ["json", "object"].includes(item.type?.toLowerCase()) &&
        Array.isArray(item.schema) &&
        item.schema.length > 0
        // && itemKey === "field" //TODO: uncomment this to skip the wrapper level for field and render the object type
      ) {
        // Skip this wrapper level and render its nested schema directly
        return renderSchema(item.schema, adjustedPath);
      }

      return renderInput(
        item,
        currentPath.join("."),
        currentValue,
        (newValue) => {
          handleValueChange(currentPath, newValue);
        }
      );
    });
  };

  return (
    <div className={styles.schemaInput}>
      {renderSchema(schema)}
      {/* <JsonOutput value={localValues} /> */}
    </div>
  );
};

export default SchemaInput;
