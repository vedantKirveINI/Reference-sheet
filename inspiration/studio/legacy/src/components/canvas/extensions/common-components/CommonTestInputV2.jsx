import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "./CommonTestInputV2.module.css";
import SchemaInputV2 from "./schema-input-v2/SchemaInputV2";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import startCase from "lodash/startCase";

import { QUESTIONS_NODES } from "../question-setup/constants/questionNodes";

const focusableTypes = ["string", "number", "date", "any"];

const getDataTypeFromSchema = ({ schema }) => {
  if (!schema || !Array.isArray(schema) || schema.length === 0) {
    return null;
  }

  // Get the first schema item
  const firstItem = schema[0];

  // Check if it's a nested schema (array or object)
  if (
    firstItem?.schema &&
    Array.isArray(firstItem.schema) &&
    firstItem.schema?.length > 0
  ) {
    const nestedItem = firstItem.schema[0];
    const nestedType = nestedItem?.type || nestedItem?.Type;

    if (nestedType) {
      return startCase(nestedType);
    }
  }

  // Get type from first item
  const type = firstItem?.type || firstItem?.Type;
  if (type) {
    return startCase(type);
  }

  return null;
};

const InputSectionHeader = ({ inputData, inputKey }) => {
  const questionType = inputData?.schema?.[0]?.schema?.[0]?.nodeType;
  const nodeIcon = QUESTIONS_NODES?.[questionType]?._src;
  const dataType = getDataTypeFromSchema({ schema: inputData?.schema });

  return (
    <div className={styles.sectionHeader}>
      {nodeIcon && (
        <div className={styles.iconWrapper}>
          <img src={nodeIcon} alt={questionType} className={styles.nodeIcon} />
        </div>
      )}
      <div className={styles.sectionHeaderContent}>
        <div className={styles.titleRow}>
          <h3 className={styles.sectionTitle}>
            {inputData?.nodeName || `Input ${inputKey}`}
          </h3>
          {dataType && <span className={styles.dataTypeBadge}>{dataType}</span>}
        </div>
        <p className={styles.sectionDescription}>
          Enter test values to simulate data from previous steps
        </p>
      </div>
    </div>
  );
};

