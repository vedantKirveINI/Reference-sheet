import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PrimitiveInputV2 from "./PrimitiveInputV2";
import ArrayInputV2 from "./ArrayInputV2";
import ObjectInputV2 from "./ObjectInputV2";
import AnyInputV2 from "./AnyInputV2";
import DirectJsonInputV2 from "./DirectJsonInputV2";
import DateInputV2 from "./DateInputV2";
import styles from "./SchemaInputV2.module.css";

function SchemaInputV2(
  { schema, onValuesChange, value = {}, onEnterKey },
  ref
) {
  const [localValues, setLocalValues] = useState(value);
  const inputRefs = useRef([]);

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

  // Register this component's inputs with parent
  // useEffect(() => {
  //   inputRefs.current = [];
  // }, [schema]);

  useImperativeHandle(ref, () => {
    return inputRefs.current.filter(
      (ref) => ref && typeof ref.focus === "function"
    );
  }, []);

  const renderInput = useCallback(
    (item, key, currentValue, onChange, index) => {
      const itemType = item.type?.toLowerCase() || item.Type?.toLowerCase();
      const itemKey = getDisplayName(item);
      const inputRef = (el) => {
        if (el && index >= 0) {
          // Only store refs for focusable inputs (index >= 0)
          // Store in a sparse array, but we'll filter out undefined later
          inputRefs.current[index] = el;
        }
      };

      switch (itemType) {
        case "string":
        case "number":
        case "boolean":
          return (
            <PrimitiveInputV2
              key={item.id || key}
              ref={inputRef}
              type={itemType}
              label={itemKey}
              value={currentValue}
              onChange={onChange}
              onEnterKey={onEnterKey}
            />
          );
        case "date":
          return (
            <DateInputV2
              key={item.id || key}
              ref={inputRef}
              label={itemKey}
              value={currentValue}
              onChange={onChange}
              onEnterKey={onEnterKey}
            />
          );
        case "any":
          return (
            <AnyInputV2
              key={item.id || key}
              ref={inputRef}
              label={itemKey}
              value={currentValue}
              onChange={onChange}
              onEnterKey={onEnterKey}
            />
          );
        case "array": {
          const arraySchema = item.schema?.[0];
          const hasValidArraySchema =
            arraySchema && (arraySchema.type || arraySchema.Type);

          if (!hasValidArraySchema) {
            return (
              <DirectJsonInputV2
                key={item.id || key}
                label={itemKey}
                value={currentValue}
                onValueChange={onChange}
                type="array"
              />
            );
          }

          return (
            <ArrayInputV2
              key={item.id || key}
              label={itemKey}
              value={currentValue}
              arraySchema={arraySchema}
              onValueChange={onChange}
              renderInput={renderInput}
              getActualKey={getActualKey}
              getDisplayName={getDisplayName}
            />
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
              <DirectJsonInputV2
                key={item.id || key}
                label={itemKey}
                value={currentValue}
                onValueChange={onChange}
                type="object"
              />
            );
          }

          return (
            <ObjectInputV2
              key={item.id || key}
              label={itemKey}
              value={currentValue}
              schema={objectSchema}
              onValueChange={onChange}
              renderInput={renderInput}
              getActualKey={getActualKey}
            />
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
      ) {
        return renderSchema(item.schema, adjustedPath);
      }

      return renderInput(
        item,
        currentPath.join("."),
        currentValue,
        (newValue) => {
          handleValueChange(currentPath, newValue);
        },
        index
      );
    });
  };

  return <div className={styles.schemaInput}>{renderSchema(schema)}</div>;
}

export default forwardRef(SchemaInputV2);
