import React, { useCallback, useState } from "react";
// import { ODSTextField as TextField } from "@src/module/ods";
// import Typography from "oute-ds-label";
// import Accordion from "oute-ds-accordion";
import { ODSTextField as TextField, ODSLabel as Typography, ODSAccordion as Accordion } from "@src/module/ods";
import styles from "./CommonTestInput.module.css";
const CommonTestInput = ({
  inputs,
  expanded,
  onChange,
  onModifyInputs,
  readOnly = true,
}) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(0);

  // CHANGED: Added isObject parameter to handle JSON validation
  const validateInput = useCallback((value, type, isObject) => {
    // Don't validate empty values for objects - allow user to clear the field
    if (isObject && value.trim() === "") {
      return "";
    }

    if (type === "number") {
      if (value.trim() === "") {
        return "";
      }
      if (isNaN(Number(value))) {
        return "Value must be a number";
      }
    }

    if (isObject && value.trim() !== "") {
      try {
        JSON.parse(value);
      } catch {
        return "Invalid JSON format. Please check your input.";
      }
    }
    return "";
  }, []);

  const parseJsonToObjects = useCallback(
    (data) => {
      const { blocks, keys } = data;
      const result = [];

      const traverseSchema = (schema, keysArr) => {
        const currentKey = keysArr[0].replace(/[[\]]/g, "");

        for (let i = 0; i < schema.length; i++) {
          const node = schema[i];

          if (node.key === currentKey) {
            if (keysArr.length === 1) {
              return node;
            }

            if (node.schema && node.schema.length > 0) {
              return traverseSchema(node.schema, keysArr.slice(1));
            }
          }

          if (node.schema && node.schema.length > 0) {
            const found = traverseSchema(node.schema, keysArr);
            if (found) return found;
          }
        }
        return null;
      };

      keys.forEach((fullKey) => {
        const underscoreIndex = fullKey.indexOf("_");
        const blockKey = fullKey.substring(0, underscoreIndex);
        const keyPath = fullKey.substring(underscoreIndex + 1);

        const block = blocks[blockKey];
        if (block) {
          const nestedKeys = keyPath.replace(/{|}/g, "").split(".");
          block.schema.forEach((node) => {
            const matchedObject = traverseSchema([node], nestedKeys);
            if (matchedObject) {
              const label = matchedObject.key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
                .replace(/-/g, " ");
              const isObject =
                matchedObject.type === "object" ||
                matchedObject.type === "array";
              const defaultValue = matchedObject?.value
                ? matchedObject.value
                : isObject
                  ? JSON.stringify(
                      matchedObject.default ||
                        (matchedObject.type === "array" ? [] : {}),
                      null,
                      2
                    )
                  : matchedObject.default?.toString() || "";
              matchedObject.isValueMode = true;
              matchedObject.mode = "raw";
              result.push({
                component: (
                  <TextField
                    key={fullKey}
                    label={label}
                    name={fullKey}
                    className={"black"}
                    // Use nullish coalescing to allow empty strings
                    value={
                      readOnly && isObject
                        ? JSON.stringify(
                            values[fullKey]?.value ?? defaultValue,
                            null,
                            2
                          )
                        : (values[fullKey]?.value ?? defaultValue)
                    }
                    error={!!errors[fullKey]}
                    helperText={errors[fullKey]}
                    InputProps={{
                      readOnly,
                    }}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const error = validateInput(
                        newValue,
                        matchedObject.type,
                        isObject
                      );

                      setErrors((prev) => ({ ...prev, [fullKey]: error }));

                      setValues((prev) => ({
                        ...prev,
                        [fullKey]: {
                          value: newValue,
                        },
                      }));

                      // Create a deep copy of the data to avoid mutating props
                      const updatedData = JSON.parse(JSON.stringify(data));
                      const updatedBlock = updatedData.blocks[blockKey];
                      const updatedObject = traverseSchema(
                        updatedBlock.schema,
                        nestedKeys
                      );

                      if (updatedObject) {
                        updatedObject.isValueMode = true;
                        updatedObject.mode = "raw";
                        if (isObject) {
                          if (newValue.trim() === "") {
                            // Handle empty state for objects/arrays
                            updatedObject.value =
                              matchedObject.type === "array" ? [] : {};
                            updatedObject.schema = [];
                            onModifyInputs(updatedData);
                          } else if (!error) {
                            try {
                              updatedObject.value = JSON.parse(newValue);
                              updatedObject.schema = [];
                              onModifyInputs(updatedData);
                            } catch {
                              // JSON parse error is already handled by validateInput
                              return;
                            }
                          }
                        } else {
                          // For non-object types, always update with the new value
                          updatedObject.value = newValue;
                          onModifyInputs(updatedData);
                        }
                      }
                    }}
                    type={matchedObject.type === "number" ? "number" : "text"}
                    multiline={isObject}
                    maxRows={10}
                    fullWidth
                  />
                ),
                blockName: block.nodeName,
              });
            }
          });
        }
      });

      return result;
    },
    [errors, onModifyInputs, readOnly, validateInput, values]
  );

  const inputElements = parseJsonToObjects(inputs);

  const groupedInputs = inputElements.reduce((acc, input) => {
    const group = input.blockName || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(input.component);
    return acc;
  }, {});

  return (
    <Accordion
      expanded={expanded === "inputs"}
      onChange={onChange}
      
      summaryProps={{
        sx: {
          background: "#ECEFF1",
          height: "2.75rem !important",
          border: "none",
          padding: "0.5rem 1.5rem !important",
        },
      }}
      title={
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="capital">Input(s)</Typography>
        </div>
      }
      content={
        <div className={styles.container}>
          {!readOnly && (
            <Typography
              variant="body1"
              fontWeight={500}
              style={{
                padding: "1rem",
                border: " 0.75px solid var(--blue, #2196F3)",
                background: "var(--blue-lighten-5, #E3F2FD)",
                borderRadius: "0.375rem",
              }}
            >
              Hey looks like you have some inputs. Please fill them in and run
              the test
            </Typography>
          )}
          {Object.entries(groupedInputs).map(
            ([groupName, components], index) => (
              <Accordion
                key={groupName}
                expanded={expandedGroupIndex === index}
                className={styles.muiAccordion}
                title={
                  <Typography variant="capital" fontWeight="medium">
                    {groupName}
                  </Typography>
                }
                content={
                  <div className={styles.accordionContent}>{components}</div>
                }
                summaryProps={{
                  className: styles.muiAccordionSummary,
                  sx: {
                    ".MuiAccordionSummary-expandIconWrapper": {
                      transform: "rotate(-90deg)",
                      "&.Mui-expanded": {
                        transform: "rotate(0deg)",
                      },
                    },
                  },
                }}
                detailsProps={{ className: styles.muiAccordionDetails }}
                onChange={() => setExpandedGroupIndex(index)}
              />
            )
          )}
        </div>
      }
    />
  );
};

export default CommonTestInput;
