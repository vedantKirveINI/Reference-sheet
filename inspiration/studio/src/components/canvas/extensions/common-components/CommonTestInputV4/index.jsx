import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown, ChevronRight, Wand2, RotateCcw, History, ChevronUp, Database, Table2, Sheet, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";
import PresetSelector from "./PresetSelector";
import SchemaInputV2 from "../schema-input-v2/SchemaInputV2";
import { generateSampleValue } from "../sampleDataGenerator";
import { loadTestData, saveTestData, hasStoredTestData, clearTestData } from "../testDataPersistence";

const CONFIG_TYPE_ICONS = {
  connection: Database,
  table: Table2,
  sheet: Sheet,
  view: Eye,
  default: Settings,
};

// Helper to set nested value (only used for transforming flat presets/persistence to nested)
const setNestedValue = (values, nodeId, path, value) => {
  const updated = { ...values };
  if (!updated[nodeId]) updated[nodeId] = {};
  let current = updated[nodeId];
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) current[path[i]] = {};
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return updated;
};

const CommonTestInputV4 = ({
  inputs,
  onValuesChange,
  inputMode = "auto",
  fieldConfig = {},
  testPresets = [],
  persistTestData = true,
  nodeKey = null,
  theme = {},
  inputRenderer = null,
  onValidate = null,
  isRerun = false,
  configurationData = null,
}) => {
  const [values, setValues] = useState({}); // Nested: {nodeId: {field: value}}
  const [expandedSections, setExpandedSections] = useState({});
  const [infoBannerDismissed, setInfoBannerDismissed] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const allInputRefs = useRef({});
  const prevExpandedSections = useRef(expandedSections);

  // Sections from blocks (simple, no field extraction)
  const sections = useMemo(() => {
    if (!inputs?.blocks) return [];
    
    return Object.entries(inputs.blocks).map(([nodeId, block]) => ({
      nodeId,
      name: block.nodeName || block.label || `Input ${nodeId}`,
      block,
    }));
  }, [inputs?.blocks]);

  // Initialize expanded sections
  useEffect(() => {
    if (sections.length > 0 && Object.keys(expandedSections).length === 0) {
      const firstKey = sections[0]?.nodeId;
      if (firstKey) {
        setExpandedSections({ [firstKey]: true });
      }
    }
  }, [sections, expandedSections]);

  // Load persisted data
  useEffect(() => {
    if (persistTestData && nodeKey && !hasRestoredData) {
      const stored = loadTestData(nodeKey);
      if (stored) {
        // Ensure stored data is in nested format
        let nestedStored = stored;
        // Check if stored data is flat and needs transformation
        const hasFlatKeys = Object.keys(stored).some(key => /^\d+_/.test(key));
        if (hasFlatKeys) {
          nestedStored = {};
          Object.entries(stored).forEach(([key, value]) => {
            const match = key.match(/^(\d+)_(.+)$/);
            if (match) {
              const [, nodeId, fieldPath] = match;
              const pathParts = fieldPath.split('.');
              nestedStored = setNestedValue(nestedStored, nodeId, pathParts, value);
            }
          });
        }
        
        setValues(nestedStored);
        setHasRestoredData(true);
        setTimeout(() => {
          onValuesChange?.(nestedStored);
        }, 0);
      }
    }
  }, [persistTestData, nodeKey, hasRestoredData, onValuesChange]);

  // Notify parent of value changes and persist
  useEffect(() => {
    if (Object.keys(values).length > 0 || hasRestoredData) {
      onValuesChange?.(values);
      
      // Persist values when they change (moved from handleSchemaChange)
      if (persistTestData && nodeKey) {
        saveTestData(nodeKey, values);
      }
    }
  }, [values, onValuesChange, hasRestoredData, persistTestData, nodeKey]);

  // Clear refs when section is collapsed and focus first input when expanded
  useEffect(() => {
    Object.keys(inputs?.blocks || {}).forEach((nodeId) => {
      if (!expandedSections[nodeId]) {
        allInputRefs.current[nodeId] = [];
      } else {
        // Section is expanded - check if it was just expanded
        const wasExpanded = prevExpandedSections.current[nodeId];
        const isNewlyExpanded = !wasExpanded && expandedSections[nodeId];

        if (isNewlyExpanded) {
          // Focus first input in this newly expanded section using refs
          // Use requestAnimationFrame and setTimeout to ensure DOM is ready
          requestAnimationFrame(() => {
            setTimeout(() => {
              const sectionRefs = allInputRefs.current[nodeId] || [];
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

  // Handle schema change for SchemaInputV2
  const handleSchemaChange = useCallback((nodeId, nestedValues) => {
    setValues((prev) => ({
      ...prev,
      [nodeId]: nestedValues,
    }));
  }, []);

  const handleSectionToggle = useCallback((sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
    
    if (!infoBannerDismissed) {
      setInfoBannerDismissed(true);
    }
  }, [infoBannerDismissed]);

  const handleExpandAll = useCallback(() => {
    const allExpanded = {};
    sections.forEach((section) => {
      const key = section.nodeId || section.name;
      allExpanded[key] = true;
    });
    setExpandedSections(allExpanded);
  }, [sections]);

  const handleCollapseAll = useCallback(() => {
    const allCollapsed = {};
    sections.forEach((section) => {
      const key = section.nodeId || section.name;
      allCollapsed[key] = false;
    });
    setExpandedSections(allCollapsed);
  }, [sections]);

  const handleGenerateSampleData = useCallback(() => {
    const sampleData = {};
    
    // Generate nested data for each block
    Object.entries(inputs.blocks || {}).forEach(([nodeId, block]) => {
      const generateFromSchema = (schema) => {
        if (!Array.isArray(schema)) return {};
        
        return schema.reduce((acc, item) => {
          const itemKey = item.key || item.label || "field";
          if (item.schema && Array.isArray(item.schema)) {
            acc[itemKey] = generateFromSchema(item.schema);
          } else {
            acc[itemKey] = item.default ?? generateSampleValue(itemKey, item);
          }
          return acc;
        }, {});
      };
      
      sampleData[nodeId] = generateFromSchema(block.schema || []);
    });
    
    setValues(sampleData);
    onValuesChange?.(sampleData);
    
    if (persistTestData && nodeKey) {
      saveTestData(nodeKey, sampleData);
    }
  }, [inputs, onValuesChange, persistTestData, nodeKey]);

  const handleApplyPreset = useCallback((preset) => {
    if (preset?.values) {
      // If preset values are flat, transform to nested
      let nestedValues = preset.values;
      
      // Check if values are flat (has keys like "nodeId_field")
      const hasFlatKeys = Object.keys(preset.values).some(key => /^\d+_/.test(key));
      if (hasFlatKeys) {
        nestedValues = {};
        Object.entries(preset.values).forEach(([key, value]) => {
          const match = key.match(/^(\d+)_(.+)$/);
          if (match) {
            const [, nodeId, fieldPath] = match;
            const pathParts = fieldPath.split('.');
            nestedValues = setNestedValue(nestedValues, nodeId, pathParts, value);
          }
        });
      }
      
      setValues(nestedValues);
      onValuesChange?.(nestedValues);
      
      if (persistTestData && nodeKey) {
        saveTestData(nodeKey, nestedValues);
      }
    }
  }, [onValuesChange, persistTestData, nodeKey]);

  const handleClearValues = useCallback(() => {
    setValues({});
    onValuesChange?.({});
    if (persistTestData && nodeKey) {
      clearTestData(nodeKey);
    }
    setHasRestoredData(false);
  }, [onValuesChange, persistTestData, nodeKey]);

  const validate = useCallback(() => {
    if (!onValidate) return { valid: true };
    
    const result = onValidate(values);
    if (!result.valid && result.fieldErrors) {
      setValidationErrors(result.fieldErrors);
    }
    return result;
  }, [onValidate, values]);

  const allExpanded = useMemo(() => {
    return sections.every((s) => {
      return expandedSections[s.nodeId];
    });
  }, [sections, expandedSections]);

  const accentColor = theme.accentColor || "#3b82f6";

  if (!inputs?.blocks || Object.keys(inputs.blocks).length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>No input fields required for this test.</p>
      </div>
    );
  }


  return (
    <div className={styles.container}>
      {configurationData && configurationData.length > 0 && (
        <div className={styles.configurationSection}>
          <div className={styles.configurationHeader}>
            <Settings className="w-4 h-4" style={{ color: accentColor }} />
            <span className={styles.configurationTitle}>Configuration</span>
          </div>
          <div className={styles.configurationGrid}>
            {configurationData.map((config, index) => {
              const IconComponent = CONFIG_TYPE_ICONS[config.type] || CONFIG_TYPE_ICONS.default;
              return (
                <div key={index} className={styles.configurationItem}>
                  <div className={styles.configurationItemIcon}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className={styles.configurationItemContent}>
                    <span className={styles.configurationItemLabel}>{config.label}</span>
                    <span className={styles.configurationItemValue}>{config.value || "Not set"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!infoBannerDismissed && (
        <div className={styles.infoBanner}>
          <div className={styles.infoContent}>
            <p className={styles.infoTitle}>
              {isRerun ? "Update Test Values" : "Provide Test Values"}
            </p>
            <p className={styles.infoDescription}>
              {isRerun 
                ? "Modify values below to test with different inputs."
                : "Enter values for each field below. These will be used as inputs when running the test."
              }
            </p>
          </div>
          <button
            className={styles.infoDismiss}
            onClick={() => setInfoBannerDismissed(true)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {hasRestoredData && (
        <div className={styles.restoredBanner}>
          <History className="w-4 h-4" />
          <span>Restored from last test</span>
          <button
            className={styles.clearButton}
            onClick={handleClearValues}
          >
            Clear
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Quick Fill and Generate Sample commented out for next video
          {testPresets.length > 0 && (
            <PresetSelector
              presets={testPresets}
              onSelectPreset={handleApplyPreset}
              theme={theme}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSampleData}
            className={styles.toolbarButton}
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            Generate Sample
          </Button>
          */}
        </div>

        {sections.length > 1 && (
          <div className={styles.toolbarRight}>
            <Button
              variant="ghost"
              size="sm"
              onClick={allExpanded ? handleCollapseAll : handleExpandAll}
              className={styles.expandButton}
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className={styles.accordionContainer}>
          {sections.map((section) => {
            const isExpanded = expandedSections[section.nodeId] ?? false;
            
            return (
              <div
                key={section.nodeId}
                className={cn(
                  styles.section,
                  isExpanded && styles.sectionExpanded
                )}
              >
                <button
                  className={styles.sectionHeader}
                  onClick={() => handleSectionToggle(section.nodeId)}
                  style={{
                    "--accent-color": accentColor,
                  }}
                >
                  <div className={styles.sectionHeaderLeft}>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className={styles.sectionTitle}>{section.name}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <SchemaInputV2
                      schema={section.block.schema}
                      value={values[section.nodeId] || {}}
                      onValuesChange={(nestedValues) =>
                        handleSchemaChange(section.nodeId, nestedValues)
                      }
                      ref={(r) => {
                        allInputRefs.current[section.nodeId] = r || [];
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommonTestInputV4;

