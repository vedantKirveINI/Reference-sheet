import { useState, useCallback, useMemo } from "react";
import { TRIGGER_TYPES, TRIGGER_TEMPLATES, FORM_EVENTS_LEGACY, FORM_EVENT_ID_TO_KEY, createDefaultTimingRule } from "../constants";
import { INTEGRATION_TYPE, TRIGGER_SETUP_TYPE } from "../../constants/types";
import { generateScheduleSummary } from "../../triggers/time-based/hooks/useScheduleSummary";

/**
 * Infer concrete trigger type from saved go_data shape when node type is generic (TRIGGER_SETUP).
 * Ensures reopening a saved trigger prefills the correct panel (e.g. form, time-based).
 */
function inferTriggerTypeFromGoData(data) {
  if (!data || typeof data !== "object") return null;
  if (data.form != null) return TRIGGER_TYPES.FORM;
  if (data.scheduleType != null || data.runScenario != null) return TRIGGER_TYPES.TIME_BASED;
  if (data.webhookData != null) return TRIGGER_TYPES.WEBHOOK;
  if (data.setupData != null && (data.setupData.integration_id != null || data.setupData.event_id != null)) return INTEGRATION_TYPE;
  if (data.integration != null) return TRIGGER_TYPES.APP_BASED;
  if (data.asset != null && data.subSheet != null && data.dateField != null) return TRIGGER_TYPES.DATE_FIELD;
  if (data.asset != null && data.subSheet != null && data.eventType != null) return TRIGGER_TYPES.SHEET;
  if (data.inputs != null && !data.form) return TRIGGER_TYPES.MANUAL;
  return null;
}

// Map legacy frequency to new scheduleType
const mapLegacyToScheduleType = (frequency) => {
  switch (frequency) {
    case "minute": return "interval";
    case "hour": return "interval";
    case "day": return "daily";
    case "week": return "weekly";
    case "month": return "monthly";
    default: return "interval";
  }
};

// Map scheduleType back to legacy frequency (requires interval for proper unit handling)
const mapScheduleTypeToLegacy = (scheduleType, interval) => {
  switch (scheduleType) {
    case "interval": 
      // Check interval unit to determine correct legacy frequency
      return interval?.unit === "hours" ? "hour" : "minute";
    case "daily": return "day";
    case "weekly": return "week";
    case "monthly": return "month";
    case "once": return "day";
    case "custom": return "day";
    default: return "day";
  }
};

// Legacy run scenario mapping (from TimeBasedTriggerV2)
const LEGACY_RUN_SCENARIO_MAP = {
  'AT_REGULAR_INTERVALS': 'interval',
  'ONCE': 'once',
  'EVERY_DAY': 'daily',
  'DAYS_OF_THE_WEEK': 'weekly',
  'DAYS_OF_THE_MONTH': 'monthly',
  'SPECIFIED_DATES': 'custom',
};

// Default schedule config (matching TimeBasedTriggerV2)
const DEFAULT_SCHEDULE_CONFIG = {
  interval: { value: 15, unit: "minutes" },
  time: "09:00",
  weekdays: [1, 2, 3, 4, 5],  // V2 default: Mon-Fri
  dayOfMonth: "1",
  customDates: [],
  onceDate: null,
};

