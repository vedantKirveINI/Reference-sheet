import { useState, useCallback, useMemo } from "react";
import { TRIGGER_TEMPLATES } from "../constants";

export const useTriggerState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.asset;
  const [name, setName] = useState(initialData.name || "");
  const [sheet, setSheet] = useState(initialData.asset || null);
  const [table, setTable] = useState(initialData.subSheet || null);
  const [eventTypes, setEventTypes] = useState(
    initialData.eventTypes || []
  );
  const [filterConditions, setFilterConditions] = useState(
    initialData.filterConditions || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );

  const hasInitialised = Boolean(sheet && table);

  const selectTemplate = useCallback((templateId) => {
    const template = TRIGGER_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setEventTypes(template.defaults.eventTypes);
      setFilterConditions(template.defaults.filterConditions);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setEventTypes([]);
    setFilterConditions({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const toggleEventType = useCallback((eventId) => {
    setEventTypes((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      }
      return [...prev, eventId];
    });
  }, []);

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
    
    if (eventTypes.length === 0) {
      errors.push("Please select at least one event type");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [sheet, table, eventTypes]);

  const getData = useCallback(() => {
    return {
      name,
      asset: sheet,
      subSheet: table,
      eventTypes,
      eventType: eventTypes,
      filterConditions,
      fields: table?.fields,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, sheet, table, eventTypes, filterConditions, selectedTemplateId, isFromScratch]);

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
    eventTypes,
    setEventTypes,
    toggleEventType,
    filterConditions,
    setFilterConditions,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    updateState,
    validation,
    getData,
    getError,
  };
};
