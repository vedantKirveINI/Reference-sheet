import {
  registerValidator,
  createValidationResult,
  createIssue,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';
import {
  TRIGGER_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
  FORM_TRIGGER,
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  INTEGRATION_TYPE,
  INPUT_SETUP_TYPE,
} from '../constants/types';

const CONCRETE_TRIGGER_TYPES = new Set([
  TRIGGER_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
  FORM_TRIGGER,
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  INTEGRATION_TYPE,
  INPUT_SETUP_TYPE,
]);

function getEffectiveTriggerType(context: NodeValidationContext): string | null {
  const { nodeType, goData = {}, tfData = {} } = context;
  const fromGo = goData.triggerType || tfData.triggerType;
  if (fromGo) return fromGo;
  if (nodeType && CONCRETE_TRIGGER_TYPES.has(nodeType)) return nodeType;
  return null;
}

export function validateTriggerSetup(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const triggerType = getEffectiveTriggerType(context);
  if (!triggerType) {
    issues.push(recommended(
      'triggerType',
      'Trigger Type',
      'Select a trigger type to start your workflow'
    ));
    return createValidationResult(issues);
  }

  switch (triggerType) {
    case INPUT_SETUP_TYPE:
      // Manual: no extra required fields
      break;

    case TIME_BASED_TRIGGER: {
      const schedule = goData.schedule || {};
      const scheduleType = goData.scheduleType || schedule.type;
      if (!scheduleType) {
        issues.push(createIssue('scheduleType', 'Schedule type is required', 'error'));
      }
      if (!goData.timezone) {
        issues.push(createIssue('timezone', 'Timezone is required', 'error'));
      }
      if (scheduleType === 'interval') {
        const interval = goData.interval || schedule.interval;
        const value = interval?.value ?? goData.minutes;
        if (value == null || value <= 0) {
          issues.push(createIssue('interval', 'Please enter a positive interval', 'error'));
        }
      }
      if (scheduleType === 'weekly') {
        const weekdays = goData.weekdays || schedule?.days;
        if (!Array.isArray(weekdays) || weekdays.length === 0) {
          issues.push(createIssue('weekdays', 'Please select at least one day', 'error'));
        }
      }
      if (scheduleType === 'once') {
        const onceDate = goData.onceDate;
        if (!onceDate) {
          issues.push(createIssue('onceDate', 'Please select a date for the one-time run', 'error'));
        } else {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (new Date(onceDate) < todayStart) {
            issues.push(createIssue('onceDate', 'The selected date is in the past', 'error'));
          }
        }
      }
      if (scheduleType === 'custom') {
        const customDates = goData.customDates;
        if (!Array.isArray(customDates) || customDates.length === 0) {
          issues.push(createIssue('customDates', 'Please select at least one date', 'error'));
        } else {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const futureDates = customDates.filter((d: string) => new Date(d) >= todayStart);
          if (futureDates.length === 0) {
            issues.push(createIssue('customDates', 'All selected dates are in the past', 'error'));
          }
        }
      }
      const advanced = goData.advanced || {};
      const startDate = advanced.startDate ?? goData.startDate;
      const endDate = advanced.endDate ?? goData.endDate;
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        issues.push(createIssue('endDate', 'End date cannot be before start date', 'error'));
      }
      break;
    }

    case WEBHOOK_TYPE: {
      const webhookUrl = goData.webhookData?.webhook_url ?? goData.webhookUrl;
      if (!webhookUrl) {
        issues.push(createIssue('webhook', 'Please generate or provide a webhook URL', 'error'));
      }
      const label = goData.label ?? goData.webhookName ?? '';
      if (!label || typeof label !== 'string' || !label.trim()) {
        issues.push(createIssue('webhookName', 'Webhook name is required', 'error'));
      }
      break;
    }

    case FORM_TRIGGER:
      if (!goData.form) {
        issues.push(createIssue('form', 'Please connect a form', 'error'));
      }
      if (!goData.event) {
        issues.push(createIssue('event', 'Please select when to trigger', 'error'));
      }
      break;

    case SHEET_TRIGGER: {
      const asset = goData.asset;
      const subSheet = goData.subSheet ?? goData.table;
      if (!asset) {
        issues.push(createIssue('sheet', 'Please connect a sheet', 'error'));
      }
      if (!subSheet) {
        issues.push(createIssue('table', 'Please select a table', 'error'));
      }
      const eventType = goData.eventType;
      const eventList = Array.isArray(eventType) ? eventType : (eventType ? [eventType] : []);
      if (eventList.length === 0) {
        issues.push(createIssue('eventType', 'Please select an event type', 'error'));
      }
      if (eventList.includes('row_updated') && goData.columnFilter === 'specific') {
        const selectedColumns = goData.selectedColumns;
        if (!Array.isArray(selectedColumns) || selectedColumns.length === 0) {
          issues.push(createIssue('selectedColumns', 'Please select at least one column to watch', 'error'));
        }
      }
      break;
    }

    case SHEET_DATE_FIELD_TRIGGER: {
      const asset = goData.asset;
      const subSheet = goData.subSheet ?? goData.table;
      if (!asset) {
        issues.push(createIssue('sheet', 'Please connect a sheet', 'error'));
      }
      if (!subSheet) {
        issues.push(createIssue('table', 'Please select a table', 'error'));
      }
      if (!goData.dateField) {
        issues.push(createIssue('dateColumn', 'Please select a date column', 'error'));
      }
      const timingRules = goData.timingRules;
      if (!Array.isArray(timingRules) || timingRules.length === 0) {
        issues.push(createIssue('timingRules', 'At least one timing rule is required', 'error'));
      } else {
        timingRules.forEach((rule: { timing?: string; offsetValue?: number }, i: number) => {
          if (rule.timing !== 'EXACT' && (rule.offsetValue == null || rule.offsetValue < 1)) {
            issues.push(createIssue(`rule${i + 1}`, `Rule ${i + 1}: Offset value must be at least 1`, 'error'));
          }
        });
      }
      break;
    }

    case INTEGRATION_TYPE: {
      const hasIntegration = !!(goData.integration || goData.setupData?.integration_id);
      if (!hasIntegration) {
        issues.push(createIssue('integration', 'Please select an integration', 'error'));
      }
      const hasEvent = !!(goData.integrationEvent || goData.setupData?.event_id);
      if (!hasEvent) {
        issues.push(createIssue('integrationEvent', 'Please select a trigger event', 'error'));
      }
      break;
    }

    default:
      break;
  }

  return createValidationResult(issues);
}

registerValidator(TRIGGER_SETUP_TYPE, validateTriggerSetup);
registerValidator(SHEET_TRIGGER, validateTriggerSetup);
registerValidator(SHEET_DATE_FIELD_TRIGGER, validateTriggerSetup);
registerValidator(FORM_TRIGGER, validateTriggerSetup);
registerValidator(WEBHOOK_TYPE, validateTriggerSetup);
registerValidator(TIME_BASED_TRIGGER, validateTriggerSetup);
registerValidator(INTEGRATION_TYPE, validateTriggerSetup);
registerValidator(INPUT_SETUP_TYPE, validateTriggerSetup);