// Migrate legacy data to new format (matching TimeBasedTriggerV2 migration logic EXACTLY)
const migrateLegacyScheduleData = (data) => {
  // If already has new format (scheduleType field), preserve it with defaults for missing fields
  if (data.scheduleType) {
    // Only advancedWeekdays uses businessHoursOnly toggle (not weekdays!)
    const legacyWeekdays = data.advanced?.businessHoursOnly ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
    // Daily means every day: always normalize weekdays to all 7
    const weekdays = data.scheduleType === "daily"
      ? [0, 1, 2, 3, 4, 5, 6]
      : (data.weekdays !== undefined ? data.weekdays : DEFAULT_SCHEDULE_CONFIG.weekdays);
    return {
      ...data,
      scheduleType: data.scheduleType,
      interval: data.interval !== undefined ? data.interval : DEFAULT_SCHEDULE_CONFIG.interval,
      time: data.time !== undefined ? data.time : DEFAULT_SCHEDULE_CONFIG.time,
      timezone: data.timezone !== undefined ? data.timezone : (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"),
      weekdays,
      dayOfMonth: data.dayOfMonth !== undefined ? data.dayOfMonth : DEFAULT_SCHEDULE_CONFIG.dayOfMonth,
      customDates: data.customDates !== undefined ? data.customDates : DEFAULT_SCHEDULE_CONFIG.customDates,
      onceDate: data.onceDate !== undefined ? data.onceDate : DEFAULT_SCHEDULE_CONFIG.onceDate,
      advanced: {
        startDate: data.advanced?.startDate !== undefined ? data.advanced.startDate : null,
        endDate: data.advanced?.endDate !== undefined ? data.advanced.endDate : null,
        advancedWeekdays: data.advanced?.advancedWeekdays !== undefined ? data.advanced.advancedWeekdays : legacyWeekdays,
      },
    };
  }

  // Check for very old legacy format with runScenario
  if (data.runScenario) {
    const scheduleType = LEGACY_RUN_SCENARIO_MAP[data.runScenario] || 'interval';
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const weekdaysFromRunScenario = scheduleType === "daily"
      ? [0, 1, 2, 3, 4, 5, 6]
      : (data.weekdays !== undefined ? data.weekdays : DEFAULT_SCHEDULE_CONFIG.weekdays);
    
    // Only advancedWeekdays uses businessHoursOnly toggle (matching V2 exactly)
    const legacyBusinessHours = data.businessHoursOnly === true || data.advanced?.businessHoursOnly === true;
    
    return {
      ...data,
      scheduleType,
      interval: {
        value: parseInt(data.minutes, 10) || 15,
        unit: 'minutes',
      },
      time: data.time !== undefined ? data.time : DEFAULT_SCHEDULE_CONFIG.time,
      timezone: data.timezone !== undefined ? data.timezone : detectedTimezone,
      weekdays: weekdaysFromRunScenario,
      dayOfMonth: data.dayOfMonth !== undefined ? data.dayOfMonth : DEFAULT_SCHEDULE_CONFIG.dayOfMonth,
      customDates: data.customDates !== undefined ? data.customDates : [],
      onceDate: data.onceDate !== undefined ? data.onceDate : null,
      advanced: {
        startDate: data.startDate || data.advanced?.startDate || null,
        endDate: data.endDate || data.advanced?.endDate || null,
        advancedWeekdays: data.advanced?.advancedWeekdays !== undefined 
          ? data.advanced.advancedWeekdays 
          : (legacyBusinessHours ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]),
      },
    };
  }
  
  // Handle legacy frequency-based format (from V3 constants)
  const legacyFrequency = data.frequency;
  if (legacyFrequency) {
    const scheduleType = mapLegacyToScheduleType(legacyFrequency);
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    
    // Build time from legacy hour/minute
    const hour = String(data.hour || "9").padStart(2, "0");
    const minute = String(data.minute || "0").padStart(2, "0");
    const time = `${hour}:${minute}`;
    
    // For interval types, read from legacy 'minutes' field if available
    let interval = DEFAULT_SCHEDULE_CONFIG.interval;
    if (legacyFrequency === "minute" || legacyFrequency === "hour") {
      const legacyMinutes = parseInt(data.minutes, 10);
      if (legacyFrequency === "hour") {
        interval = { value: legacyMinutes || 1, unit: "hours" };
      } else {
        interval = { value: legacyMinutes || 15, unit: "minutes" };
      }
    }
    
    // Map legacy dayOfWeek to weekdays array - use DEFAULT_SCHEDULE_CONFIG.weekdays as default
    let weekdays = DEFAULT_SCHEDULE_CONFIG.weekdays;
    if (legacyFrequency === "week" && data.dayOfWeek) {
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const dayId = dayMap[data.dayOfWeek.toLowerCase()];
      if (dayId !== undefined) {
        weekdays = [dayId];
      }
    } else if (data.weekdays && Array.isArray(data.weekdays)) {
      weekdays = data.weekdays;
    }
    if (scheduleType === "daily") {
      weekdays = [0, 1, 2, 3, 4, 5, 6];
    }
    
    // Only advancedWeekdays uses businessHoursOnly toggle
    const legacyBusinessHours = data.businessHoursOnly === true || data.advanced?.businessHoursOnly === true;
    
    return {
      ...data,
      scheduleType,
      interval,
      time,
      timezone: data.timezone !== undefined ? data.timezone : detectedTimezone,
      weekdays,
      dayOfMonth: data.dayOfMonth !== undefined ? data.dayOfMonth : DEFAULT_SCHEDULE_CONFIG.dayOfMonth,
      customDates: data.customDates !== undefined ? data.customDates : [],
      onceDate: data.onceDate !== undefined ? data.onceDate : null,
      advanced: {
        startDate: data.startDate || data.advanced?.startDate || null,
        endDate: data.endDate || data.advanced?.endDate || null,
        advancedWeekdays: data.advanced?.advancedWeekdays !== undefined 
          ? data.advanced.advancedWeekdays 
          : (legacyBusinessHours ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]),
      },
    };
  }
  
  // No legacy format detected, return with defaults
  return data;
};

const getDefaultState = () => ({
  triggerType: null,
  _templateId: null,
  _isFromScratch: false,
  // Time-based trigger - enhanced schedule config
  scheduleType: "interval",
  interval: { value: 15, unit: "minutes" },
  time: "09:00",
  weekdays: [1, 2, 3, 4, 5],
  customDates: [],
  onceDate: null,
  advanced: { startDate: null, endDate: null, advancedWeekdays: [0, 1, 2, 3, 4, 5, 6] },
  // Legacy frequency fields (for backward compatibility)
  frequency: "day",
  minute: "0",
  hour: "9",
  dayOfWeek: "monday",
  dayOfMonth: "1",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  method: "POST",
  webhookUrl: "",
  webhookName: "My webhook",
  allowed_ips: "",
  webhookData: {},
  inputs: [],
  expectedSchema: {},
  responseType: "json",
  responseStatus: 200,
  responseBody: "",
  verifySignature: false,
  signatureHeader: "",
  signatureSecret: "",
  formId: null,
  formConnection: null,
  formEvent: "submit",
  sheetId: null,
  sheetConnection: null,
  sheetEventTypes: [],
  columnFilter: "all",
  selectedColumns: [],
  dateColumn: null,
  dateOffset: 0,
  dateOffsetUnit: "days",
  dateOffsetDirection: "before",
  timingRules: [createDefaultTimingRule({ index: 0 })],
  streamId: null,
  integration: null,
  integrationEvent: null,
  integrationConnection: null,
  integrationEventData: null,
  integrationConfigureData: null,
  // Legacy restore: when loading from legacy go_data (setupData, connection, flow, state)
  integration_id: null,
  event_id: null,
  inputSchema: [],
  outputSchema: [],
  goData: {},
  lastActiveTab: null,
});

