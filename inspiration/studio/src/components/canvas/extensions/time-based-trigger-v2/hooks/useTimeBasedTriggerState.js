import { useState, useCallback, useMemo } from "react";
import { TIME_TEMPLATES } from "../constants";

export const useTimeBasedTriggerState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.frequency;
  const [frequency, setFrequency] = useState(initialData.frequency || "day");
  const [minute, setMinute] = useState(initialData.minute || "0");
  const [hour, setHour] = useState(initialData.hour || "9");
  const [dayOfWeek, setDayOfWeek] = useState(initialData.dayOfWeek || "monday");
  const [dayOfMonth, setDayOfMonth] = useState(initialData.dayOfMonth || "1");
  const [timezone, setTimezone] = useState(initialData.timezone || "UTC");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.frequency);

  const selectTemplate = useCallback((templateId) => {
    const template = TIME_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setFrequency(template.defaults.frequency);
      if (template.defaults.minute !== undefined) setMinute(template.defaults.minute);
      if (template.defaults.hour !== undefined) setHour(template.defaults.hour);
      if (template.defaults.dayOfWeek !== undefined) setDayOfWeek(template.defaults.dayOfWeek);
      if (template.defaults.dayOfMonth !== undefined) setDayOfMonth(template.defaults.dayOfMonth);
      if (template.defaults.timezone !== undefined) setTimezone(template.defaults.timezone);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setFrequency("day");
    setMinute("0");
    setHour("9");
    setDayOfWeek("monday");
    setDayOfMonth("1");
    setTimezone("UTC");
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!frequency) {
      errors.push("Frequency is required");
    }

    if (frequency === "hour" || frequency === "day" || frequency === "week" || frequency === "month") {
      if (!minute || minute < 0 || minute > 59) {
        errors.push("Valid minute (0-59) is required");
      }
    }

    if (frequency === "day" || frequency === "week" || frequency === "month") {
      if (!hour || hour < 0 || hour > 23) {
        errors.push("Valid hour (0-23) is required");
      }
    }

    if (frequency === "week" && !dayOfWeek) {
      errors.push("Day of week is required for weekly schedule");
    }

    if (frequency === "month") {
      if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) {
        errors.push("Valid day of month (1-31) is required");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [frequency, minute, hour, dayOfWeek, dayOfMonth]);

  const getData = useCallback(() => {
    return {
      frequency,
      minute,
      hour,
      dayOfWeek,
      dayOfMonth,
      timezone,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [frequency, minute, hour, dayOfWeek, dayOfMonth, timezone, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    frequency,
    setFrequency,
    minute,
    setMinute,
    hour,
    setHour,
    dayOfWeek,
    setDayOfWeek,
    dayOfMonth,
    setDayOfMonth,
    timezone,
    setTimezone,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
