import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Wand2, RotateCcw, History, ChevronUp, Database, Table2, Sheet, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";
import FieldRenderer from "./FieldRenderer";
import PresetSelector from "./PresetSelector";
import CompactTableMode from "./CompactTableMode";
import { humanizeFieldName, generateSampleDataFromSchema } from "../sampleDataGenerator";
import { loadTestData, saveTestData, hasStoredTestData, clearTestData } from "../testDataPersistence";

const CONFIG_TYPE_ICONS = {
  connection: Database,
  table: Table2,
  sheet: Sheet,
  view: Eye,
  default: Settings,
};

const COMPACT_TABLE_THRESHOLD = 5;

const CommonTestInputV3 = ({
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
  const [values, setValues] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [infoBannerDismissed, setInfoBannerDismissed] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const fieldCount = useMemo(() => {
    return inputs?.keys?.length || 0;
  }, [inputs?.keys]);

  const resolvedInputMode = useMemo(() => {
    if (inputMode !== "auto") return inputMode;
    if (fieldCount >= COMPACT_TABLE_THRESHOLD) return "compact-table";
    if (fieldCount <= 2) return "inline";
    return "accordion";
  }, [inputMode, fieldCount]);

  const sections = useMemo(() => {
    if (!inputs?.keys || !inputs?.blocks) return [];

    const groupedBySection = {};
    
    inputs.keys.forEach((key) => {
      // Keys may be in format "nodeId_fieldPath" but blocks are keyed by nodeId only
      // Extract nodeId from key to find the correct block
      const nodeIdMatch = key.match(/^(\d+)/);
      const nodeId = nodeIdMatch ? nodeIdMatch[1] : key;
      const block = inputs.blocks[key] || inputs.blocks[nodeId] || {};
      const sectionName = block.section || block.group || "Input Fields";
      
      if (!groupedBySection[sectionName]) {
        groupedBySection[sectionName] = [];
      }
      
      // Smart key matching: find the best matching key in fieldConfig
      // Supported patterns: direct key, prefixed keys (data_, record_, field_), numeric ID extraction
      let resolvedKey = null;
      
      if (fieldConfig[key]) {
        resolvedKey = key;
      } else {
        // Try stripping common prefixes
        const keyWithoutPrefix = key.replace(/^(data_|record_|field_)/, '');
        if (fieldConfig[keyWithoutPrefix]) {
          resolvedKey = keyWithoutPrefix;
        } else {
          // Try extracting numeric ID from the key (e.g., "1769150893073_Response" -> "1769150893073")
          const numericMatch = key.match(/^(\d+)/);
          if (numericMatch && fieldConfig[numericMatch[1]]) {
            resolvedKey = numericMatch[1];
          }
        }
      }
      
      const resolvedConfig = resolvedKey ? fieldConfig[resolvedKey] : null;
      let resolvedLabel = resolvedConfig?.label;
      
      // If still no resolved label, try to extract field name from nodeName or label
      // Patterns: "{id} {name}", "{id} - {name}", or just "{name}"
      if (!resolvedLabel) {
        const textToMatch = block.nodeName || block.label || '';
        const idNameMatch = textToMatch.match(/^\d+[\s\-]+(.+)$/);
        if (idNameMatch) {
          resolvedLabel = idNameMatch[1].trim();
        }
      }
      
      groupedBySection[sectionName].push({
        key,
        ...block,
        label: resolvedLabel || block.label || block.nodeName || humanizeFieldName(key),
        type: resolvedConfig?.type || block.type || "text",
        placeholder: resolvedConfig?.placeholder || block.placeholder,
        required: block.required || false,
      });
    });

    return Object.entries(groupedBySection).map(([name, fields]) => ({
      name,
      fields,
      fieldCount: fields.length,
    }));
  }, [inputs, fieldConfig]);

  useEffect(() => {
    if (persistTestData && nodeKey && !hasRestoredData) {
      const stored = loadTestData(nodeKey);
      if (stored) {
        setValues(stored);
        setHasRestoredData(true);
        // Defer parent update to next tick to avoid setState during render
        setTimeout(() => {
          onValuesChange?.(stored);
        }, 0);
      }
    }
  }, [persistTestData, nodeKey, hasRestoredData, onValuesChange]);

  useEffect(() => {
    if (sections.length > 0 && Object.keys(expandedSections).length === 0) {
      if (sections.length === 1) {
        setExpandedSections({ [sections[0].name]: true });
      } else {
        const initial = {};
        sections.forEach((section, index) => {
          initial[section.name] = index === 0;
        });
        setExpandedSections(initial);
      }
    }
  }, [sections, expandedSections]);

  const handleValueChange = useCallback((key, value) => {
    setValues((prev) => {
      const updated = { ...prev, [key]: value };
      onValuesChange?.(updated);
      
      if (persistTestData && nodeKey) {
        saveTestData(nodeKey, updated);
      }
      
      return updated;
    });

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [onValuesChange, persistTestData, nodeKey, validationErrors]);

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
      allExpanded[section.name] = true;
    });
    setExpandedSections(allExpanded);
  }, [sections]);

  const handleCollapseAll = useCallback(() => {
    const allCollapsed = {};
    sections.forEach((section) => {
      allCollapsed[section.name] = false;
    });
    setExpandedSections(allCollapsed);
  }, [sections]);

  const handleGenerateSampleData = useCallback(() => {
    const sampleData = generateSampleDataFromSchema(inputs, fieldConfig);
    setValues(sampleData);
    onValuesChange?.(sampleData);
    
    if (persistTestData && nodeKey) {
      saveTestData(nodeKey, sampleData);
    }
  }, [inputs, fieldConfig, onValuesChange, persistTestData, nodeKey]);

  const handleApplyPreset = useCallback((preset) => {
    if (preset?.values) {
      setValues(preset.values);
      onValuesChange?.(preset.values);
      
      if (persistTestData && nodeKey) {
        saveTestData(nodeKey, preset.values);
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
    return sections.every((s) => expandedSections[s.name]);
  }, [sections, expandedSections]);

  const accentColor = theme.accentColor || "#3b82f6";

  if (!inputs?.keys?.length) {
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

        {sections.length > 1 && resolvedInputMode === "accordion" && (
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

      {resolvedInputMode === "compact-table" ? (
        <CompactTableMode
          sections={sections}
          values={values}
          onValueChange={handleValueChange}
          fieldConfig={fieldConfig}
          inputRenderer={inputRenderer}
          validationErrors={validationErrors}
          theme={theme}
        />
      ) : resolvedInputMode === "inline" ? (
        <div className={styles.inlineContainer}>
          {sections.map((section) =>
            section.fields.map((field) => (
              <div key={field.key} className={styles.inlineField}>
                <FieldRenderer
                  field={field}
                  value={values[field.key]}
                  onChange={(value) => handleValueChange(field.key, value)}
                  customRenderer={inputRenderer}
                  error={validationErrors[field.key]}
                  theme={theme}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.accordionContainer}>
          {sections.map((section) => (
            <div
              key={section.name}
              className={cn(
                styles.section,
                expandedSections[section.name] && styles.sectionExpanded
              )}
            >
              <button
                className={styles.sectionHeader}
                onClick={() => handleSectionToggle(section.name)}
                style={{
                  "--accent-color": accentColor,
                }}
              >
                <div className={styles.sectionHeaderLeft}>
                  {expandedSections[section.name] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className={styles.sectionTitle}>{section.name}</span>
                  <span className={styles.sectionCount}>
                    {section.fieldCount} {section.fieldCount === 1 ? "field" : "fields"}
                  </span>
                </div>
              </button>

              {expandedSections[section.name] && (
                <div className={styles.sectionContent}>
                  {section.fields.map((field) => (
                    <div key={field.key} className={styles.fieldWrapper}>
                      <FieldRenderer
                        field={field}
                        value={values[field.key]}
                        onChange={(value) => handleValueChange(field.key, value)}
                        customRenderer={inputRenderer}
                        error={validationErrors[field.key]}
                        theme={theme}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommonTestInputV3;