// Hydrate formConnection and formEvent from legacy go_data (form, event, activeNode)
const hydrateFormTriggerFromLegacy = (data) => {
  if (!data?.form) return data;
  const legacyForm = data.form;
  const legacyEvent = data.event;
  const legacyActiveNode = data.activeNode || {};
  const fields = Object.entries(legacyActiveNode).map(([nodeId, rawNode]) => ({
    id: nodeId,
    type: rawNode?.type,
    name: rawNode?.config?.name || rawNode?.config?.title || rawNode?.config?.label || nodeId,
    key: rawNode?.config?.key || nodeId,
    _raw: rawNode,
  }));
  const formEvent = legacyEvent?.id && FORM_EVENT_ID_TO_KEY[legacyEvent.id] != null
    ? FORM_EVENT_ID_TO_KEY[legacyEvent.id]
    : "submit";
  return {
    ...data,
    formConnection: {
      ...legacyForm,
      id: legacyForm.asset_id || legacyForm._id || legacyForm.id,
      name: legacyForm.name || legacyForm.title,
      fields,
    },
    formEvent,
    formId: legacyForm.asset_id || legacyForm._id || legacyForm.id,
  };
};

// Hydrate webhook state from legacy go_data (label, allowed_ips, webhookData, inputs)
const hydrateWebhookTriggerFromLegacy = (data) => {
  if (!data || typeof data !== "object") return data;
  const hasWebhookData = data.webhookData != null || data.label != null || (Array.isArray(data.inputs) && data.inputs.length > 0);
  if (!hasWebhookData) return data;
  const allowedIpsRaw = data.allowed_ips;
  const allowed_ips =
    typeof allowedIpsRaw === "string"
      ? allowedIpsRaw
      : Array.isArray(allowedIpsRaw)
        ? allowedIpsRaw.join(", ")
        : "";
  return {
    ...data,
    webhookName: data.label ?? data.webhookName ?? "My webhook",
    allowed_ips,
    webhookData: data.webhookData ?? {},
    inputs: Array.isArray(data.inputs) ? data.inputs : [],
    webhookUrl: data.webhookData?.webhook_url ?? data.webhookUrl ?? "",
  };
};

// Map legacy sheet trigger event label/snake_case to our sheetEvent id (row_created, row_updated, row_deleted)
const LEGACY_SHEET_EVENT_TO_ID = {
  "Create Record": "row_created",
  "Update Record": "row_updated",
  "Delete Record": "row_deleted",
  create_record: "row_created",
  update_record: "row_updated",
  delete_record: "row_deleted",
  row_created: "row_created",
  row_updated: "row_updated",
  row_deleted: "row_deleted",
};

// Hydrate sheet (table) trigger state from legacy go_data (asset, subSheet, eventType, fields)
const hydrateSheetTriggerFromLegacy = (data) => {
  if (!data || typeof data !== "object") return data;
  const hasSheetData = data.asset != null && data.subSheet != null && data.eventType != null;
  if (!hasSheetData) return data;
  const asset = data.asset;
  const subSheet = data.subSheet;
  const sheetConnection =
    asset && subSheet
      ? {
          sheet: asset?.id != null ? asset : { ...asset, id: asset._id ?? asset.id },
          table: subSheet,
          name: asset?.name ?? asset?.title ?? "",
          columns: subSheet?.fields ?? data.fields ?? [],
        }
      : null;
  const rawEvents = Array.isArray(data.eventType) ? data.eventType : data.eventType != null ? [data.eventType] : [];
  const mapToInternalId = (e) => {
    if (e && LEGACY_SHEET_EVENT_TO_ID[e] != null) return LEGACY_SHEET_EVENT_TO_ID[e];
    if (e && /create|created/i.test(String(e))) return "row_created";
    if (e && /update|updated/i.test(String(e))) return "row_updated";
    if (e && /delete|deleted/i.test(String(e))) return "row_deleted";
    return null;
  };
  const sheetEventTypes = rawEvents.map(mapToInternalId).filter(Boolean);
  return {
    ...data,
    sheetConnection,
    sheetEventTypes: sheetEventTypes.length ? sheetEventTypes : [],
    sheetId: asset?._id ?? asset?.id ?? null,
    columnFilter: data.columnFilter ?? "all",
    selectedColumns: Array.isArray(data.selectedColumns) ? data.selectedColumns : [],
    streamId: data.streamId ?? null,
  };
};

// Hydrate date field trigger state from legacy go_data (asset, subSheet, dateField, timingRules, fields)
const hydrateDateFieldTriggerFromLegacy = (data) => {
  if (!data || typeof data !== "object") return data;
  const hasDateFieldData = data.asset != null && data.subSheet != null && data.dateField != null;
  if (!hasDateFieldData) return data;
  const asset = data.asset;
  const subSheet = data.subSheet;
  const sheetConnection =
    asset && subSheet
      ? {
          sheet: asset?.id != null ? asset : { ...asset, id: asset._id ?? asset.id },
          table: subSheet,
          name: asset?.name ?? asset?.title ?? "",
          columns: subSheet?.fields ?? data.fields ?? [],
        }
      : null;
  const dateField = data.dateField;
  const dateColumn =
    typeof dateField === "object" && dateField !== null && (dateField.id != null || dateField.key != null)
      ? dateField.id ?? dateField.key
      : dateField;
  const timingRules =
    Array.isArray(data.timingRules) && data.timingRules.length > 0
      ? data.timingRules.map((r, i) => ({
          id: r.id || `rule-${i}-${Date.now()}`,
          timing: r.timing ?? "BEFORE",
          offsetValue: typeof r.offsetValue === "number" ? r.offsetValue : 1,
          offsetUnit: r.offsetUnit ?? "days",
          label: r.label ?? `Rule ${i + 1}`,
        }))
      : [createDefaultTimingRule({ index: 0 })];
  return {
    ...data,
    sheetConnection,
    dateColumn,
    dateOffset: timingRules[0]?.offsetValue ?? 0,
    dateOffsetUnit: timingRules[0]?.offsetUnit ?? "days",
    dateOffsetDirection:
      timingRules[0]?.timing === "AFTER" ? "after" : timingRules[0]?.timing === "EXACT" ? "on" : "before",
    timingRules,
    streamId: data.streamId ?? null,
  };
};

