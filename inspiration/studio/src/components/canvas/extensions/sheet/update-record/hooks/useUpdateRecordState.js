import { useState, useCallback, useMemo } from "react";
import { UPDATE_TEMPLATES } from "../constants";

export const useUpdateRecordState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [record, setRecord] = useState(initialData.record || []);
  const [rowIdentifier, setRowIdentifier] = useState(
    initialData.rowIdentifier || { type: "fx", blocks: [] }
  );
  const [filter, setFilter] = useState(initialData?.filter);
  const [whereClause, setWhereClause] = useState(initialData.whereClause || "");
  // Sort functionality commented out
  // const [sort, setSort] = useState(initialData.sort || []);
  // const [sortClause, setSortClause] = useState(initialData.sortClause || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = UPDATE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setRecord(template.defaults.record);
      setRowIdentifier(template.defaults.rowIdentifier);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setRecord([]);
    setRowIdentifier({ type: "fx", blocks: [] });
  }, []);

  const onSheetChange = useCallback((newSheet) => {
    setSheet(newSheet);
    setTable(null);
    setView(null);
    setRecord([]);
    setRowIdentifier({ type: "fx", blocks: [] });
    setFilter({});
    setWhereClause("");
    // setSort([]);
    // setSortClause("");
  }, []);

  const onTableChange = useCallback((newTable) => {
    setTable(newTable);
    setView(null);
    setRecord([]);
    setFilter({});
    setWhereClause("");
    // setSort([]);
    // setSortClause("");
  }, []);

  const onViewChange = useCallback((newView) => {
    setView(newView);
    setRecord([]);
    setFilter({});
    setWhereClause("");
    // setSort([]);
    // setSortClause("");
  }, []);

  const onRecordChange = useCallback((newRecord) => {
    setRecord(newRecord);
  }, []);

  const onRowIdentifierChange = useCallback((blocks) => {
    setRowIdentifier({ type: "fx", blocks });
  }, []);

  const onFilterChange = useCallback((newFilter, newWhereClause) => {
    setFilter(newFilter);
    setWhereClause(newWhereClause);
  }, []);

  // Sort functionality commented out
  // const onSortChange = useCallback((newSort, newSortClause) => {
  //   setSort(newSort);
  //   setSortClause(newSortClause);
  // }, []);

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
      errors.push("Add at least one condition to identify which record to update");
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
      rowIdentifier,
      filter,
      whereClause,
      // sort,
      // sortClause,
      sort: [],
      sortClause: "",
      isSingleUpdate: true,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, sheet, table, view, record, rowIdentifier, filter, whereClause, outputSchema, selectedTemplateId, isFromScratch]);

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
    rowIdentifier,
    setRowIdentifier,
    filter,
    setFilter,
    whereClause,
    setWhereClause,
    // sort,
    // setSort,
    // sortClause,
    // setSortClause,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    onSheetChange,
    onTableChange,
    onViewChange,
    onRecordChange,
    onRowIdentifierChange,
    onFilterChange,
    // onSortChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