const CommonTestInputV2 = ({ inputs = {}, onValuesChange }) => {
  const [allValues, setAllValues] = useState({});

  const allInputRefs = useRef({});

  const [expandedSections, setExpandedSections] = useState(() => {
    const firstKey = Object.keys(inputs?.blocks || {})[0];

    return firstKey ? { [firstKey]: true } : {};
  });

  const prevExpandedSections = useRef(expandedSections);

  const inputBlocks = useMemo(() => {
    return Object.entries(inputs?.blocks || {});
  }, [inputs?.blocks]);

  const handleSchemaChange = (inputKey, values) => {
    setAllValues((prev) => ({
      ...prev,
      [inputKey]: values,
    }));
  };

  const toggleSection = useCallback((inputKey, value) => {
    setExpandedSections((prev) => ({
      ...prev,
      [inputKey]: value ?? !prev[inputKey],
    }));
  }, []);

  // Helper function to check if an accordion has focusable input fields
  const hasFocusableInputs = useCallback(
    (inputKey) => {
      const inputData = inputs?.blocks?.[inputKey];
      if (!inputData || !inputData.schema) {
        return false;
      }

      // Recursively check schema for focusable input types
      const checkSchema = (schemaItems) => {
        if (!Array.isArray(schemaItems)) {
          return false;
        }

        for (const item of schemaItems) {
          const itemType = item.type?.toLowerCase() || item.Type?.toLowerCase();

          if (focusableTypes.includes(itemType)) {
            return true;
          }

          // Check nested schemas (for objects and arrays)
          if (item.schema && Array.isArray(item.schema)) {
            if (checkSchema(item.schema)) {
              return true;
            }
          }
        }

        return false;
      };

      return checkSchema(inputData.schema);
    },
    [inputs?.blocks]
  );

  // Helper function to find the next accordion section after the current one
  const findNextAccordion = useCallback(
    (currentInputKey) => {
      const allKeys = Object.keys(inputs?.blocks || {});
      const currentIndex = allKeys.indexOf(currentInputKey);

      if (currentIndex === -1 || currentIndex === allKeys.length - 1) {
        return null;
      }

      // Find the next accordion with focusable inputs
      for (let i = currentIndex + 1; i < allKeys.length; i++) {
        const nextKey = allKeys[i];
        if (hasFocusableInputs(nextKey)) {
          return nextKey;
        }
      }

      return null;
    },
    [inputs?.blocks, hasFocusableInputs]
  );

  // Helper function to get all focusable inputs in order from expanded sections
  const getAllFocusableInputs = useCallback(() => {
    const allInputs = [];
    const allKeys = Object.keys(inputs?.blocks || {});

    // Iterate through sections in order
    for (const inputKey of allKeys) {
      // Only include inputs from expanded sections
      if (expandedSections[inputKey]) {
        const sectionRefs = allInputRefs.current[inputKey] || [];
        // Add refs with their section key for reference
        sectionRefs.forEach((ref) => {
          if (ref && typeof ref.focus === "function") {
            allInputs.push({ ref, sectionKey: inputKey });
          }
        });
      }
    }

    return allInputs;
  }, [expandedSections, inputs?.blocks]);

  // Helper function to focus TEST button
  const focusTestButton = useCallback(() => {
    setTimeout(() => {
      const testButton = document.querySelector(
        '[data-testid="node-tab-test-button"]'
      );
      if (testButton) {
        testButton.focus();
      }
    }, 0);
  }, []);

  // Focus next input across all sections
  const focusNextInput = useCallback(() => {
    // Find current active element
    const activeElement = document.activeElement;

    // First, find which section the current input belongs to
    const allInputs = getAllFocusableInputs();
    const currentInput = allInputs.find((input) => input.ref === activeElement);

    if (!currentInput) {
      // Couldn't find current input (focus might be elsewhere)
      // Try to focus first input if available
      if (allInputs.length > 0 && allInputs[0]?.ref) {
        setTimeout(() => {
          allInputs[0].ref.focus();
        }, 0);
      } else {
        focusTestButton();
      }
      return;
    }

    const currentSectionKey = currentInput.sectionKey;

    // Get all inputs from the current section only
    const currentSectionInputs = allInputs.filter(
      (input) => input.sectionKey === currentSectionKey
    );

    // Find the index of current input within its section
    const currentIndexInSection = currentSectionInputs.findIndex(
      (input) => input.ref === activeElement
    );

    // Check if there's a next input in the current accordion
    if (
      currentIndexInSection >= 0 &&
      currentIndexInSection < currentSectionInputs.length - 1
    ) {
      // There's a next input in the current accordion - focus it
      const nextInput = currentSectionInputs[currentIndexInSection + 1];
      if (nextInput?.ref && typeof nextInput.ref.focus === "function") {
        setTimeout(() => {
          nextInput.ref.focus();
        }, 0);
      }
    } else {
      // We're at the last input of the current accordion
      // Check for accordions after the current one
      const nextAccordionKey = findNextAccordion(currentSectionKey);

      if (nextAccordionKey) {
        // Found next accordion with inputs
        const isNextAccordionExpanded = expandedSections[nextAccordionKey];

        if (!isNextAccordionExpanded) {
          // Accordion is collapsed - expand it (auto-focus will handle focusing)
          toggleSection(nextAccordionKey, true);
        } else {
          // Accordion is already expanded - focus its first input using refs
          requestAnimationFrame(() => {
            setTimeout(() => {
              const nextSectionRefs =
                allInputRefs.current[nextAccordionKey] || [];
              const firstInput = nextSectionRefs.find(
                (ref) => ref && typeof ref.focus === "function"
              );
              if (firstInput) {
                firstInput.focus();
              }
            }, 50);
          });
        }
      } else {
        // No more accordions with inputs after the current one - focus TEST button
        focusTestButton();
      }
    }
  }, [
    expandedSections,
    findNextAccordion,
    toggleSection,
    getAllFocusableInputs,
    focusTestButton,
  ]);

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(allValues);
    }
  }, [allValues, onValuesChange]);

  // Clear refs when section is collapsed and focus first input when expanded
  useEffect(() => {
    Object.keys(inputs?.blocks || {}).forEach((inputKey) => {
      if (!expandedSections[inputKey]) {
        allInputRefs.current[inputKey] = [];
      } else {
        // Section is expanded - check if it was just expanded
        const wasExpanded = prevExpandedSections.current[inputKey];
        const isNewlyExpanded = !wasExpanded && expandedSections[inputKey];

        if (isNewlyExpanded) {
          // Focus first input in this newly expanded section using refs
          // Use requestAnimationFrame and setTimeout to ensure DOM is ready
          requestAnimationFrame(() => {
            setTimeout(() => {
              const sectionRefs = allInputRefs.current[inputKey] || [];
              const firstInput = sectionRefs.find(
                (ref) => ref && typeof ref.focus === "function"
              );
              if (firstInput) {
                firstInput.focus();
              }
            }, 50);
          });
        }
      }
    });

    // Update previous state
    prevExpandedSections.current = expandedSections;
  }, [expandedSections, inputs?.blocks]);

  return (
    <div className={styles.container}>
      {/* Modern Info Banner */}
      <div className={styles.infoBanner}>
        <div className={styles.infoIcon}>
          <Icon
            outeIconName="OUTEInfoIcon"
            outeIconProps={{
              sx: { color: "#3b82f6", width: "1.5rem", height: "1.5rem" },
            }}
          />
        </div>
        <div className={styles.infoContent}>
          <h4 className={styles.infoTitle}>Provide Test Data</h4>
          <p className={styles.infoDescription}>
            This node needs sample data to run. Enter test values in the fields
            below, then click <strong>TEST</strong> to see how your node
            processes the information.
          </p>
        </div>
      </div>

      {/* Input Sections */}
      {inputBlocks.length > 0 ? (
        <div className={styles.inputSections}>
          {inputBlocks.map(([inputKey, inputData], index) => {
            const isExpanded = expandedSections[inputKey] ?? false;
            const isLast = index === inputBlocks.length - 1;

            return (
              <div
                key={inputKey}
                data-section-key={inputKey}
                className={`${styles.inputSection} ${
                  isLast ? styles.lastSection : ""
                }`}
              >
                <div
                  className={styles.sectionToggle}
                  onClick={() => toggleSection(inputKey)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSection(inputKey);
                    }
                  }}
                >
                  <InputSectionHeader
                    inputData={inputData}
                    inputKey={inputKey}
                  />
                  <div className={styles.toggleIndicator}>
                    <Icon
                      outeIconName="OUTEChevronRightIcon"
                      outeIconProps={{
                        sx: {
                          color: "#6b7280",
                          width: "1.25rem",
                          height: "1.25rem",
                          transform: isExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        },
                      }}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <SchemaInputV2
                      schema={inputData.schema}
                      onValuesChange={(values) =>
                        handleSchemaChange(inputKey, values)
                      }
                      onEnterKey={focusNextInput}
                      ref={(r) => {
                        allInputRefs.current[inputKey] = r || [];
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Icon
            outeIconName="OUTEInfoIcon"
            outeIconProps={{
              sx: { color: "#9ca3af", width: "3rem", height: "3rem" },
            }}
          />
          <h3 className={styles.emptyStateTitle}>No Inputs Required</h3>
          <p className={styles.emptyStateDescription}>
            This node doesn`&apos;t need any test data. Click{" "}
            <strong>TEST</strong> to run it and see the results.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommonTestInputV2;
