import { useState, useCallback, useMemo, useRef } from "react";
import { CREATE_TEMPLATES } from "../constants";
import questionDataTypeMapping from "@src/module/input-grid-v2/constant/questionDataTypeMapping";
import {
  convertApplicationTypeToSDKType,
  getSheetTypeDisplayName,
} from "../../common-components/sheetTypeMapping";
import {
  getComplexTypeSchema,
  createComplexValueFromSubFields,
} from "../../common-components/sheetRecordUtils";

// Initialize records from fields with empty values, optionally merging with existing records
export function initializeRecordsFromFields(fields = [], existingRecords = []) {
  if (!fields || fields.length === 0) return [];

  const records = [];

  fields.forEach((field) => {
    // Find matching existing record by fieldId
    const existingRecord = existingRecords.find((r) => r.fieldId === field.id);
    const complexSchema = getComplexTypeSchema(field.type);

    // Get metadata from current field definition
    const sdkType = convertApplicationTypeToSDKType(field.type);
    const fieldTypeUpper = String(field.type || "").toUpperCase();
    const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
    const displayName = typeMapping.alias || getSheetTypeDisplayName(field.type);
    const iconUrl = field.icon || typeMapping.icon || "";

    if (complexSchema) {
      // Complex field - merge subFields if existing record found
      let subFields = {};
      let value;

      if (existingRecord && existingRecord.subFields) {
        // Preserve existing subFields
        subFields = existingRecord.subFields;
        // Re-serialize value from subFields to ensure it matches current schema
        value = createComplexValueFromSubFields(subFields, complexSchema);
      } else {
        // Create empty subFields
        subFields = {};
        value = createComplexValueFromSubFields(subFields, complexSchema);
      }

      records.push({
        isChecked: existingRecord?.isChecked !== undefined ? existingRecord.isChecked : false,
        id: field.id,
        key: field.name,
        fieldId: field.id,
        fieldFormat: field.fieldFormat || existingRecord?.fieldFormat || "",
        type: sdkType,
        dbFieldType: field.dbFieldType,
        dbFieldName: field.dbFieldName,
        field: field.id || field.dbFieldName,
        isValueMode: true,
        value: value,
        alias: displayName,
        icon: iconUrl,
        schema: typeMapping.schema || [],
        path: [field.name],
        subFields: subFields,
      });
    } else {
      // Simple field - preserve value if existing record found
      let value;
      if (existingRecord && existingRecord.value) {
        // Preserve existing value
        value = existingRecord.value;
      } else {
        // Create empty value (or undefined based on user's comment)
        value = undefined;
      }

      records.push({
        isChecked: existingRecord?.isChecked !== undefined ? existingRecord.isChecked : false,
        id: field.id,
        key: field.name,
        fieldId: field.id,
        fieldFormat: field.fieldFormat || existingRecord?.fieldFormat || "",
        type: sdkType,
        dbFieldType: field.dbFieldType,
        dbFieldName: field.dbFieldName,
        field: field.id || field.dbFieldName,
        isValueMode: true,
        value: value,
        alias: displayName,
        icon: iconUrl,
        schema: typeMapping.schema || [],
        path: [field.name],
        subFields: existingRecord?.subFields,
      });
    }
  });

  return records;
}

export const useCreateRecordState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [record, setRecord] = useState(initialData.record || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  // Store initialData.record in a ref for prefilling purposes
  const initialRecordRef = useRef(initialData.record || []);

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = CREATE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setRecord(template.defaults.record);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setRecord([]);
  }, []);

  const onSheetChange = useCallback((newSheet) => {
    setSheet(newSheet);
    setTable(null);
    setView(null);
    setRecord([]);
  }, []);

  const onTableChange = useCallback((newTable) => {
    setTable(newTable);
    setView(null);
    setRecord([]);
  }, []);

  const onViewChange = useCallback((newView) => {
    setView(newView);
    setRecord([]);
  }, []);

  const onRecordChange = useCallback((newRecord) => {
    setRecord(newRecord);
  }, []);

  const initializeRecords = useCallback((fields, existingRecords = null) => {
    if (!fields || fields.length === 0) return;
    // Always initialize - use existingRecords if provided, otherwise use initialRecordRef
    const recordsToMerge = existingRecords !== null ? existingRecords : initialRecordRef.current;
    const initializedRecords = initializeRecordsFromFields(fields, recordsToMerge);
    setRecord(initializedRecords);
  }, []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (!sheet) {
      errors.push("Sheet selection is required");
    }

    if (!table) {
      errors.push("Table selection is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [sheet, table]);

  const getData = useCallback(() => {
    return {
      name,
      asset: sheet,
      subSheet: table,
      view,
      record,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, sheet, table, view, record, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    sheet,
    setSheet,
    table,
    setTable,
    view,
    setView,
    record,
    setRecord,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    onSheetChange,
    onTableChange,
    onViewChange,
    onRecordChange,
    initializeRecords,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
