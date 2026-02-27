import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BadRequestException, Inject } from '@nestjs/common';
import { LoDashStatic } from 'lodash';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { DropdownStaticFieldProcessor } from './fieldProcessor/dropdownstatic.processor';
import { SCQFieldProcessor } from './fieldProcessor/scq.processor';
import { MCQFieldProcessor } from './fieldProcessor/mcq.processor';
import { AddressFieldProcessor } from './fieldProcessor/address.processor';
import { DropdownFieldProcessor } from './fieldProcessor/dropdown.processor';
import { escapeSqlValue } from './sql.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

export class RecordUtils {
  constructor(
    @Inject('Lodash') private readonly lodash: LoDashStatic,
    private emitter: EventEmitterService,
    @Inject('ShortUUID') private readonly shortUUID: any,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      {
        name: 'record_utils.generate_drop_trigger_function_sql',
        handler: this.generateDropTriggerFunctionSQL,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  static collectFilteredColumns(filter: any): (string | number)[] {
    const fields: (string | number)[] = [];

    // Helper function to recursively collect field values
    const collect = (child: any) => {
      if (child.field !== undefined) {
        fields.push(child.field);
      }

      if (child.childs && Array.isArray(child.childs)) {
        for (const nestedChild of child.childs) {
          collect(nestedChild);
        }
      }
    };

    // Start collecting field values from the root filter
    collect(filter);

    return fields;
  }

  getDateWhereQuery({
    key: columnName,
    operator,
    value,
  }: {
    key: string;
    operator: { key: string; value: any };
    value: string;
  }): string {
    const { key: operator_key } = operator;
    let where_query = '';

    // Handle "is empty" and "is not empty" operators early, before date parsing
    if (operator_key === `=''`) {
      return `"${columnName}" IS NULL`;
    } else if (operator_key === `<>''`) {
      return `"${columnName}" IS NOT NULL`;
    }

    // Handle null, undefined, or empty string values gracefully
    // (but only for operators that require a value)
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Assume value format is 'dd/mm/yyyy' and timeZone is Asia/Kolkata
    const timeZone = 'Asia/Kolkata';
    const parsedDate = dayjs(value, 'DD/MM/YYYY').tz(timeZone);

    // Check if parsedDate is valid
    if (!parsedDate.isValid() && ![`=''`, `<>''`].includes(operator_key)) {
      throw new BadRequestException('Invalid Filter for Date');
    }

    // Define start and end of day in UTC
    const startOfDayUTC = parsedDate
      .startOf('day')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    const endOfDayUTC = parsedDate
      .endOf('day')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    if (operator_key === '=') {
      where_query = `"${columnName}" >= '${startOfDayUTC}' AND "${columnName}" <= '${endOfDayUTC}'`;
    } else if (operator_key === '>') {
      // For dates after the specified date (starting from end of that day)
      where_query = `"${columnName}" ${operator_key} '${endOfDayUTC}'`;
    } else if (operator_key === '<') {
      // For dates before the specified date (ending at the start of that day)
      where_query = `"${columnName}" ${operator_key} '${startOfDayUTC}'`;
    } else if (operator_key === '>=') {
      // For dates on or after the specified date (starting from start of that day)
      where_query = `"${columnName}" ${operator_key} '${startOfDayUTC}'`;
    } else if (operator_key === '<=') {
      // For dates on or before the specified date (ending at end of that day)
      where_query = `"${columnName}" ${operator_key} '${endOfDayUTC}'`;
    }

    return where_query;
  }

  getSortFieldIds({
    sorting,
    field_ids_mapping,
  }: {
    sorting;
    field_ids_mapping: Record<number, any>;
  }) {
    const { sortObjs } = sorting;

    sortObjs.forEach(({ fieldId }) => {
      field_ids_mapping[fieldId] = '';
    });
  }

  // Function to extract all field IDs and update the field_ids_mapping object
  getFilterFieldIds({ filter, field_ids_mapping }) {
    function traverseNode(node: any) {
      if ('field' in node && typeof node.field === 'number') {
        // LeafNodeSchema: Add the field to the mapping
        field_ids_mapping[node.field] = ''; // or assign a specific value if needed
      } else if ('childs' in node && Array.isArray(node.childs)) {
        // GroupNodeSchema: Recursively traverse its childs
        node.childs.forEach(traverseNode);
      }
    }

    if (filter && filter.childs) {
      filter.childs.forEach(traverseNode);
    }
  }

  createFieldIdToFieldMap({ fields }): Record<number, any> {
    return fields.reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {});
  }

  generateDropDownFilterQuery({ key: columnName, operator, value }) {
    const { key: symbol, value: operator_value } = operator;

    // Convert single string value to an array if necessary
    const valueArray = Array.isArray(value) ? value : [value];

    // Escape column name for SQL query
    const columnNameEscaped = `"${columnName}"`;

    // Convert value array to SQL array literal with proper escaping
    const sqlArrayLiteral = `ARRAY[${valueArray
      .map((val) => {
        // Escape each value properly
        const escapedVal = escapeSqlValue(val);
        return `'${escapedVal}'`;
      })
      .join(', ')}]`;

    let filterQuery = '';

    switch (symbol) {
      case '&': // 'has all of'
        filterQuery = `
                NOT EXISTS (
                    SELECT 1
                    FROM unnest(${sqlArrayLiteral}) AS required_label
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(${columnNameEscaped}) AS elem
                        WHERE elem ->> 'label' = required_label
                    )
                )
            `;
        break;

      case '|': // 'has any of'
        filterQuery = `
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(${columnNameEscaped}) AS elem
                    WHERE elem ->> 'label' = ANY (${sqlArrayLiteral})
                )
            `;
        break;

      case '!': // 'has none of'
        filterQuery = `
                NOT EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(${columnNameEscaped}) AS elem
                    WHERE elem ->> 'label' = ANY (${sqlArrayLiteral})
                )
            `;
        break;

      case '==': // 'is exactly'
        filterQuery = `
                (
                    SELECT COUNT(DISTINCT elem ->> 'label')
                    FROM jsonb_array_elements(${columnNameEscaped}) AS elem
                    WHERE elem ->> 'label' = ANY (${sqlArrayLiteral})
                ) = ${valueArray.length}
                AND NOT EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(${columnNameEscaped}) AS elem
                    WHERE elem ->> 'label' <> ALL (${sqlArrayLiteral})
                )
            `;
        break;

      case '[]': // 'is empty'
        filterQuery = `
                ${columnNameEscaped} IS NULL OR jsonb_array_length(${columnNameEscaped}) = 0
            `;
        break;

      case '[*]': // 'is not empty'
        filterQuery = `
                ${columnNameEscaped} IS NOT NULL AND jsonb_array_length(${columnNameEscaped}) > 0
            `;
        break;

      default:
        throw new BadRequestException(`Invalid symbol: ${symbol}`);
    }

    return filterQuery.trim();
  }

  getArrayOfObjectWhereQuery({ key, operator, value }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    // Escape the formatted value to handle special characters in JSON
    const formatted_value = escapeSqlValue(JSON.stringify(value));

    if (['@>'].includes(operator_key)) {
      let query = '';

      value.forEach((val: any, index: number) => {
        // Escape each individual object value
        const new_val = escapeSqlValue(JSON.stringify(val));
        if (index > 0) {
          query += ` OR `;
        }
        query += `"${key}" ${operator_key} '[${new_val}]'::jsonb `;
      });

      if (operator_value.includes('none')) {
        where_query = `NOT (${query})`; // has none of
      } else if (operator_value.includes('any')) {
        where_query = `(${query})`; // has any of
      } else {
        where_query = `"${key}" ${operator_key} '${formatted_value}'::jsonb`; // has all of
      }
    } else if (['='].includes(operator_key)) {
      if (operator_value.includes('empty')) {
        where_query = `"${key}" = '[]'::jsonb`; // is empty
      } else {
        return (where_query = `"${key}" = '${formatted_value}'::jsonb`); // is exactly
      }
    } else if (['>'].includes(operator_key)) {
      where_query = `jsonb_array_length("${key}") ${operator_key} 0`; // is not empty
    }

    return where_query;
  }

  getArrayOfStringWhereQuery({ key, operator, value }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    if (operator_key === '?|') {
      const value_array = Array.isArray(value) ? value : [value];

      // Escape each string value in the array
      const escapedValues = value_array?.map((v: any) => {
        const escapedVal = escapeSqlValue(v);
        return `'${escapedVal}'`;
      });

      const formatted_value = `array[${escapedValues?.join(', ')}]`;

      if (operator_value.includes('none')) {
        return (where_query = `NOT ("${key}" ${operator_key} ${formatted_value}) OR jsonb_array_length("${key}") = 0 OR "${key}" IS NULL`); //has none of
      } else {
        return (where_query = `"${key}" ${operator_key} ${formatted_value}`); //has any of
      }
    } else if (['@>'].includes(operator_key)) {
      // Escape the JSON array value
      const val = escapeSqlValue(this.convertToArrayWithDoubleQuotes(value));
      return (where_query = `"${key}" ${operator_key} '${val}'::jsonb`); //has all of
    } else if (
      ['='].includes(operator_key) &&
      operator_value.includes('exactly')
    ) {
      // Escape the JSON array value
      const val = escapeSqlValue(this.convertToArrayWithDoubleQuotes(value));
      return (where_query = `"${key}" ${operator_key} '${val}'::jsonb`); // is exactly
    } else if (
      ['='].includes(operator_key) &&
      operator_value.includes('is empty')
    ) {
      return (where_query = `jsonb_array_length("${key}") ${operator_key} 0 OR "${key}" IS NULL`); //is empty
    } else {
      return (where_query = `jsonb_array_length("${key}") ${operator_key} 0`); // is not empty
    }
  }

  getObjectWhereQuery({ key, operator, val, jsonPath }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    const formated_key = this.lodash.upperCase(operator_key);

    if ([`=''`].includes(operator_key)) {
      where_query += `"${key}"->>'${jsonPath}' IS NULL `;
    } else if ([`!=''`].includes(operator_key)) {
      where_query += `"${key}"->>'${jsonPath}' IS NOT NULL `;
    } else if (operator_key === 'ilike') {
      where_query += `"${key}"->>'${jsonPath}' ${formated_key} ${val} `;
    } else if (operator_key === 'not_ilike') {
      where_query += `"${key}"->>'${jsonPath}' ${formated_key} ${val} `;
    } else {
      where_query += `"${key}"->>'${jsonPath}' ${operator_key} ${val} `;
    }
    return where_query;
  }

  getNumberWhereQuery({ key, operator, val }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    if ([`is_null`, `is_not_null`].includes(operator_key)) {
      const formated_key = this.lodash.upperCase(operator_key);
      where_query += `"${key}" ${formated_key}`;
    } else if (operator_key === 'is_empty' || operator_key === `=''`) {
      where_query += `"${key}" IS NULL`;
    } else if (operator_key === 'is_not_empty' || operator_key === `!=''`) {
      where_query += `"${key}" IS NOT NULL`;
    } else {
      if (val === null || val === undefined || val === '') {
        return '';
      }

      const numericVal = parseFloat(val);
      if (isNaN(numericVal)) {
        throw new BadRequestException(
          `Invalid value for numeric field, ${val} is not a valid number`,
        );
      }

      const sqlOp = this.mapNumericOperator(operator_key);
      where_query += `"${key}" ${sqlOp} ${numericVal}`;
    }

    return where_query;
  }

  private mapNumericOperator(operatorKey: string): string {
    const mapping: Record<string, string> = {
      'equals': '=',
      '=': '=',
      'not_equals': '!=',
      '!=': '!=',
      'greater_than': '>',
      '>': '>',
      'less_than': '<',
      '<': '<',
      'greater_than_or_equal': '>=',
      '>=': '>=',
      'less_than_or_equal': '<=',
      '<=': '<=',
    };
    return mapping[operatorKey] || operatorKey;
  }

  getStringWhereQuery({ key, operator, val }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    if (operator_key === `!=''` || operator_key === 'is_not_empty') {
      where_query += `"${key}" IS NOT NULL AND "${key}" != ''`;
    } else if (operator_key === `=''` || operator_key === 'is_empty') {
      where_query += `("${key}" IS NULL OR "${key}" = '')`;
    } else if (operator_key === 'contains' || operator_key === 'ilike') {
      const cleanVal = String(val).replace(/^'|'$/g, '');
      where_query += `"${key}" ILIKE '%${cleanVal}%'`;
    } else if (operator_key === 'does_not_contain' || operator_key === 'not_ilike') {
      const cleanVal = String(val).replace(/^'|'$/g, '');
      where_query += `"${key}" NOT ILIKE '%${cleanVal}%'`;
    } else if (operator_key === 'equals' || operator_key === 'is' || operator_key === '=') {
      where_query += `"${key}" = ${val}`;
    } else if (operator_key === 'not_equals' || operator_key === 'is_not' || operator_key === '!=') {
      where_query += `"${key}" != ${val}`;
    } else if (operator_key === 'starts_with') {
      const cleanVal = String(val).replace(/^'|'$/g, '');
      where_query += `"${key}" ILIKE '${cleanVal}%'`;
    } else if (operator_key === 'ends_with') {
      const cleanVal = String(val).replace(/^'|'$/g, '');
      where_query += `"${key}" ILIKE '%${cleanVal}'`;
    } else {
      where_query += `"${key}" ${operator_key} ${val}`;
    }

    return where_query;
  }

  convertToArrayWithDoubleQuotes(arr: any[]) {
    // Using JSON.stringify to convert array to JSON string
    return JSON.stringify(arr);
  }

  mapFieldsById(fields: any) {
    return fields.reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {});
  }