/**
 * Hydrate app-based (integration) trigger from legacy go_data.
 * Legacy: configureData = entire go_data when node has flow (Setup.jsx initSetup).
 * So getInitialAnswers = () => configureData?.state uses go_data.state.
 * We must ensure integrationConfigureData.state is set from go_data whenever we have saved state/flow/configs.
 */
const hydrateAppBasedTriggerFromLegacy = (data) => {
  if (!data || typeof data !== "object") return data;
  const hasLegacySetupData =
    data.setupData &&
    (data.setupData.integration_id != null || data.setupData.event_id != null);
  const hasConfigurePayload =
    data.state != null || data.flow != null || data.configs != null;
  const hasConnection = data.integrationConnection != null || data.connection != null;
  const existingConfigure = data.integrationConfigureData;
  const existingState = existingConfigure?.state;
  const topLevelState = data.state;

  // Build or merge integrationConfigureData so initial answers always come from saved go_data (legacy: configureData = node.go_data)
  const shouldBuildConfigure =
    hasConfigurePayload ||
    topLevelState != null ||
    (hasConnection && (data.flow != null || data.configs != null));
  const integrationConfigureData =
    existingConfigure && existingState != null
      ? existingConfigure
      : shouldBuildConfigure || hasConnection
        ? {
            type: existingConfigure?.type || "INTEGRATION_TRIGGER",
            state: existingState ?? topLevelState ?? {},
            flow: existingConfigure?.flow ?? data.flow ?? {},
            configs: existingConfigure?.configs ?? data.configs ?? {},
          }
        : null;

  const integrationConnection = data.integrationConnection ?? data.connection ?? null;

  if (process.env.NODE_ENV === "development" && (hasConnection || integrationConfigureData)) {
    console.log("[TriggerSetup] APP_BASED restore from go_data", {
      hasConnection: !!integrationConnection,
      hasConfigureData: !!integrationConfigureData,
      hasLegacyConnection: !!data.connection,
      hasLegacyState: data.state != null,
      hasLegacyFlow: data.flow != null,
    });
  }

  return {
    ...data,
    integration_id: data.integration_id ?? data.setupData?.integration_id ?? null,
    event_id: data.event_id ?? data.setupData?.event_id ?? null,
    integrationConnection,
    integrationConfigureData,
  };
};

