import { useState, useCallback, useMemo } from "react";
import { UPDATE_RECORDS_TEMPLATES } from "../constants";

export const useUpdateRecordsState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [record, setRecord] = useState(initialData.record || []);
  const [filter, setFilter] = useState(initialData?.filter);
  const [whereClause, setWhereClause] = useState(initialData.whereClause || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = UPDATE_RECORDS_TEMPLATES.find((t) => t.id === templateId);
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
    setFilter({});
    setWhereClause("");
  }, []);

  const onTableChange = useCallback((newTable) => {
    setTable(newTable);
    setView(null);
    setRecord([]);
    setFilter({});
    setWhereClause("");
  }, []);

  const onViewChange = useCallback((newView) => {
    setView(newView);
    setRecord([]);
    setFilter({});
    setWhereClause("");
  }, []);

  const onRecordChange = useCallback((newRecord) => {
    setRecord(newRecord);
  }, []);

  const onFilterChange = useCallback((newFilter, newWhereClause) => {
    setFilter(newFilter);
    setWhereClause(newWhereClause);
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

    const hasFilter = filter?.childs?.length > 0;
    
    if (!hasFilter) {
      errors.push("Add at least one condition to identify which records to update");
    }

    const hasCheckedFields = record?.some((r) => r.isChecked === true || r.checked === true);
    
    if (!hasCheckedFields) {
      errors.push("At least one field must be selected for update");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [sheet, table, filter, record]);

  const getData = useCallback(() => {
    return {
      name,
      asset: sheet,
      subSheet: table,
      view,
      record,
      filter,
      whereClause,
      isSingleUpdate: false,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, sheet, table, view, record, filter, whereClause, outputSchema, selectedTemplateId, isFromScratch]);

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
    filter,
    setFilter,
    whereClause,
    setWhereClause,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    onSheetChange,
    onTableChange,
    onViewChange,
    onRecordChange,
    onFilterChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
