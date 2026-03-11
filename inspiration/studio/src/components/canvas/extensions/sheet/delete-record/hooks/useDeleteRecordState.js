import { useState, useCallback, useMemo } from "react";
import { DELETE_TEMPLATES } from "../constants";
import isEmpty from "lodash/isEmpty";

export const useDeleteRecordState = (initialData = {}) => {
  console.log("initialData >>", initialData)
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [view, setView] = useState(initialData.view || null);
  const [filter, setFilter] = useState(initialData?.filter);
  // Sort by functionality commented out
  // const [orderBy, setOrderBy] = useState(initialData.orderBy || []);
  const [deleteMultiple, setDeleteMultiple] = useState(
    Object.prototype.hasOwnProperty.call(initialData, "isSingleUpdate")
      ? !initialData.isSingleUpdate
      : false
  );
  const [deleteAll, setDeleteAll] = useState(
    initialData.deleteAll || false
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(sheet && table);

  const hasFilterConditions = useMemo(() => {
    // if (!filter) return false;
    // const conditions = filter.childs || [];
    // return conditions.some(
    //   (c) => c.field && c.operator && (c.value !== undefined && c.value !== null && c.value !== "")
    // );
    return !isEmpty(filter);
  }, [filter]);

  const selectTemplate = useCallback((templateId) => {
    const template = DELETE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setFilter(template.defaults.filter);
      // setOrderBy(template.defaults.orderBy);
      setDeleteMultiple(template.defaults.deleteMultiple);
      setDeleteAll(template.defaults.deleteAll);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setFilter({});
    // setOrderBy([]);
    setDeleteMultiple(false);
    setDeleteAll(false);
  }, []);

  const onSheetChange = useCallback((newSheet) => {
    setSheet(newSheet);
    setTable(null);
    setFilter({});
    // setOrderBy([]);
    setDeleteAll(false);
  }, []);

  const onTableChange = useCallback((newTable) => {
    setTable(newTable);
    setFilter({});
    // setOrderBy([]);
    setDeleteAll(false);
  }, []);

  const onViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const onFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    if (newFilter?.conditions?.length > 0) {
      setDeleteAll(false);
    }
  }, []);

  // Sort by functionality commented out
  // const onOrderByChange = useCallback((newOrderBy) => {
  //   setOrderBy(newOrderBy);
  // }, []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (!sheet) {
      errors.push("Please select a sheet");
    }

    if (!table) {
      errors.push("Please select a table");
    }

    if (deleteMultiple && !hasFilterConditions && !deleteAll) {
      errors.push("Please add filter conditions or enable 'Delete all records'");
    }


    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [sheet, table, hasFilterConditions, deleteMultiple]);

  const getData = useCallback(() => {
    return {
      name,
      asset: sheet,
      subSheet: table,
      view,
      filter,
      // orderBy: deleteMultiple ? [] : orderBy,
      orderBy: [],
      isSingleUpdate: !deleteMultiple,
      deleteAll,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, sheet, table, view, filter, deleteMultiple, deleteAll, outputSchema, selectedTemplateId, isFromScratch]);

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
    filter,
    // orderBy,
    deleteMultiple,
    setDeleteMultiple,
    deleteAll,
    setDeleteAll,
    hasFilterConditions,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    onSheetChange,
    onTableChange,
    onViewChange,
    onFilterChange,
    // onOrderByChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