export const useTriggerSetupState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.triggerType;
  const [state, setState] = useState(() => {
    const defaults = getDefaultState();
    const merged = { ...defaults, ...initialData };
    // Migrate legacy schedule data to new format
    const migrated = migrateLegacyScheduleData(merged);
    // When node type is generic (TRIGGER_SETUP), infer concrete type from saved go_data so UI prefills
    const genericType = migrated.triggerType === TRIGGER_SETUP_TYPE;
    const inferredType = inferTriggerTypeFromGoData(migrated);
    if (genericType && inferredType) {
      migrated.triggerType = inferredType;
      if (process.env.NODE_ENV === "development") {
        console.log("[TriggerSetup] Inferred trigger type from go_data for prefill", { inferredType, goDataKeys: Object.keys(initialData || {}) });
      }
    }
    if (genericType && !inferredType) {
      migrated.triggerType = null;
    }
    // Hydrate form trigger UI state from legacy go_data (form, event, activeNode)
    const withFormHydration = hydrateFormTriggerFromLegacy(migrated);
    // Hydrate webhook trigger UI state from legacy go_data (label, allowed_ips, webhookData, inputs)
    const withWebhookHydration = hydrateWebhookTriggerFromLegacy(withFormHydration);
    // Hydrate sheet (table) trigger UI state from legacy go_data (asset, subSheet, eventType, fields)
    const withSheetHydration = hydrateSheetTriggerFromLegacy(withWebhookHydration);
    // Hydrate date field trigger UI state from legacy go_data (asset, subSheet, dateField, timingRules)
    const withDateFieldHydration = hydrateDateFieldTriggerFromLegacy(withSheetHydration);
    // Hydrate app-based trigger from legacy go_data (setupData, connection, flow, state, configs)
    const withAppBasedHydration = hydrateAppBasedTriggerFromLegacy(withDateFieldHydration);
    const finalState = {
      ...withAppBasedHydration,
      _templateId: initialData._templateId || null,
      _isFromScratch: initialData._isFromScratch || isNewNode,
    };
    const inferredTriggerType = finalState.triggerType || inferTriggerTypeFromGoData(initialData);
    if (finalState.triggerType === TRIGGER_TYPES.APP_BASED || finalState.triggerType === INTEGRATION_TYPE) {
      console.log("[TriggerSetup] APP_BASED hydration", {
        triggerType: finalState.triggerType,
        hasIntegration: !!finalState.integration,
        hasIntegrationEvent: !!finalState.integrationEvent,
        hasIntegrationConnection: !!finalState.integrationConnection,
        hasIntegrationEventData: !!finalState.integrationEventData,
        hasIntegrationConfigureData: !!finalState.integrationConfigureData,
        legacyIds: { integration_id: finalState.integration_id, event_id: finalState.event_id },
        goDataKeysFromInitialData: Object.keys(initialData || {}),
      });
    }
    console.log("[TriggerSetup] hydration", {
      triggerType: finalState.triggerType,
      inferredType: inferredTriggerType,
      goDataKeysFromInitialData: Object.keys(initialData || {}),
      hasStreamId: finalState.streamId != null,
    });
    return finalState;
  });

  const hasInitialised = useMemo(() => {
    if (!state.triggerType) return false;
    
    // App-Based triggers require full integration setup
    if (state.triggerType === INTEGRATION_TYPE || state.triggerType === TRIGGER_TYPES.APP_BASED) {
      return !!(state.integration && state.integrationEvent && state.integrationConnection);
    }
    
    // Form triggers - accept any form identifier (new or legacy shapes)
    if (state.triggerType === TRIGGER_TYPES.FORM) {
      // New shape: formConnection object with id
      const fc = state.formConnection;
      if (fc && (fc.id || fc.asset_id || fc._id)) return true;
      // Legacy shapes: direct formId or form field
      if (state.formId || state.form) return true;
      return false;
    }
    
    // Sheet triggers - accept any sheet/table identifier (new or legacy shapes)
    if (state.triggerType === TRIGGER_TYPES.SHEET) {
      // New shape: sheetConnection object with table
      const sc = state.sheetConnection;
      if (sc && (sc.table || sc.subSheet || sc.tableId || sc.subSheetId)) return true;
      // Legacy shapes: direct sheetId/tableId or sheet/table fields
      if ((state.sheetId || state.sheet) && (state.tableId || state.table || state.subSheet)) return true;
      return false;
    }
    
    // DateField triggers - require sheet + date column (new or legacy shapes)
    if (state.triggerType === TRIGGER_TYPES.DATE_FIELD) {
      // Check for sheet connection (any shape)
      const sc = state.sheetConnection;
      const hasSheet = !!(sc && (sc.table || sc.subSheet || sc.tableId || sc.subSheetId)) ||
                       !!((state.sheetId || state.sheet) && (state.tableId || state.table));
      // Check for date column (any shape)
      const hasDateCol = !!(state.dateColumn || state.dateFieldColumn || state.dateColumnId);
      return hasSheet && hasDateCol;
    }
    
    // All other triggers just need to be selected
    return state._isFromScratch || state._templateId !== null || state.triggerType !== null;
  }, [
    state._isFromScratch, 
    state._templateId, 
    state.triggerType, 
    state.integration, 
    state.integrationEvent, 
    state.integrationConnection,
    state.formConnection,
    state.formId,
    state.form,
    state.sheetConnection,
    state.sheetId,
    state.sheet,
    state.tableId,
    state.table,
    state.subSheet,
    state.dateColumn,
    state.dateFieldColumn,
    state.dateColumnId,
  ]);

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setTriggerType = useCallback((triggerType) => {
    setState((prev) => ({
      ...prev,
      triggerType,
      _isFromScratch: true,
    }));
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = TRIGGER_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setState((prev) => ({
        ...prev,
        ...template.defaults,
        triggerType: template.triggerType,
        _templateId: templateId,
        _isFromScratch: false,
      }));
    }
  }, []);

  const startFromScratch = useCallback((triggerType) => {
    setState((prev) => ({
      ...getDefaultState(),
      triggerType,
      _isFromScratch: true,
      _templateId: null,
    }));
  }, []);

  // Enhanced schedule setters
  const setScheduleType = useCallback((scheduleType) => {
    updateState(
      scheduleType === "daily"
        ? { scheduleType, weekdays: [0, 1, 2, 3, 4, 5, 6] }
        : { scheduleType },
    );
  }, [updateState]);
  const setInterval = useCallback((interval) => updateState({ interval }), [updateState]);
  const setTime = useCallback((time) => updateState({ time }), [updateState]);
  const setWeekdays = useCallback((weekdays) => updateState({ weekdays }), [updateState]);
  const setCustomDates = useCallback((customDates) => updateState({ customDates }), [updateState]);
  const setOnceDate = useCallback((onceDate) => updateState({ onceDate }), [updateState]);
  const setAdvanced = useCallback((advanced) => updateState({ advanced }), [updateState]);
  // Legacy setters (for backward compatibility)
  const setFrequency = useCallback((frequency) => updateState({ frequency }), [updateState]);
  const setMinute = useCallback((minute) => updateState({ minute }), [updateState]);
  const setHour = useCallback((hour) => updateState({ hour }), [updateState]);
  const setDayOfWeek = useCallback((dayOfWeek) => updateState({ dayOfWeek }), [updateState]);
  const setDayOfMonth = useCallback((dayOfMonth) => updateState({ dayOfMonth }), [updateState]);
  const setTimezone = useCallback((timezone) => updateState({ timezone }), [updateState]);
  const setMethod = useCallback((method) => updateState({ method }), [updateState]);
  const setExpectedSchema = useCallback((expectedSchema) => updateState({ expectedSchema }), [updateState]);
  const setResponseType = useCallback((responseType) => updateState({ responseType }), [updateState]);
  const setResponseStatus = useCallback((responseStatus) => updateState({ responseStatus }), [updateState]);
  const setResponseBody = useCallback((responseBody) => updateState({ responseBody }), [updateState]);
  const setVerifySignature = useCallback((verifySignature) => updateState({ verifySignature }), [updateState]);
  const setSignatureHeader = useCallback((signatureHeader) => updateState({ signatureHeader }), [updateState]);
  const setSignatureSecret = useCallback((signatureSecret) => updateState({ signatureSecret }), [updateState]);
  const setFormConnection = useCallback((formConnection) => updateState({ formConnection, formId: formConnection?.id }), [updateState]);
  const setSheetConnection = useCallback((sheetConnection) => updateState({ sheetConnection, sheetId: sheetConnection?.id }), [updateState]);
  const setSheetEventTypes = useCallback((sheetEventTypes) => updateState({ sheetEventTypes }), [updateState]);
  const toggleSheetEventType = useCallback((eventId) => {
    setState((prev) => {
      const current = prev.sheetEventTypes || [];
      const next = current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId];
      return { ...prev, sheetEventTypes: next };
    });
  }, []);
  const setSheetEvent = useCallback((sheetEvent) => updateState({ sheetEventTypes: sheetEvent ? [sheetEvent] : [] }), [updateState]);
  const setColumnFilter = useCallback((columnFilter) => updateState({ columnFilter }), [updateState]);
  const setSelectedColumns = useCallback((selectedColumns) => updateState({ selectedColumns }), [updateState]);
  const setFormEvent = useCallback((formEvent) => updateState({ formEvent }), [updateState]);
  const setDateColumn = useCallback((dateColumn) => updateState({ dateColumn }), [updateState]);
  const setTimingRules = useCallback((timingRules) => updateState({ timingRules }), [updateState]);
  const setStreamId = useCallback((streamId) => updateState({ streamId }), [updateState]);
  const setDateOffset = useCallback((dateOffset) => updateState({ dateOffset }), [updateState]);
  const setDateOffsetUnit = useCallback((dateOffsetUnit) => updateState({ dateOffsetUnit }), [updateState]);
  const setDateOffsetDirection = useCallback((dateOffsetDirection) => updateState({ dateOffsetDirection }), [updateState]);
  const setIntegration = useCallback((integration) => updateState({ integration, integrationEvent: null, integrationEventData: null }), [updateState]);
  const setIntegrationEvent = useCallback((integrationEvent) => updateState({ integrationEvent }), [updateState]);
  const setIntegrationConnection = useCallback((integrationConnection) => updateState({ integrationConnection }), [updateState]);
  const setIntegrationEventData = useCallback((integrationEventData) => updateState({ integrationEventData }), [updateState]);
  const setIntegrationConfigureData = useCallback((valueOrUpdater) => {
    setState((prev) => {
      const next = typeof valueOrUpdater === "function"
        ? valueOrUpdater(prev.integrationConfigureData)
        : valueOrUpdater;
      return { ...prev, integrationConfigureData: next };
    });
  }, []);
  const setInputSchema = useCallback((inputSchema) => updateState({ inputSchema }), [updateState]);
  const setOutputSchema = useCallback((outputSchema) => updateState({ outputSchema }), [updateState]);
  const setLastActiveTab = useCallback((lastActiveTab) => updateState({ lastActiveTab }), [updateState]);

  const validation = useMemo(() => {
    const errors = [];

    if (!state.triggerType) {
      errors.push("Please select a trigger type");
      return { isValid: false, errors };
    }

    switch (state.triggerType) {
      case TRIGGER_TYPES.TIME_BASED: {
        // Match TimeBasedTriggerV2 validateData exactly
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (!state.scheduleType) errors.push("Schedule type is required");
        if (!state.timezone) errors.push("Timezone is required");
        
        if (state.scheduleType === "interval") {
          if (!state.interval?.value || state.interval.value <= 0) {
            errors.push("Please enter a positive interval");
          }
        }
        if (state.scheduleType === "weekly") {
          if (!state.weekdays || state.weekdays.length === 0) {
            errors.push("Please select at least one day");
          }
        }
        if (state.scheduleType === "once") {
          if (!state.onceDate) {
            errors.push("Please select a date for the one-time run");
          } else if (new Date(state.onceDate) < todayStart) {
            errors.push("The selected date is in the past");
          }
        }
        if (state.scheduleType === "custom") {
          if (!state.customDates || state.customDates.length === 0) {
            errors.push("Please select at least one date");
          } else {
            const futureDates = state.customDates.filter(d => new Date(d) >= todayStart);
            if (futureDates.length === 0) {
              errors.push("All selected dates are in the past");
            }
          }
        }
        
        // Date range ordering validation
        if (state.advanced?.startDate && state.advanced?.endDate) {
          if (new Date(state.advanced.endDate) < new Date(state.advanced.startDate)) {
            errors.push("End date cannot be before start date");
          }
        }
        break;
      }
      case TRIGGER_TYPES.WEBHOOK:
        if (!(state.webhookData?.webhook_url || state.webhookUrl)) {
          errors.push("Please generate or provide a webhook URL");
        }
        if (!state.webhookName?.trim()) {
          errors.push("Webhook name is required");
        }
        break;
      case TRIGGER_TYPES.FORM:
        if (!state.formConnection) errors.push("Please connect a form");
        if (!state.formEvent) errors.push("Please select when to trigger");
        break;
      case TRIGGER_TYPES.SHEET:
        if (!state.sheetConnection) errors.push("Please connect a sheet");
        if (!Array.isArray(state.sheetEventTypes) || state.sheetEventTypes.length === 0) {
          errors.push("Please select at least one event type");
        }
        if (state.sheetEventTypes?.includes("row_updated") && state.columnFilter === "specific" && (!state.selectedColumns || state.selectedColumns.length === 0)) {
          errors.push("Please select at least one column to watch");
        }
        break;
      case TRIGGER_TYPES.DATE_FIELD:
        if (!state.sheetConnection) errors.push("Please connect a sheet");
        if (!state.dateColumn) errors.push("Please select a date column");
        if (!Array.isArray(state.timingRules) || state.timingRules.length === 0) {
          errors.push("At least one timing rule is required");
        } else {
          state.timingRules.forEach((rule, i) => {
            if (rule.timing !== "EXACT" && (!rule.offsetValue || rule.offsetValue < 1)) {
              errors.push(`Rule ${i + 1}: Offset value must be at least 1`);
            }
          });
        }
        break;
      case TRIGGER_TYPES.APP_BASED:
        if (!state.integration) errors.push("Please select an integration");
        if (!state.integrationEvent) errors.push("Please select a trigger event");
        break;
      default:
        break;
    }

    return { isValid: errors.length === 0, errors };
  }, [state]);

  const getData = useCallback(() => {
    // Return legacy-shaped goData per trigger type (same structure as legacy trigger Configure getData)

    // Manual: legacy StartNode returns { inputs }; new flow has no inputs grid, use empty object
    if (state.triggerType === TRIGGER_TYPES.MANUAL) {
      const goData = {};
      console.log("[TriggerSetup getData] MANUAL goData", { goDataKeys: Object.keys(goData) });
      return goData;
    }

    // Form trigger: legacy shape (form, event, activeNode) for backend
    if (state.triggerType === TRIGGER_TYPES.FORM) {
      const fc = state.formConnection;
      const form = fc
        ? {
            asset_id: fc.asset_id || fc._id || fc.id,
            type: fc.type,
            annotation: fc.annotation,
            name: fc.name || fc.title,
          }
        : undefined;
      const event = state.formEvent && FORM_EVENTS_LEGACY[state.formEvent]
        ? FORM_EVENTS_LEGACY[state.formEvent]
        : FORM_EVENTS_LEGACY.submit;
      // Match legacy: activeNode is { [nodeId]: fullFlowNode }. Populated when form is selected and fields were fetched with _raw.
      const activeNode = (fc?.fields || []).reduce((acc, field) => {
        if (field._raw) {
          const raw = field._raw;
          acc[field.id] = raw.id != null ? raw : { ...raw, id: field.id, _id: field.id };
        }
        return acc;
      }, {});
      const goData = { form, event, activeNode };
      console.log("[TriggerSetup getData] FORM goData", {
        hasForm: !!form,
        formKeys: form ? Object.keys(form) : [],
        eventId: event?.id,
        activeNodeCount: Object.keys(activeNode).length,
      });
      return goData;
    }

    // Time-based: legacy TimeBasedTriggerV2 shape (schedule config + runScenario, minutes, startDate, endDate, summary + schedule for legacy summary)
    if (state.triggerType === TRIGGER_TYPES.TIME_BASED) {
      const legacyRunScenario = state.scheduleType === "interval"
        ? "AT_REGULAR_INTERVALS"
        : (state.scheduleType || "interval").toUpperCase();
      const summary = state.scheduleType ? generateScheduleSummary({
        scheduleType: state.scheduleType,
        interval: state.interval,
        time: state.time,
        timezone: state.timezone,
        weekdays: state.weekdays,
        dayOfMonth: state.dayOfMonth,
        customDates: state.customDates,
        onceDate: state.onceDate,
        advanced: state.advanced,
      }) : "";
      const goData = {
        scheduleType: state.scheduleType,
        interval: state.interval,
        time: state.time,
        timezone: state.timezone,
        weekdays: state.weekdays,
        dayOfMonth: state.dayOfMonth,
        customDates: state.customDates,
        onceDate: state.onceDate,
        advanced: state.advanced,
        runScenario: legacyRunScenario,
        minutes: state.interval?.value ?? 15,
        startDate: state.advanced?.startDate ?? null,
        endDate: state.advanced?.endDate ?? null,
        summary,
        schedule: {
          type: state.scheduleType,
          interval: state.interval,
          daily: state.scheduleType === "daily" ? { time: state.time } : undefined,
          weekly: state.scheduleType === "weekly" ? { days: state.weekdays } : undefined,
          timezone: state.timezone,
          enabled: true,
        },
      };
      console.log("[TriggerSetup getData] TIME_BASED goData", {
        runScenario: goData.runScenario,
        scheduleType: goData.scheduleType,
      });
      return goData;
    }

    // Webhook: legacy shape only (label, allowed_ips string, webhookData, inputs)
    if (state.triggerType === TRIGGER_TYPES.WEBHOOK) {
      const hasApiWebhookData = state.webhookData && (state.webhookData.uuid != null || state.webhookData.webhook_url != null);
      const webhookData = hasApiWebhookData ? state.webhookData : {};
      const allowedIpsRaw = state.allowed_ips;
      const allowed_ips =
        typeof allowedIpsRaw === "string"
          ? allowedIpsRaw
          : Array.isArray(allowedIpsRaw)
            ? allowedIpsRaw.join(", ")
            : "";
      const goData = {
        label: state.webhookName ?? "My webhook",
        allowed_ips,
        webhookData,
        inputs: state.inputs ?? [],
      };
      console.log("[TriggerSetup getData] WEBHOOK goData", {
        hasApiResult: hasApiWebhookData,
        label: goData.label,
        inputsLength: goData.inputs?.length,
      });
      return goData;
    }

    // Sheet trigger: legacy shape (asset, subSheet, eventType, fields, table, event for summary) + streamId
    if (state.triggerType === TRIGGER_TYPES.SHEET) {
      const sc = state.sheetConnection;
      const subSheet = sc?.table ?? sc?.subSheet ?? null;
      const sheetEventLabels = { row_created: "Row Created", row_updated: "Row Updated", row_deleted: "Row Deleted" };
      const eventTypes = Array.isArray(state.sheetEventTypes) ? state.sheetEventTypes : [];
      const eventName = eventTypes.length === 0
        ? undefined
        : eventTypes.length === 1
          ? (sheetEventLabels[eventTypes[0]] ?? eventTypes[0])
          : eventTypes.map((e) => sheetEventLabels[e] ?? e).join(", ");
      const goData = {
        asset: sc?.sheet ?? sc?.asset ?? null,
        subSheet,
        eventType: eventTypes,
        fields: sc?.table?.fields ?? sc?.fields ?? null,
        columnFilter: state.columnFilter,
        selectedColumns: state.selectedColumns,
        table: subSheet,
        event: eventName ? { name: eventName } : undefined,
        streamId: state.streamId ?? undefined,
      };
      console.log("[TriggerSetup getData] SHEET goData", {
        hasAsset: !!goData.asset,
        hasSubSheet: !!goData.subSheet,
        eventType: goData.eventType,
        streamId: goData.streamId,
      });
      return goData;
    }

    // Date-field trigger: legacy shape (asset, subSheet, dateField, timingRules, fields)
    if (state.triggerType === TRIGGER_TYPES.DATE_FIELD) {
      const sc = state.sheetConnection;
      const dateColumnId = typeof state.dateColumn === "object" && state.dateColumn !== null
        ? (state.dateColumn.id ?? state.dateColumn.key)
        : state.dateColumn;
      const dateField =
        typeof state.dateColumn === "object" && state.dateColumn !== null
          ? state.dateColumn
          : dateColumnId && sc?.columns?.length
            ? sc.columns.find((c) => (c.id ?? c.key) === dateColumnId) ?? dateColumnId
            : dateColumnId;
      const goData = {
        asset: sc?.sheet ?? sc?.asset ?? null,
        subSheet: sc?.table ?? sc?.subSheet ?? null,
        dateField: dateField ?? state.dateColumn,
        timingRules: Array.isArray(state.timingRules) && state.timingRules.length > 0
          ? state.timingRules
          : [createDefaultTimingRule({ index: 0 })],
        fields: sc?.table?.fields ?? sc?.fields ?? null,
        streamId: state.streamId ?? undefined,
      };
      console.log("[TriggerSetup getData] DATE_FIELD goData", {
        hasAsset: !!goData.asset,
        dateField: goData.dateField,
        timingRulesCount: goData.timingRules?.length,
        streamId: goData.streamId,
      });
      return goData;
    }

    // App-based / Integration: return both new shape and legacy-compatible shape for publish/run
    if (state.triggerType === TRIGGER_TYPES.APP_BASED || state.triggerType === INTEGRATION_TYPE) {
      const cfg = state.integrationConfigureData;
      const eventData = state.integrationEventData;
      const legacyFlowMeta = {
        asset_id: eventData?.publishResult?.asset_id ?? eventData?.asset_id,
        project_id: eventData?.publishResult?.project_id ?? eventData?.project_id,
        id: eventData?.publishResult?._id ?? eventData?.publishResult?.id ?? eventData?._id ?? eventData?.id,
      };
      const flowFromCfg =
        cfg?.flow != null && typeof cfg.flow === "object"
          ? { ...cfg.flow, ...legacyFlowMeta }
          : eventData != null
            ? { ...eventData, ...legacyFlowMeta }
            : undefined;
      const goData = {
        // New shape (for reopening and UI)
        integration: state.integration,
        integrationEvent: state.integrationEvent,
        integrationConnection: state.integrationConnection,
        integrationEventData: state.integrationEventData,
        integrationConfigureData: state.integrationConfigureData,
        // Legacy-compatible shape (setupData, connection, flow, state, configs) for publish/run/backend
        ...(state.integration?._id && state.integrationEvent?._id && {
          setupData: {
            integration_id: state.integration._id,
            event_id: state.integrationEvent._id,
          },
        }),
        ...(state.integrationConnection && { connection: state.integrationConnection }),
        ...(cfg?.state != null && { state: cfg.state }),
        ...(flowFromCfg != null && { flow: flowFromCfg }),
        ...(cfg?.configs != null && { configs: cfg.configs }),
      };
      if (cfg?.state == null && state.integration && state.integrationEvent) {
        goData.state = goData.state ?? {};
      }
      console.log("[TriggerSetup getData] APP_BASED goData", {
        hasIntegration: !!state.integration,
        hasEvent: !!state.integrationEvent,
        hasConfigureData: !!cfg,
        legacySetupData: goData.setupData,
        flowKeys: goData.flow ? Object.keys(goData.flow) : [],
      });
      return goData;
    }

    // Fallback: no trigger type selected yet, return empty so we don't persist noise
    console.log("[TriggerSetup getData] FALLBACK", { message: "no trigger type, returning {}" });
    return {};
  }, [state]);

  const getError = useCallback(() => {
    return validation.isValid ? null : { messages: validation.errors };
  }, [validation]);

  return {
    ...state,
    hasInitialised,
    validation,
    updateState,
    setTriggerType,
    selectTemplate,
    startFromScratch,
    // Enhanced schedule setters
    setScheduleType,
    setInterval,
    setTime,
    setWeekdays,
    setCustomDates,
    setOnceDate,
    setAdvanced,
    // Legacy setters
    setFrequency,
    setMinute,
    setHour,
    setDayOfWeek,
    setDayOfMonth,
    setTimezone,
    setMethod,
    setExpectedSchema,
    setResponseType,
    setResponseStatus,
    setResponseBody,
    setVerifySignature,
    setSignatureHeader,
    setSignatureSecret,
    setFormConnection,
    setSheetConnection,
    setSheetEventTypes,
    toggleSheetEventType,
    setSheetEvent,
    setColumnFilter,
    setSelectedColumns,
    setFormEvent,
    setDateColumn,
    setDateOffset,
    setDateOffsetUnit,
    setDateOffsetDirection,
    setIntegration,
    setIntegrationEvent,
    setIntegrationConnection,
    setIntegrationEventData,
    setIntegrationConfigureData,
    setInputSchema,
    setOutputSchema,
    setLastActiveTab,
    setTimingRules,
    setStreamId,
    getData,
    getError,
  };
};

export default useTriggerSetupState;
