import { useState, useCallback, useMemo } from "react";
import { FIND_ALL_TEMPLATES } from "../constants";

export const useFindAllState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [record, setRecord] = useState(initialData.record || []);
  const [filter, setFilter] = useState(initialData?.filter);
  const [whereClause, setWhereClause] = useState(initialData.whereClause || "");
  const [orderBy, setOrderBy] = useState(initialData.orderBy || []);
  const [orderByClause, setOrderByClause] = useState(initialData.orderByClause || "");
  const [limit, setLimit] = useState(initialData.limit || 100);
  const [offset, setOffset] = useState(() => {
    const v = initialData.offset;
    if (v === undefined || v === null || v === "") return 0;
    const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
    return Number.isNaN(n) ? 0 : n;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = FIND_ALL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setFilter(template.defaults.filter);
      setOrderBy(template.defaults.orderBy);
      setLimit(template.defaults.limit);
      const raw = template.defaults.offset;
      setOffset(typeof raw === "number" ? raw : parseInt(raw, 10) || 0);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setFilter({});
    setOrderBy([]);
    setLimit(100);
    setOffset(0);
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

  const onLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
  }, []);

  const onOffsetChange = useCallback((newOffset) => {
    setOffset(newOffset);
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
      limit,
      offset,
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
    limit,
    offset,
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
    limit,
    setLimit,
    offset,
    setOffset,
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
    onLimitChange,
    onOffsetChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