  getSchemaAndTable(dbName: string): { schemaName: string; tableName: string } {
    if (!dbName.includes('.')) {
      throw new BadRequestException(
        'Invalid database name format. Expected format: schema.table',
      );
    }

    const [schemaName, tableName] = dbName.split('.');

    return { schemaName, tableName };
  }

  async processAndUpdateFields({
    fields,
    fields_info,
    prisma,
    tableId,
    baseId,
    viewId,
  }): Promise<Record<string, any>> {
    const record_data: Record<string, any> = {};

    for (const field of fields) {
      const field_info = fields_info.find(
        (field_info: any) => field_info.field_id === field.id,
      );

      if (
        field_info &&
        field_info?.data !== undefined &&
        field_info?.data !== null
      ) {
        switch (field.type) {
          case 'DROP_DOWN':
            const dropdownProcessor = new DropdownFieldProcessor({
              field,
              fieldInfo: field_info,
              tableId,
              baseId,
              viewId,
              emitter: this.emitter,
              prisma: prisma,
              lodash: this.lodash,
            });

            await dropdownProcessor.process();
            field_info.data = dropdownProcessor.normalizedData;
            break;

          case 'DROP_DOWN_STATIC':
            // Create the processor instance for the DROP_DOWN_STATIC type
            const dropdownProcessorStatic = new DropdownStaticFieldProcessor({
              field,
              fieldInfo: field_info,
              tableId,
              baseId,
              viewId,
              emitter: this.emitter, // Assuming this.emitter is available in your context
              prisma: prisma,
              lodash: this.lodash,
            });

            // Call process to handle the field update
            await dropdownProcessorStatic.process(); // This will handle normalization, missing options, and updates

            // Access the result from the processor (updated field data)
            field_info.data = dropdownProcessorStatic.normalizedData;

            break;

          case 'SCQ':
            const scqProcessor = new SCQFieldProcessor({
              field,
              fieldInfo: field_info,
              tableId,
              baseId,
              viewId,
              emitter: this.emitter, // Assuming this.emitter is available in your context
              prisma: prisma,
              lodash: this.lodash,
            });

            // Call process to handle the field update
            await scqProcessor.process(); // This will handle normalization, missing options, and updates

            // Access the result from the processor (updated field data)
            field_info.data = scqProcessor.normalizedData;

            break;

          case 'MCQ':
            const mcqProcessor = new MCQFieldProcessor({
              field,
              fieldInfo: field_info,
              tableId,
              baseId,
              viewId,
              emitter: this.emitter, // Assuming this.emitter is available in your context
              prisma: prisma,
              lodash: this.lodash,
            });

            // Call process to handle the field update
            await mcqProcessor.process(); // This will handle normalization, missing options, and updates

            // Access the result from the processor (updated field data)
            field_info.data = mcqProcessor.normalizedData;

            break;

          case 'ADDRESS':
            const addressProcessor = new AddressFieldProcessor({
              field,
              fieldInfo: field_info,
              tableId,
              baseId,
              viewId,
              emitter: this.emitter,
              prisma: prisma,
              lodash: this.lodash,
            });

            // Call process to handle the field update
            await addressProcessor.process();

            // Access the result from the processor (updated field data)
            field_info.data = addressProcessor.normalizedData;
            break;

          default:
            // For all other field types, pass through the value as-is
            field_info.data = field_info.data;
            break;
        }

        record_data[field.dbFieldName] = field_info.data;
      }
    }

    return record_data;
  }

