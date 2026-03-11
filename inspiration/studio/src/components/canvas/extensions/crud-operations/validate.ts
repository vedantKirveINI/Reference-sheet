import {
  registerValidator,
  createValidationResult,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

const hasFxContent = (fxValue: any): boolean => {
  if (!fxValue) return false;
  if (typeof fxValue === 'string') return fxValue.trim().length > 0;
  if (fxValue.blocks && fxValue.blocks.length > 0) {
    return fxValue.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  }
  if (fxValue.text && fxValue.text.trim().length > 0) return true;
  if (fxValue.blockStr && fxValue.blockStr.trim().length > 0) return true;
  return false;
};

const hasConnection = (goData: Record<string, any>, tfData: Record<string, any>): boolean => {
  return !!(goData.connection || goData.connectionId || tfData.connection || tfData.connectionId);
};

const hasTable = (goData: Record<string, any>, tfData: Record<string, any>): boolean => {
  return !!(goData.table || goData.collection || tfData.table || tfData.collection);
};

const hasFilter = (goData: Record<string, any>, tfData: Record<string, any>): boolean => {
  return !!(goData.filter || goData.where || goData.recordId || tfData.filter || tfData.where || tfData.recordId);
};

const hasRecordInputs = (goData: Record<string, any>, tfData: Record<string, any>): boolean => {
  const record = goData.record || tfData.record || goData.inputs || tfData.inputs;
  if (!record) return false;
  if (Array.isArray(record)) return record.length > 0;
  if (typeof record === 'object') return Object.keys(record).length > 0;
  return false;
};

function validateCreateRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to create records'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to insert records into'));
  }

  if (!hasRecordInputs(goData, tfData)) {
    issues.push(recommended('record', 'Field values', 'Map fields to values for the new record'));
  }

  return createValidationResult(issues);
}

function validateReadRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to read records'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to read from'));
  }

  return createValidationResult(issues);
}

function validateUpdateRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to update records'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to update'));
  }

  if (!hasFilter(goData, tfData)) {
    issues.push(recommended('filter', 'Filter/Where condition', 'Add a filter to specify which records to update'));
  }

  if (!hasRecordInputs(goData, tfData)) {
    issues.push(recommended('record', 'Field updates', 'Choose at least one field to update'));
  }

  return createValidationResult(issues);
}

function validateDeleteRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to delete records'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to delete from'));
  }

  if (!hasFilter(goData, tfData)) {
    issues.push(required('filter', 'Filter/Where condition', 'Specify which records to delete to avoid removing all data'));
  }

  return createValidationResult(issues);
}

function validateExecuteQuery(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to run queries'));
  }

  const query = goData.query || goData.sql || tfData.query || tfData.sql;
  if (!hasFxContent(query)) {
    issues.push(required('query', 'Query', 'Write the SQL or database query to execute'));
  }

  return createValidationResult(issues);
}

function validateFindAll(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to search records'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to search'));
  }

  if (!hasFilter(goData, tfData)) {
    issues.push(recommended('filter', 'Filter/Where condition', 'Add filters to narrow down results, or all records will be returned'));
  }

  return createValidationResult(issues);
}

function validateFindOne(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  if (!hasConnection(goData, tfData)) {
    issues.push(required('connection', 'Connection', 'Connect to a database to find a record'));
  }

  if (!hasTable(goData, tfData)) {
    issues.push(required('table', 'Table/Collection', 'Select which table or collection to search'));
  }

  if (!hasFilter(goData, tfData)) {
    issues.push(recommended('filter', 'Filter/Where condition', 'Add a filter to identify the specific record to find'));
  }

  return createValidationResult(issues);
}

registerValidator('Create Record', validateCreateRecord);
registerValidator('CREATE_RECORD_V2', validateCreateRecord);
registerValidator('Read Record', validateReadRecord);
registerValidator('Update Record', validateUpdateRecord);
registerValidator('UPDATE_RECORD_V2', validateUpdateRecord);
registerValidator('Delete Record', validateDeleteRecord);
registerValidator('DELETE_RECORD_V2', validateDeleteRecord);
registerValidator('Execute Query', validateExecuteQuery);
registerValidator('EXECUTE_QUERY_V2', validateExecuteQuery);
registerValidator('DB_FIND_ALL', validateFindAll);
registerValidator('DB_FIND_ALL_V2', validateFindAll);
registerValidator('DB_FIND_ONE', validateFindOne);
registerValidator('DB_FIND_ONE_V2', validateFindOne);
