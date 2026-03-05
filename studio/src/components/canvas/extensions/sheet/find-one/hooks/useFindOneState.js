import { useState, useCallback, useMemo } from "react";
import { FIND_ONE_TEMPLATES } from "../constants";
import { generateId, createEmptyRoot } from "@src/module/condition-composer-v2/utils/helpers";

const migrateLookupToFilter = (initialData) => {
  if (initialData.filter) {
    return initialData.filter;
  }
  
  if (initialData.lookupField && initialData.lookupValue) {
    const lookupField = initialData.lookupField;
    const lookupValue = initialData.lookupValue;
    
    return {
      id: generateId ? generateId() : `cond_${Date.now()}`,
      condition: 'and',
      childs: [{
        id: generateId ? generateId() : `cond_${Date.now()}_1`,
        key: lookupField.name || lookupField.id,
        field: lookupField.id,
        type: lookupField.type,
        label: lookupField.name,
        operator: { value: 'equals', key: 'equals' },
        value: lookupValue,
        valueStr: lookupValue?.blocks?.map(b => b.value || '').join('') || '',
      }],
    };
  }
  
  return null;
};

export const useFindOneState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [record, setRecord] = useState(initialData.record || []);
  const [filter, setFilter] = useState(() => migrateLookupToFilter(initialData));
  const [whereClause, setWhereClause] = useState(initialData.whereClause || "");
  const [orderBy, setOrderBy] = useState(initialData.orderBy || []);
  const [orderByClause, setOrderByClause] = useState(initialData.orderByClause || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = FIND_ONE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setFilter(template.defaults.filter);
      setOrderBy(template.defaults.orderBy);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setFilter({});
    setOrderBy([]);
  }, []);

  const onSheetChange = useCallback((newSheet) => {
    setSheet(newSheet);
    setTable(null);
    setView(null);
    setRecord([]);
    setFilter({});
    setWhereClause("");
    setOrderBy([]);
    setOrderByClause("");
  }, []);

  const onTableChange = useCallback((newTable) => {
    setTable(newTable);
    setView(null);
    setRecord([]);
    setFilter({});
    setWhereClause("");
    setOrderBy([]);
    setOrderByClause("");
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

  const onFilterChange = useCallback((filterValue, whereClauseStr) => {
    setFilter(filterValue);
    setWhereClause(whereClauseStr);
  }, []);

  const onOrderByChange = useCallback((orderByData, orderByClauseStr) => {
    setOrderBy(orderByData);
    setOrderByClause(orderByClauseStr);
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
    const selectedFields = record.filter((item) => item.checked);
    const requiredFields = selectedFields.length > 0
      ? selectedFields.map((item) => ({ id: item.id, name: item.key || item.name }))
      : record.map((item) => ({ id: item.id, name: item.key || item.name }));

    return {
      name,
      asset: sheet,
      subSheet: table,
      view,
      record,
      filter,
      whereClause,
      orderBy,
      orderByClause,
      requiredFields,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [
    name,
    sheet,
    table,
    view,
    record,
    filter,
    whereClause,
    orderBy,
    orderByClause,
    outputSchema,
    selectedTemplateId,
    isFromScratch,
  ]);

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
    orderBy,
    setOrderBy,
    orderByClause,
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
    onOrderByChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