  getStringifyFieldsInfo({ fields_info }) {
    const stringifyFieldsInfo = fields_info.map((field) => {
      const { data } = field;

      if (typeof data === 'object') {
        return { ...field, data: JSON.stringify(data) };
      }
      return field;
    });

    return stringifyFieldsInfo;
  }

  generateNotifyTriggerFunctionSQL(params: {
    schema: string;
    column: string;
    field_id: number;
  }): { sql: string; functionName: string } {
    const { schema, column, field_id } = params;
    const functionName = `notify_${column}_change`;
    const channelName = `sheet_updates`; // Fixed channel

    const sql = `CREATE OR REPLACE FUNCTION "${schema}"."${functionName}"()
                RETURNS trigger
                LANGUAGE plpgsql
                AS $function$
                BEGIN

                    PERFORM pg_notify(
                    '${channelName}',
                    json_build_object(
                        'schema', TG_TABLE_SCHEMA,
                        'table', TG_TABLE_NAME,
                        'rowId', NEW.__id,
                        'column', '${column}',
                        'value', NEW."${column}",
                        'field_id', ${field_id}
                    )::text
                    );
                
                    RETURN NEW;
                END;
                $function$;
                `.trim();

    return { sql, functionName };
  }

  generateCreateTriggerSQL(params: {
    schema: string;
    table: string;
    columns: string[];
    triggerFunctionName: string;
  }): { triggerSQL: string; triggerName: string } {
    const { schema, table, columns, triggerFunctionName } = params;

    const formattedColumns = columns.map((col) => `"${col}"`).join(', ');
    const triggerName = `trigger_${triggerFunctionName}`;

    const triggerSQL = `
      CREATE TRIGGER ${triggerName}
      AFTER INSERT OR UPDATE OF ${formattedColumns}
      ON "${schema}"."${table}"
      FOR EACH ROW
      EXECUTE FUNCTION "${schema}"."${triggerFunctionName}"();
    `.trim();

    return {
      triggerSQL,
      triggerName,
    };
  }

  generateDropColumnSQL(params: {
    schema: string;
    table: string;
    column: string;
  }): string {
    const { schema, table, column } = params;
    return `ALTER TABLE "${schema}"."${table}" DROP COLUMN IF EXISTS "${column}";`;
  }

  generateDropTriggerSQL(params: {
    schema: string;
    table: string;
    triggerName: string;
  }): string {
    const { schema, table, triggerName } = params;
    return `DROP TRIGGER IF EXISTS "${triggerName}" ON "${schema}"."${table}";`;
  }

  generateDropTriggerFunctionSQL(params: {
    schema: string;
    triggerFunctionName: string;
  }): string {
    const { schema, triggerFunctionName } = params;
    return `DROP FUNCTION IF EXISTS "${schema}"."${triggerFunctionName}"() CASCADE;`;
  }
}
