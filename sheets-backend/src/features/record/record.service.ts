import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecordColumn } from './DTO/create-record-column.dto';
import { CreateMutliRecordColumnDTO } from './DTO/create-multi-record.dto';
import { field, Prisma, View } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { GetRecordPayloadDTO } from './DTO/get-record.dto';
import { UpdateFormRecordPayloadDTO } from './DTO/update-form-record.dto';
import { updateRecordColumnsDTO } from './DTO/update-record-columns.dto';
import { CreateRecordDTO } from './DTO/create-record.dto';
import {
  JSONB_KEY_FOR_SEARCHING,
  QUESTION_TYPE,
  TYPE_MAPPING,
  TYPE_VALUE_MAPPING,
  keys_with_data_type_jsonb,
} from '../field/DTO/mappings.dto';
import { UpdateRecordsDTO, ColumnValueDTO } from './DTO/update-records.dto';
import { GetRecordsPayloadDTO } from './DTO/get-records.dto';
import {
  UpdateRecordStatusDTO,
  UpdateRecordsStatusDTO,
} from './DTO/update-reocrds-status.dto';
import { LoDashStatic } from 'lodash';
import { UpdateRecordByFiltersDTO } from './DTO/update-records-by-filters.dto';
import { updateRowOrderDTO } from './DTO/update-row-order.dto';
import { GetCorrectRowOrderDTO } from './DTO/get-correct-row-order.dto';
import { CreateMultipleRecordsDTO } from './DTO/create-multiple-records.dto';
import { RenameColumnDto } from './DTO/rename-column.dto';
import { RecordUtils } from './utils/record.utils';
import { DateTimeUtils } from 'src/utils/DateTime';
import { AddressFilterBuilder } from './utils/filters/address-filter.builder';
import { PhoneNumberFilterBuilder } from './utils/filters/phoner-number-filter.builder';
import { FormulaRecalculatorService } from './utils/formula-recalculator.service';
import { MigrateFormulaFieldDataDTO } from './DTO/migrate-formula-field.dto';
import { UpdatedPayloadDTO } from './DTO/handle-formula-recalculation.dto';
import { DataConverter } from 'sheets-data-formatter';
import axios from 'axios';
import { GetEnrichedDataDTO } from './DTO/get-enriched-data.dto';
import { escapeSqlValue } from './utils/sql.utils';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import { IGroupPoint, IGroupByObject } from './types/group-by.types';
import { GroupBy } from '../view/DTO/update_group_by.dto';
import { GetGroupPointsPayloadDTO } from './DTO/get-group-points.dto';

@Injectable()
export class RecordService {
  private readonly logger: Logger;

  constructor(
    private emitter: EventEmitterService,
    @Inject('Lodash') private readonly lodash: LoDashStatic,
    @Inject('FlowUtilitySdk') private readonly flow_utility_sdk: any,
    @Inject('ShortUUID') private readonly shortUUID: any,
    private recordUtils: RecordUtils,
    private dateTimeUtils: DateTimeUtils,
    private readonly formulaRecalculator: FormulaRecalculatorService,
    private winstonLoggerService: WinstonLoggerService,
  ) {
    this.logger = this.winstonLoggerService.logger;
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      {
        name: 'record.create_record_column',
        handler: this.createRecordColumn,
      },
      { name: 'getRecords', handler: this.getRecords },
      { name: 'updateRecord', handler: this.updateRecord },
      { name: 'createRecord', handler: this.createRecord },
      {
        name: 'record.createMultipleRecordColumns',
        handler: this.createMultipleRecordColumns,
      },
      {
        name: 'record.updateRecordColumns',
        handler: this.updateRecordColumns,
      },
      {
        name: 'record.updateRecordsByFilters',
        handler: this.updateRecordsByFilters,
      },
      {
        name: 'record.updateRecordOrders',
        handler: this.updateRecordOrders,
      },
      { name: 'record.getRecord', handler: this.getRecord },
      {
        name: 'record.createMultipleRecords',
        handler: this.createMultipleRecords,
      },
      {
        name: 'record.getDeletedFieldName',
        handler: this.getDeletedFieldName,
      },
      {
        name: 'record.renameColumn',
        handler: this.renameColumn,
      },
      {
        name: 'record.createDuplicateRecords',
        handler: this.createDuplicateRecords,
      },
      {
        name: 'record.getRecordV2',
        handler: this.getRecordV2,
      },
      {
        name: 'record.getRecordSummary',
        handler: this.getRecordSummary,
      },
      {
        name: 'record.migrateFormulaFieldData',
        handler: this.migrateFormulaFieldData,
      },
      {
        name: 'record.processEnrichment',
        handler: this.processEnrichment,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async getRecords(
    getRecordPayload: GetRecordsPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    let view: any;

    const {
      tableId,
      baseId,
      __status = 'active',
      manual_filters,
      manual_sort,
      manual_group_by,
      state,
      should_stringify = false,
      is_field_required = true,
      viewId: view_id,
      limit = 20000,
      offset,
      version = 1,
      skip_filters = false,
      requiredFields,
    } = getRecordPayload;

    try {
      const view_array = await this.emitter.emitAsync(
        'view.getViewById',
        view_id,
        prisma,
      );

      view = view_array[0];
    } catch (error) {
      this.logger.error('Failed to fetch view in getRecords', { error });
      throw new BadRequestException('Failed to fetch view: ' + error);
    }

    if (!view) {
      throw new BadRequestException(`No view exist`);
    }

    const viewId: any = view.id;

    let dbName: string;

    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );

      dbName = result[0];
    } catch (error) {
      this.logger.error('Failed to fetch database name in getRecords', {
        error,
      });
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];
    const orderRowColumnName = `_row_view${viewId}`;

    const applied_filters = view.filter;
    const applied_sorting = view.sort;

    // Detect Kanban view and extract stack field ID
    const isKanbanView = view.type === 'kanban';
    console.log('isKanbanView-->', isKanbanView);

    // Parse view.options if it's a string, otherwise use as-is
    // Handle null/undefined and parsing errors gracefully
    let viewOptions: any = {};
    if (view.options) {
      console.log('view.options-->', view.options);
      if (typeof view.options === 'string') {
        try {
          viewOptions = JSON.parse(view.options || '{}');
        } catch (e) {
          // Parsing failed, treat as empty object
          viewOptions = {};
        }
      } else {
        viewOptions = view.options;
      }
    }

    // Extract and validate stackFieldId
    const stackFieldIdRaw = isKanbanView && viewOptions?.stackFieldId;
    const stackFieldId =
      stackFieldIdRaw &&
      typeof stackFieldIdRaw === 'number' &&
      stackFieldIdRaw > 0
        ? stackFieldIdRaw
        : null;

    console.log('stackFieldId-->>', stackFieldId);

    // Determine groupBy configuration for sorting (not grouping - frontend handles grouping)
    // GroupBy fields should be included in ORDER BY clause for proper record ordering
    let groupByForSorting: any = null;
    const hasViewGroupBy = view.group?.groupObjs?.length > 0;
    const hasKanbanStackField = isKanbanView && stackFieldId;

    if (hasKanbanStackField) {
      // For Kanban: Extract stackFieldId from options and create groupBy structure for sorting
      groupByForSorting = {
        groupObjs: [
          {
            fieldId: stackFieldId,
            order: 'asc', // Default order for Kanban
          },
        ],
      };
    } else if (hasViewGroupBy && !isKanbanView) {
      // For Grid view: Use view.group for sorting
      groupByForSorting = view.group;
    }

    let filter_query: string = `WHERE "__status" = '${__status}' `;
    let sort_query: string = '';

    const field_ids_mapping: Record<number, any> = {};
    let field_id_to_field_map: Record<string, any> = {};

    // Get groupBy fields for sorting (if groupBy exists)
    let groupByFields: any[] = [];
    if (groupByForSorting?.groupObjs?.length > 0) {
      try {
        groupByFields = await this.sheets_getGroupByFields(
          groupByForSorting.groupObjs,
          prisma,
        );
        // Add groupBy field IDs to mapping
        groupByFields.forEach((field) => {
          field_ids_mapping[field.id] = true;
        });
      } catch (error) {
        // If groupBy fields can't be fetched, continue without groupBy sorting
        this.logger.warn('Failed to fetch groupBy fields for sorting', {
          error,
        });
      }
    }

    if (!skip_filters) {
      if (
        !this.lodash.isEmpty(manual_filters) ||
        !this.lodash.isEmpty(manual_sort) ||
        manual_group_by
      ) {
        if (manual_filters) {
          this.recordUtils.getFilterFieldIds({
            filter: manual_filters,
            field_ids_mapping,
          });
        }

        if (manual_sort) {
          this.recordUtils.getSortFieldIds({
            sorting: manual_sort,
            field_ids_mapping,
          });
        }

        if (!this.lodash.isEmpty(field_ids_mapping)) {
          const payload = {
            ids: Object.keys(field_ids_mapping).map(Number),
          };

          const [fields] = await this.emitter.emitAsync(
            'field.getFieldsById',
            payload,
            prisma,
          );

          const response = this.recordUtils.createFieldIdToFieldMap({
            fields,
          });

          field_id_to_field_map = {
            ...field_id_to_field_map,
            ...response,
          };
        }

        filter_query = this.buildFilterQuery(
          manual_filters,
          filter_query,
          state,
          field_id_to_field_map,
        );

        // Build combined sort query: groupBy fields first, then manual_sort
        sort_query = this.sheets_buildCombinedSortQuery(
          groupByFields,
          groupByForSorting,
          manual_sort,
          field_id_to_field_map,
          orderRowColumnName,
          isKanbanView,
        );
      } else {
        if (applied_filters) {
          this.recordUtils.getFilterFieldIds({
            filter: applied_filters,
            field_ids_mapping,
          });
        }

        if (applied_sorting) {
          this.recordUtils.getSortFieldIds({
            sorting: applied_sorting,
            field_ids_mapping,
          });
        }

        if (!this.lodash.isEmpty(field_ids_mapping)) {
          const payload = {
            ids: Object.keys(field_ids_mapping).map(Number),
          };

          const [fields] = await this.emitter.emitAsync(
            'field.getFieldsById',
            payload,
            prisma,
          );

          const response = this.recordUtils.createFieldIdToFieldMap({
            fields,
          });

          field_id_to_field_map = {
            ...field_id_to_field_map,
            ...response,
          };
        }

        filter_query = this.buildFilterQuery(
          applied_filters,
          filter_query,
          {},
          field_id_to_field_map,
        );

        // Build combined sort query: groupBy fields first, then view.sort
        sort_query = this.sheets_buildCombinedSortQuery(
          groupByFields,
          groupByForSorting,
          applied_sorting,
          field_id_to_field_map,
          orderRowColumnName,
          isKanbanView,
        );
      }
    }

    let get_query = `SELECT * FROM "${schemaName}".${tableName} ${filter_query} ${sort_query}`;

    // Include LIMIT and OFFSET if provided
    if (limit) {
      get_query += ` LIMIT ${limit}`;
    }

    if (offset) {
      get_query += ` OFFSET ${offset}`;
    }

    let records: any[] = [];

    try {
      records = await prisma.$queryRawUnsafe(get_query);
    } catch (e) {
      this.logger.error('Error executing SQL query in getRecords', {
        error: e,
        query: get_query,
      });
      throw new BadRequestException('Could not get Records');
    }

    let field_order: string;

    try {
      const field_order_array: any[] = await this.emitter.emitAsync(
        'view.getFieldOrder',
        viewId,
        prisma,
      );

      field_order = field_order_array[0];
    } catch (error) {
      this.logger.error('Failed to fetch field order in getRecords', { error });
      throw new BadRequestException('Failed to fetch field order: ' + error);
    }

    let parsed_field_order: Record<string, any>;
    try {
      parsed_field_order = JSON.parse(field_order);
    } catch (e) {
      this.logger.error('Failed to parse field order JSON in getRecords', {
        error: e,
      });
      throw new BadRequestException('Incorrect column Meta');
    }

    let fields: any[] = [];
    try {
      const fields_array = await this.emitter.emitAsync(
        'field.getFields',
        tableId,
        prisma,
      );

      if (fields_array.length === 0) {
        throw new BadRequestException('Could not get Fields');
      }

      fields = fields_array[0];
    } catch (error) {
      this.logger.error('Failed to fetch fields in getRecords', { error });
      throw new BadRequestException(error);
    }

    let sorted_fields: any[] = [];

    try {
      const sorted_fields_array: any[] = await this.emitter.emitAsync(
        'field.sortFieldsByOrder',
        fields,
        parsed_field_order,
      );

      sorted_fields = sorted_fields_array[0];
    } catch (error) {
      this.logger.error('Failed to sort fields in getRecords', { error });
      throw new BadRequestException(error);
    }

    // Filter fields based on requiredField if provided, otherwise use all fields
    if (requiredFields && requiredFields.length > 0) {
      const requiredFieldIds = requiredFields.map((field: any) => field.id);
      sorted_fields = sorted_fields.filter((field) =>
        requiredFieldIds.includes(field.id),
      );
    }
    // If requiredField is not provided or empty, sorted_fields remains unchanged (all fields)

    let response: any;

    if (version === 1) {
      const ordered_records = this.orderedRecords(
        records,
        sorted_fields,
        viewId,
        should_stringify,
        view,
      );

      response = {
        ...(is_field_required ? { fields: sorted_fields } : {}),
        records: ordered_records,
      };
    }

    if (version === 2) {
      const ordered_records = this.orderedRecordsV2(
        records,
        sorted_fields,
        viewId,
        should_stringify,
      );
      const fields = this.recordUtils.mapFieldsById(sorted_fields);

      response = {
        ...(is_field_required ? { fields: fields } : {}),
        records: ordered_records,
      };
    }

    if (version === 3) {
      const ordered_records = this.orderedRecordsV3(
        records,
        sorted_fields,
        viewId,
      );
      const fields = this.recordUtils.mapFieldsById(sorted_fields);

      response = {
        ...(is_field_required ? { fields: fields } : {}),
        records: ordered_records,
      };
    }

    try {
      const hasLinkFields = sorted_fields.some(
        (f: any) => f.type === 'LINK' && f.options?.foreignTableId,
      );
      if (hasLinkFields && response.records?.length > 0) {
        const [resolvedRecords] = await this.emitter.emitAsync(
          'link.resolveLinkFields',
          {
            records: response.records,
            fields: sorted_fields,
            baseId,
            tableId,
          },
          prisma,
        );
        if (resolvedRecords) {
          response.records = resolvedRecords;
        }
      }
    } catch (error) {
      this.logger.error('Failed to resolve link fields', { error });
    }

    try {
      const hasLookupFields = sorted_fields.some(
        (f: any) =>
          f.type === 'LOOKUP' &&
          (f.lookupOptions?.linkFieldId || f.options?.linkFieldId),
      );
      if (hasLookupFields && response.records?.length > 0) {
        const [resolvedRecords] = await this.emitter.emitAsync(
          'lookup.resolveLookupFields',
          {
            records: response.records,
            fields: sorted_fields,
            baseId,
            tableId,
          },
          prisma,
        );
        if (resolvedRecords) {
          response.records = resolvedRecords;
        }
      }
    } catch (error) {
      this.logger.error('Failed to resolve lookup fields', { error });
    }

    try {
      const hasRollupFields = sorted_fields.some(
        (f: any) =>
          f.type === 'ROLLUP' &&
          (f.lookupOptions?.linkFieldId || f.options?.linkFieldId) &&
          f.options?.expression,
      );
      if (hasRollupFields && response.records?.length > 0) {
        const [resolvedRecords] = await this.emitter.emitAsync(
          'rollup.resolveRollupFields',
          {
            records: response.records,
            fields: sorted_fields,
            baseId,
            tableId,
          },
          prisma,
        );
        if (resolvedRecords) {
          response.records = resolvedRecords;
        }
      }
    } catch (error) {
      this.logger.error('Failed to resolve rollup fields', { error });
    }

    return response;
  }

  orderedRecordsV3(records: any[], sorted_fields: any[], viewId: string) {
    const ordered_records = records.map((record: any) => {
      // Create a new record object
      const order_key = `_row_view${viewId}`;
      const keys_to_add = [
        '__id',
        '__status',
        '__created_by',
        '__last_updated_by',
        '__created_time',
        '__last_modified_time',
        '__auto_number',
        '__version',
        order_key,
      ];

      const new_record_hash = {};

      // Add system keys as objects with value and normalizedValue
      keys_to_add.forEach((key) => {
        const value = record[key];
        new_record_hash[key] = {
          value: value,
          normalizedValue: value,
        };
      });

      // Add field keys as objects with value and normalizedValue
      sorted_fields.forEach((field) => {
        const { dbFieldName = '', id, type } = field;
        const value = record[dbFieldName];

        const normalized_value = DataConverter.convertToReadableFormat(
          value,
          type,
        );

        new_record_hash[id] = {
          value: value,
          normalized_value: normalized_value,
        };
      });

      return new_record_hash;
    });

    return ordered_records;
  }

  orderedRecordsV2(
    records: any[],
    sorted_fields: any[],
    viewId: string,
    should_stringify: boolean = false,
  ) {
    const ordered_records = records.map((record: any) => {
      // Create a new record object
      const order_key = `_row_view${viewId}`;
      const keys_to_add = [
        '__id',
        '__status',
        '__created_by',
        '__last_updated_by',
        '__created_time',
        '__last_modified_time',
        '__auto_number',
        '__version',
        order_key,
      ];

      const new_record_hash = {};

      keys_to_add.forEach((key) => {
        new_record_hash[key] = record[key]; // Add key and its value from record
      });

      sorted_fields.forEach((field) => {
        const { dbFieldName = '', id } = field;
        const value = record[dbFieldName];

        // Stringify if the value is an object
        new_record_hash[id] =
          typeof value === 'object' && value !== null && should_stringify
            ? JSON.stringify(value)
            : value;
      });

      return new_record_hash;
    });

    return ordered_records;
  }

  async updateRecord(
    updateRecordPayload: UpdateRecordsDTO & { user_id?: string },
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, viewId, column_values, user_id } = updateRecordPayload;

    let created_records: any;

    if (!this.lodash.isEmpty(column_values)) {
      const records: ColumnValueDTO[] = [];
      const field_ids = new Set<number>();

      column_values.forEach((column_value: ColumnValueDTO) => {
        const { row_id, fields_info } = column_value;

        if (!row_id) {
          records.push(column_value);

          // Push field_ids directly while iterating through fields_info
          fields_info.forEach((field_info) => {
            field_ids.add(field_info.field_id);
          });
        }
      });

      if (records.length > 0) {
        const payload = {
          ids: [...field_ids],
        };

        const fields_array = await this.emitter.emitAsync(
          'field.getFieldsById',
          payload,
          prisma,
        );

        const fields = fields_array[0];

        const columns = fields.map((field) => field.dbFieldName);

        const records_payload = records.map((record: ColumnValueDTO) => {
          const row_data: Record<string, any> = {};

          record.fields_info.forEach((field_info) => {
            const field_name = fields.find(
              (f) => f.id === field_info.field_id,
            )?.dbFieldName;

            if (field_name) {
              row_data[field_name] = field_info.data;
            }
          });

          return row_data;
        });

        const insert_payload: CreateMultipleRecordsDTO = {
          columns,
          records: records_payload as [
            Record<string, unknown>,
            ...Record<string, unknown>[],
          ],
          baseId,
          tableId,
          viewId,
        };

        created_records = await this.createMultipleRecords(
          insert_payload,
          prisma,
        );
      }
    }

    const correct_column_values = column_values.filter(
      (column_value) => column_value.row_id !== undefined,
    );

    // NEW: Early return if there are no records to update
    if (this.lodash.isEmpty(correct_column_values)) {
      // Only handle created records emission and return
      if (created_records && created_records.length > 0) {
        await this.emitter.emitAsync(
          'emit_created_rows',
          created_records,
          tableId,
        );
      }

      // Return empty response since no updates were performed
      return [];
    }

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName: string = result[0]; // Assuming the first element of the array is the database name

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    const field_ids: number[] = [];

    correct_column_values.forEach((val) => {
      const { fields_info } = val;
      fields_info.forEach((field) => {
        field_ids.push(field.field_id);
      });
    });

    const [fields] = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    // Map field_ids to their corresponding dbFieldNames
    const fieldMap = new Map<number, string>();
    const fieldTypeMap: Record<string, string> = {};

    fields.forEach((field) => {
      fieldMap.set(field.id, field.dbFieldName);

      let dbFieldType: string;

      if (TYPE_MAPPING[field.type]) {
        dbFieldType = TYPE_MAPPING[field.type];
      } else {
        dbFieldType = TYPE_MAPPING['UNKNOWN'];
      }

      fieldTypeMap[field.dbFieldName] = dbFieldType;
    });

    for (const val of correct_column_values) {
      const { row_id, fields_info: valFieldsInfo } = val;
      if (row_id) {
        const validationErrors = await this.validateFieldConstraints(
          fields,
          valFieldsInfo,
          row_id,
          schemaName,
          tableName,
          prisma,
        );
        if (validationErrors.length > 0) {
          throw new BadRequestException({
            message: 'Validation failed',
            errors: validationErrors,
          });
        }
      }
    }

    // Prepare the payload for update query
    const updated_payload = (
      column_values.filter((val) => val.row_id !== undefined) || []
    ) // Filter out records with undefined row_id
      .map((val) => {
        const { row_id, fields_info } = val;

        const mapped_fields_info = fields_info.map((field) => ({
          dbFieldName: fieldMap.get(field.field_id) || '', // Get the dbFieldName based on field_id
          data: field.data,
        }));

        return {
          row_id: row_id as number, // Cast row_id to number because it's now guaranteed to be defined
          fields_info: mapped_fields_info,
        };
      });

    let shouldUpdateLastModified = true;

    if (user_id) {
      const lmbFields = fields.filter(
        (f) => f.type === 'LAST_MODIFIED_BY' || f.type === 'LAST_MODIFIED_TIME',
      );

      if (lmbFields.length > 0) {
        const allHaveTracking = lmbFields.every(
          (f) => f.options?.trackedFieldIds && f.options.trackedFieldIds.length > 0,
        );

        if (allHaveTracking) {
          const allTrackedIds = new Set<number>();
          lmbFields.forEach((f) => {
            (f.options.trackedFieldIds as number[]).forEach((id: number) =>
              allTrackedIds.add(id),
            );
          });

          const changedFieldIds = new Set<number>(field_ids);
          shouldUpdateLastModified = [...changedFieldIds].some((id) =>
            allTrackedIds.has(id),
          );
        }
      }

      if (shouldUpdateLastModified) {
        const userJsonb = JSON.stringify({ id: user_id });
        fieldTypeMap['__last_updated_by'] = 'JSONB';
        updated_payload.forEach((p) => {
          p.fields_info.push({
            dbFieldName: '__last_updated_by',
            data: userJsonb,
          });
        });
      }
    }

    // NEW: Formula Recalculation Logic
    const formulaResults = await this.handleFormulaRecalculation(
      tableId,
      baseId,
      updated_payload,
      prisma,
    );

    const updated_payload_with_formula_results = updated_payload.map(
      (payload) => {
        const formula_result = formulaResults.find(
          (result) => result.row_id === payload.row_id,
        );

        return {
          ...payload,
          fields_info: [
            ...payload.fields_info,
            ...(formula_result?.fields_info || []),
          ],
        };
      },
    );

    const row_ids_to_update = updated_payload_with_formula_results
      .map((p) => p.row_id)
      .filter((id) => id !== undefined);

    let beforeRecords: any[] = [];
    if (row_ids_to_update.length > 0) {
      try {
        const beforeQuery = `SELECT * FROM "${schemaName}".${tableName} WHERE __id IN (${row_ids_to_update.join(',')})`;
        beforeRecords = await prisma.$queryRawUnsafe(beforeQuery);
      } catch (error) {
        this.logger.error('Error fetching before-values for history logging', { error });
      }
    }

    const update_set_clauses: string = this.createUpdateSetClause(
      updated_payload_with_formula_results,
      false,
      '',
      fieldTypeMap,
      !shouldUpdateLastModified,
    );

    const update_query = `UPDATE "${schemaName}".${tableName} ${update_set_clauses}`;

    try {
      await prisma.$queryRawUnsafe(update_query);
    } catch (error) {
      this.logger.error('Error executing SQL update query in updateRecord', {
        error,
        query: update_query,
      });
      throw new BadRequestException(`Could not update the records`);
    }

    try {
      await this.logUpdateHistory({
        schemaName,
        tableName,
        beforeRecords,
        updatedPayload: updated_payload_with_formula_results,
        fields,
        userId: user_id,
        prisma,
      });
    } catch (error) {
      this.logger.error('Error logging update history', { error });
    }

    const view_array = await this.emitter.emitAsync(
      'view.getViewById',
      viewId,
      prisma,
    );

    const view = view_array[0];

    let should_emit = false;

    if (!this.lodash.isEmpty(view.filter) || !this.lodash.isEmpty(view.sort)) {
      const all_db_field_names: string[] = [];
      const all_field_ids: number[] = [];

      fields.forEach((field) => {
        all_db_field_names.push(field.dbFieldName);
        all_field_ids.push(field.id);
      });

      // Check if filter condition is applied (assuming we emit if a filter exists for now)
      if (!this.lodash.isEmpty(view.filter)) {
        const filtered_columns: (string | number)[] =
          RecordUtils.collectFilteredColumns(view.filter);

        if (
          filtered_columns.some((value) =>
            typeof value === 'string'
              ? all_db_field_names.includes(value)
              : all_field_ids.includes(value),
          )
        ) {
          should_emit = true;
        }
      }

      // Check if sort condition is applied and intersects with `all_field_ids`
      if (!should_emit && !this.lodash.isEmpty(view.sort)) {
        const sort_obj: any[] = view.sort.sortObjs;
        const sorted_field_ids: number[] = sort_obj.map(
          (field: any) => field.fieldId,
        );

        if (sorted_field_ids.some((id) => all_field_ids.includes(id))) {
          should_emit = true;
        }
      }
    }

    // Check if groupBy is active and any updated field is a groupBy field
    if (
      !should_emit &&
      !this.lodash.isEmpty(view.group?.groupObjs) &&
      view.group.groupObjs.length > 0
    ) {
      const group_by_objs: any[] = view.group.groupObjs;
      const group_by_field_ids: number[] = group_by_objs.map((obj: any) =>
        Number(obj.fieldId),
      );

      // Check if any of the UPDATED field IDs is a groupBy field
      if (group_by_field_ids.some((id) => field_ids.includes(id))) {
        should_emit = true;
      }
    }

    // Emit records if any condition passes
    if (should_emit) {
      const get_records_payload = {
        tableId,
        baseId,
        viewId,
        should_stringify: true,
      };

      const records = await this.getRecords(get_records_payload, prisma);

      await this.emitter.emitAsync('emit_get_records', records, tableId);
    }

    // Merge formula results into the main response
    const response = correct_column_values.map((column) => {
      const processedFieldsInfo = column.fields_info.map((field) => {
        let value = field.data;
        if (
          value !== null &&
          typeof value !== 'string' &&
          typeof value !== 'number'
        ) {
          value = JSON.stringify(value);
        }
        return {
          field_id: field.field_id,
          data: value, // Return the processed value
        };
      });

      // Find formula results for this row
      const formulaResult = formulaResults.find(
        (result) => result.row_id === column.row_id,
      );

      // Add formula field results to the response
      if (formulaResult) {
        formulaResult.fields_info.forEach((formulaField) => {
          // Find field_id by matching dbFieldName
          const field = fields.find(
            (f) => f.dbFieldName === formulaField.dbFieldName,
          );
          if (field) {
            processedFieldsInfo.push({
              field_id: field.id,
              data: formulaField.data,
            });
          }
        });
      }

      return {
        row_id: column.row_id,
        fields_info: processedFieldsInfo,
      };
    });

    const data_steam_results: Record<string, any>[] = response.map((res) => ({
      __id: res?.row_id,
    }));

    // Extract unique field IDs from original update payload
    const updatedFieldIdsSet = new Set<number>();
    correct_column_values.forEach((val) => {
      const { fields_info } = val;
      fields_info.forEach((field) => {
        updatedFieldIdsSet.add(field.field_id);
      });
    });
    const updatedFieldIds = Array.from(updatedFieldIdsSet);

    await this.handleDataStreamAndQueueJob(
      tableId,
      baseId,
      viewId,
      data_steam_results,
      'update_record',
      prisma,
      updatedFieldIds,
    );

    if (created_records && created_records.length > 0) {
      await this.emitter.emitAsync(
        'emit_created_rows',
        created_records,
        tableId,
      );
    }

    try {
      const changedRecordIds = correct_column_values.map((val) => val.row_id).filter((id): id is number => id !== undefined);
      if (field_ids.length > 0 && changedRecordIds.length > 0) {
        await this.emitter.emitAsync('recalc.triggerRecalculation', {
          tableId,
          baseId,
          changedFieldIds: field_ids,
          changedRecordIds,
        }, prisma);
      }
    } catch (err) {
      console.error('Recalculation failed:', err);
    }

    await this.handleEnrichmentDependencies(
      tableId,
      baseId,
      viewId,
      updated_payload_with_formula_results,
      prisma,
    );

    return response;
  }

  /**
   * NEW: Handles formula recalculation after record updates
   * Returns calculated formula values in the standard format
   */
  private async handleFormulaRecalculation(
    tableId: string,
    baseId: string,
    updatedPayload: UpdatedPayloadDTO,
    prisma: Prisma.TransactionClient,
    isCreateMode: boolean = false, // New parameter to distinguish create vs other operations
  ): Promise<
    { row_id?: number; fields_info: { dbFieldName: string; data: any }[] }[]
  > {
    try {
      // NEW: Always get ALL formula fields, not just dependent ones
      const [allFormulaFields]: field[][] = await this.emitter.emitAsync(
        'field.getAllFormulaFields',
        tableId,
        prisma,
      );

      const formulaColumnsToRecalculate: string[] = allFormulaFields.map(
        (field: field) => field.dbFieldName,
      );

      if (formulaColumnsToRecalculate.length === 0) {
        return [];
      }

      // Get execution order for formula columns
      const executionOrder =
        await this.formulaRecalculator.getFormulaExecutionOrder(
          tableId,
          formulaColumnsToRecalculate,
          prisma,
        );

      const allFormulaResults: {
        row_id?: number;
        fields_info: { dbFieldName: string; data: any }[];
      }[] = [];

      // Process each updated row
      for (const payload of updatedPayload) {
        const { row_id, fields_info: updatedFields } = payload;

        let currentRecordData: Record<string, any> = {};

        if (isCreateMode) {
          // For create operations, we don't have existing record data
          // Use the updated fields as the current data
          currentRecordData = {};
          updatedFields.forEach((field: any) => {
            currentRecordData[field.dbFieldName] = field.data;
          });
        } else {
          // For update operations, get current record data using getRecords
          if (row_id) {
            currentRecordData =
              await this.getRecordDataForFormulaUsingGetRecords(
                tableId,
                baseId,
                row_id,
                prisma,
              );
          }
        }

        // Create updatedRecordData from the fields that were changed
        const updatedRecordData: Record<string, any> = {};
        updatedFields.forEach((field: any) => {
          updatedRecordData[field.dbFieldName] = field.data;
        });

        // Calculate formula values using both current and updated data
        const formulaResults =
          await this.formulaRecalculator.calculateFormulaValues(
            tableId,
            baseId,
            executionOrder,
            currentRecordData,
            updatedRecordData,
            prisma,
            row_id, // can be undefined for create operations
          );

        // Transform the formula results to the desired format
        const fields_info: { dbFieldName: string; data: any }[] = [];
        formulaResults.forEach((result) => {
          fields_info.push({
            dbFieldName: result.columnName, // Transform columnName to dbFieldName
            data: result.value, // Transform value to data
          });
        });

        allFormulaResults.push({
          ...(row_id && { row_id }), // Only include row_id if it exists
          fields_info,
        });
      }

      return allFormulaResults;
    } catch (error) {
      console.error('Error in formula recalculation:', error);
      // Return empty array to avoid breaking the main update flow
      return [];
    }
  }

  /**
   * NEW: Gets record data using getRecords with manual_filters
   */
  private async getRecordDataForFormulaUsingGetRecords(
    tableId: string,
    baseId: string,
    rowId: number,
    prisma: Prisma.TransactionClient,
  ): Promise<Record<string, any>> {
    // First, get a valid viewId for the table
    const [views] = await this.emitter.emitAsync(
      'view.getViews',
      { tableId },
      prisma,
    );

    const viewId = views[0].id; // Use the first available view

    // Create manual filter to get specific record by __id
    const manualFilters = {
      id: Date.now(),
      condition: 'and',
      childs: [
        {
          id: Date.now(),
          key: '__id',
          field: '__id',
          type: 'NUMBER',
          operator: {
            key: '=',
            value: 'is...',
          },
          value: rowId,
          valueStr: rowId,
        },
      ],
    };

    const getRecordsPayload = {
      tableId,
      baseId,
      viewId,
      manual_filters: manualFilters,
      should_stringify: true,
      is_field_required: false,
      limit: 1,
    };

    const records = await this.getRecords(getRecordsPayload, prisma);

    // Return the first (and only) record, or empty object if no record found
    return records?.records?.[0] || {};
  }

  async updateFormRecord(
    payload: UpdateFormRecordPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { fields_info, tableId, baseId, row_id } = payload;

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName: string = result[0]; // Assuming the first element of the array is the database name

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    const update_query_parts: string[] = [];

    fields_info.forEach((field_info: Record<string, any>) => {
      const { db_field_name, value } = field_info;

      let valueString: string;

      if (typeof value === 'object') {
        // Handle JSONB or other object values
        // Convert the object value to a string using JSON.stringify
        valueString = JSON.stringify(value);
      } else {
        // Handle other data types
        valueString = String(value);
      }

      update_query_parts.push(`"${db_field_name}" = '${valueString}'`);
    });

    const update_query = `
        UPDATE "${schemaName}".${tableName}
        SET ${update_query_parts.join(', ')}
        WHERE __id = '${row_id}';
      `;

    try {
      await prisma.$queryRawUnsafe(update_query);
    } catch (e) {
      throw new BadRequestException('Could not Update records');
    }

    const get_record_query = `Select * from "${schemaName}".${tableName} where __id=${row_id} `;

    try {
      const updated_record = await prisma.$queryRawUnsafe(get_record_query);

      //TODO: = Emit the record to Satu

      return updated_record;
    } catch (error) {
      throw new BadRequestException('Could not get record');
    }
  }

  buildUpdateQuery(payload: any): string[] {
    const { fields_info, fields } = payload;

    const update_set_clauses: any = [];
    for (const field of fields_info) {
      const { field_id, data } = field;
      const correctField = fields.find((f) => f.id === Number(field_id));

      if (!correctField) {
        throw new BadRequestException(`No Field with ID ${field_id}`);
      }

      const db_field_name = correctField.dbFieldName;

      let formated_data;

      if (
        data === null ||
        data === undefined ||
        data === '' ||
        (typeof data === 'number' && isNaN(data))
      ) {
        formated_data = 'NULL';
      } else if (typeof data === 'number') {
        formated_data = data; // No quotes needed for numbers
      } else {
        if (!this.lodash.isString(data)) {
          formated_data = JSON.stringify(data);
        } else {
          formated_data = data;
        }
        formated_data = formated_data.replace(/'/g, "''");
        formated_data = `'${formated_data}'`;
      }

      update_set_clauses.push(`"${db_field_name}" = ${formated_data}`);
    }

    update_set_clauses.push(
      `"__last_modified_time" = '${new Date().toISOString()}'`,
    );

    return update_set_clauses;
  }

  async createRecord(
    payload: CreateRecordDTO & { user_id?: string },
    prisma: Prisma.TransactionClient,
    is_http: boolean = false,
  ) {
    const { tableId, viewId, baseId, fields_info = [], order_info, user_id } = payload;

    const get_table_payload = {
      tableId,
      is_view_required: 'true',
      baseId,
    };

    const table_array = await this.emitter.emitAsync(
      'table.getTable',
      get_table_payload,
      prisma,
    );

    const table = table_array[0];

    const dbName: string = table.dbTableName;
    const views: any[] = table.views;

    const view = views.find((view) => view.id === viewId);

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    if (!view) {
      throw new BadRequestException(
        `No view of table with given View id ${viewId}`,
      );
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];
    const orderRowColumnName = `_row_view${viewId}`;

    const field_ids = fields_info.map((field_info: any) => field_info.field_id);

    let fields: any[] = [];

    try {
      const fields_array = await this.emitter.emitAsync(
        'field.getFieldsById',
        {
          ids: field_ids,
        },
        prisma,
      );

      fields = fields_array[0];
    } catch (error) {
      this.logger.error('Failed to fetch fields in createRecord', { error });
      throw new BadRequestException(`Could not get Fields ${error}`);
    }

    const allTableFields = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );
    const allFields = allTableFields?.[0] || fields;

    const validationErrors = await this.validateFieldConstraints(
      allFields,
      fields_info,
      null,
      schemaName,
      tableName,
      prisma,
    );
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Create field type mapping
    const fieldTypeMap: Record<string, string> = {};
    fields.forEach((field) => {
      let dbFieldType: string;
      if (TYPE_MAPPING[field.type]) {
        dbFieldType = TYPE_MAPPING[field.type];
      } else {
        dbFieldType = TYPE_MAPPING['UNKNOWN'];
      }
      fieldTypeMap[field.dbFieldName] = dbFieldType;
    });

    const schematableName = `"${schemaName}".${tableName} `;

    let record_order: any = null;

    if (order_info) {
      const payload = { tableId, baseId, viewId, order_info };
      record_order = await this.getCorrectRowOrder(payload, prisma);
    } else {
      // No order_info: add at end via sequence nextval
      const sequence_name = `_row_view${viewId}`;
      const sequence_schema = baseId;
      const sequence_query = `SELECT nextval('"${sequence_schema}"."${sequence_name}"') as next_order_value;`;
      const seqResult: any = await prisma.$queryRawUnsafe(sequence_query);
      record_order = Number(seqResult[0]?.next_order_value);
    }

    const userInfo = user_id ? { id: user_id } : null;

    const recordData: { [key: string]: any } = {
      ...(record_order != null &&
        Number.isFinite(record_order) && {
          [orderRowColumnName]: record_order,
        }),
      __status: 'active',
      ...(userInfo && {
        __created_by: userInfo,
        __last_updated_by: userInfo,
      }),
    };

    fieldTypeMap['__created_by'] = 'JSONB';
    fieldTypeMap['__last_updated_by'] = 'JSONB';

    const record_data = await this.recordUtils.processAndUpdateFields({
      fields,
      fields_info,
      prisma,
      tableId,
      baseId,
      viewId,
    });

    // Corrected merge syntax
    const updatedRecordData = { ...recordData, ...record_data };

    // NEW: Formula Recalculation Logic for Create Record
    // Transform fields_info to the format expected by handleFormulaRecalculation
    const createPayload = [
      {
        fields_info: fields_info.map((field_info) => {
          const field = fields.find((f) => f.id === field_info.field_id);
          return {
            dbFieldName: field?.dbFieldName || '',
            data: field_info.data,
          };
        }),
      },
    ];

    const formulaResults = await this.handleFormulaRecalculation(
      tableId,
      baseId,
      createPayload,
      prisma,
      true, // isCreateMode = true
    );

    // Merge formula results with the record data
    const finalRecordData = { ...updatedRecordData };
    if (formulaResults.length > 0 && formulaResults[0].fields_info) {
      formulaResults[0].fields_info.forEach((formulaField) => {
        finalRecordData[formulaField.dbFieldName] = formulaField.data;
      });
    }

    // Apply field defaults for CHECKBOX and USER fields on new records
    const defaultFields = allFields.filter(
      (f) =>
        (f.type === 'CHECKBOX' && f.options?.defaultValue === true) ||
        (f.type === 'USER' && f.options?.defaultValue),
    );
    for (const df of defaultFields) {
      if (!(df.dbFieldName in finalRecordData)) {
        if (df.type === 'CHECKBOX') {
          finalRecordData[df.dbFieldName] = true;
          fieldTypeMap[df.dbFieldName] = 'BOOLEAN';
        } else if (df.type === 'USER') {
          finalRecordData[df.dbFieldName] = JSON.stringify(df.options.defaultValue);
          fieldTypeMap[df.dbFieldName] = 'JSONB';
        }
      }
    }

    const insert_query = this.generateInsertQuery(
      schematableName,
      finalRecordData,
      {},
      true,
      '',
      fieldTypeMap,
    );

    let records: any[] = [];

    try {
      records = await prisma.$queryRawUnsafe(insert_query);

      if (records.length === 0) {
        throw new BadRequestException('Could not insert data into the record');
      }
    } catch (error) {
      this.logger.error('Error executing SQL insert query in createRecord', {
        error,
        query: insert_query,
      });
      throw new BadRequestException(`Could not insert data into the record`);
    }

    const results: any[] = [];

    if (records.length > 0) {
      const parsed_records = this.stringifyArrayValues(records);

      const firstRecord = parsed_records[0];

      // Extract __id using helper function for consistency (even though return_all=true should work)
      const recordId = this.extractRecordId(firstRecord, fields, {});

      const formatted_response = {
        ...firstRecord,
        __id: recordId, // Ensure __id is normalized
        ...(fields_info.length > 0 && {
          field_id: fields_info[0].field_id,
          data: fields_info[0].data,
        }),
      };

      results.push(formatted_response);

      await this.logCreateHistoryEntries(
        schemaName,
        tableName,
        recordId,
        fields,
        fields_info,
        user_id || null,
        prisma,
      );
    }

    await this.handleDataStreamAndQueueJob(
      tableId,
      baseId,
      viewId,
      [{ __id: results[0].__id }],
      'create_record',
      prisma,
      field_ids, // Pass payload field IDs so TIME_BASED triggers can evaluate relevant timestamp fields
    );

    if (
      !this.lodash.isEmpty(view.filter) ||
      !this.lodash.isEmpty(view.sort?.sortObjs) ||
      !this.lodash.isEmpty(view.group?.groupObjs)
    ) {
      const get_records_payload = {
        tableId,
        baseId,
        viewId,
        should_stringify: true,
      };
      const records = await this.getRecords(get_records_payload, prisma);

      await this.emitter.emitAsync('emit_get_records', records, tableId);
    }

    if (is_http) {
      await this.emitter.emitAsync(
        'emitCreatedRow',
        results,
        tableId,
        baseId,
      );
    }

    return results;
  }

  async createRecordColumn(
    create_record_column_payload: CreateRecordColumn,
    prisma: Prisma.TransactionClient,
  ) {
    const { column_name, data_type, tableId, baseId } =
      create_record_column_payload;

    let schematableName: string = '';

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName = result[0];

    if (!dbName) {
      throw new BadRequestException(`Cant find table with id ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    schematableName = `"${schemaName}".${tableName}`;

    const query = `ALTER TABLE ${schematableName} ADD COLUMN "${column_name}" ${data_type}`;
    console.log('query--->>', query);

    try {
      await prisma.$queryRawUnsafe(query);
      return 'Created Column Successfully';
    } catch (e) {
      throw new BadRequestException('Could not create column');
    }
  }

  orderedRecords(
    records: any[],
    sorted_fields: any[],
    viewId: string,
    should_stringify: boolean = false,
    view?: View,
  ) {
    const ordered_records = records.map((record: any) => {
      // Create a new record object
      const order_key = `_row_view${viewId}`;
      const keys_to_add = [
        '__id',
        '__status',
        '__created_by',
        '__last_updated_by',
        '__created_time',
        '__last_modified_time',
        '__auto_number',
        '__version',
        order_key,
      ];

      const new_record_hash = {};

      keys_to_add.forEach((key) => {
        new_record_hash[key] = record[key]; // Add key and its value from record
      });

      sorted_fields.forEach((field) => {
        if (view) {
          const parsedColumnMeta: any = JSON.parse(view.columnMeta || '{}');
          const isHidden: boolean = parsedColumnMeta[field.id]?.is_hidden;

          if (isHidden) {
            return;
          }
        }

        const { dbFieldName = '' } = field;
        const value = record[dbFieldName];

        // Stringify if the value is an object
        new_record_hash[dbFieldName] =
          should_stringify &&
          this.lodash.isObject(value) &&
          !this.lodash.isDate(value)
            ? JSON.stringify(value)
            : value;
      });

      return new_record_hash;
    });

    return ordered_records;
  }

  private async logUpdateHistory(params: {
    schemaName: string;
    tableName: string;
    beforeRecords: any[];
    updatedPayload: { row_id?: number; fields_info: { dbFieldName: string; data: any }[] }[];
    fields: any[];
    userId?: string;
    prisma: Prisma.TransactionClient;
  }) {
    const { schemaName, tableName, beforeRecords, updatedPayload, fields, userId, prisma } = params;

    const SYSTEM_COLUMNS = new Set([
      '__id', '__status', '__created_by', '__last_updated_by',
      '__created_time', '__last_modified_time', '__auto_number', '__version',
    ]);

    const COMPUTED_TYPES = new Set([
      'FORMULA', 'ROLLUP', 'LOOKUP', 'AUTO_NUMBER',
      'CREATED_TIME', 'CREATED_BY', 'LAST_MODIFIED_BY', 'LAST_MODIFIED_TIME',
    ]);

    const fieldByDbName = new Map<string, any>();
    fields.forEach((f) => {
      fieldByDbName.set(f.dbFieldName, f);
    });

    const beforeRecordMap = new Map<number, any>();
    beforeRecords.forEach((rec) => {
      beforeRecordMap.set(Number(rec.__id), rec);
    });

    const historyValues: string[] = [];
    const changedByJson = userId ? `'${escapeSqlValue(JSON.stringify({ id: userId }))}'::jsonb` : 'NULL';

    for (const payload of updatedPayload) {
      const { row_id, fields_info } = payload;
      if (!row_id) continue;

      const beforeRecord = beforeRecordMap.get(row_id);

      for (const fieldUpdate of fields_info) {
        const { dbFieldName, data: newValue } = fieldUpdate;

        if (SYSTEM_COLUMNS.has(dbFieldName)) continue;

        const fieldMeta = fieldByDbName.get(dbFieldName);
        if (!fieldMeta) continue;

        if (COMPUTED_TYPES.has(fieldMeta.type)) continue;

        const oldValue = beforeRecord ? beforeRecord[dbFieldName] : null;

        const oldJson = oldValue !== null && oldValue !== undefined
          ? JSON.stringify(oldValue)
          : null;
        const newJson = newValue !== null && newValue !== undefined
          ? JSON.stringify(newValue)
          : null;

        if (oldJson === newJson) continue;

        const fieldId = escapeSqlValue(String(fieldMeta.id));
        const fieldName = escapeSqlValue(fieldMeta.name || '');
        const beforeSql = oldJson !== null
          ? `'${escapeSqlValue(oldJson)}'::jsonb`
          : 'NULL';
        const afterSql = newJson !== null
          ? `'${escapeSqlValue(newJson)}'::jsonb`
          : 'NULL';

        historyValues.push(
          `(${row_id}, '${fieldId}', '${fieldName}', ${beforeSql}, ${afterSql}, 'update', ${changedByJson})`,
        );
      }
    }

    if (historyValues.length === 0) return;

    const insertQuery = `INSERT INTO "${schemaName}".${tableName}_history
      (record_id, field_id, field_name, before_value, after_value, action, changed_by)
      VALUES ${historyValues.join(', ')}`;

    try {
      await prisma.$queryRawUnsafe(insertQuery);
    } catch (error) {
      this.logger.error('Failed to insert update history records', { error });
    }
  }

  async createMultipleRecordColumns(
    createMultiRecordColumns: CreateMutliRecordColumnDTO,
    prisma: Prisma.TransactionClient,
  ) {
    //   TODO - getting called 2 time when called from create multiple fields in fieldf.service
    const { tableId, baseId, create_record_columns_payload } =
      createMultiRecordColumns;

    let schematableName: string = '';
    // const dbName = await this.tableService.getDbName(tableId, baseId);

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName: string = result[0]; // Assuming the first element of the array is the database name

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    schematableName = `"${schemaName}".${tableName}`;

    const queries = create_record_columns_payload.map((payload) => {
      const { column_name, data_type } = payload;
      return `ADD COLUMN "${column_name}" ${data_type}`;
    });

    const query = `ALTER TABLE ${schematableName} ${queries.join(',')}`;

    console.log('query:: heree', query);

    try {
      const resp = await prisma.$queryRawUnsafe(query);
      console.log('resp-->>', resp);

      return 'Created Successfully';
    } catch (error) {
      throw new BadRequestException(`Could not create the columns`);
    }

    // if (!create_columns_response) {
    //   throw new BadRequestException('Could not create the columns');
    // }

    // return 'Created Successfully';
  }

  async updateRecordColumns(
    updateRecordColumnsPayload: updateRecordColumnsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, records_payload } = updateRecordColumnsPayload;

    let dbName: string;

    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );

      dbName = result[0]; // Assuming the first element of the array is the database name
    } catch (error) {
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }
    // const dbName = 'sMw_phjf5.clvkuv8o70003nhn5ghrvhn9f';

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    if (records_payload.length === 0) {
      throw new BadRequestException('Records to be updated can not be empty');
    }

    const queries = records_payload.map((payload) => {
      const { column_name, data_type } = payload;
      return `ALTER COLUMN "${column_name}" TYPE ${data_type} USING "${column_name}"::${data_type}`;
    });

    const query = `ALTER TABLE "${schemaName}"."${tableName}" ${queries.join('; ')}`;

    try {
      await prisma.$queryRawUnsafe(query);
    } catch (e) {
      throw new BadRequestException('Could not update Columns');
    }

    return 'Updated  Successfully';
    // });
  }

  generateInsertQuery(
    tableName: string,
    recordData: Record<string, any>,
    column_alias_map: Record<string, string> = {},
    return_all: boolean = false, // <- new param,
    order_row_column_name: string = '',
    fieldTypeMap: Record<string, string> = {},
  ) {
    // Keys that should always be included in the RETURNING clause
    const always_return_keys = [
      '__id',
      '__status',
      '__created_by',
      '__last_updated_by',
      '__created_time',
      '__last_modified_time',
      '__auto_number',
      '__version',
    ];

    // Keys to ignore during insert (auto-generated columns)
    const ignore_insert_keys = ['__id', '__auto_number'];

    // Filter out keys not meant to be inserted AND null/undefined values
    const filtered_columns = Object.keys(recordData).filter(
      (key) =>
        !ignore_insert_keys.includes(key) &&
        recordData[key] !== null &&
        recordData[key] !== undefined,
    );

    const mapped_columns = filtered_columns.map((column) => `"${column}"`);

    const values = filtered_columns.map((column) => {
      const value = recordData[column];
      // Handle null values first
      if (value === null || value === undefined) {
        return 'NULL';
      }
      const fieldType = fieldTypeMap?.[column] || 'TEXT'; // Get field type, default to text

      if (typeof value === 'object' && !Array.isArray(value)) {
        const jsonString = JSON.stringify(value);
        const escapedJsonString = escapeSqlValue(jsonString);

        if (fieldType === 'JSONB') {
          return `'${escapedJsonString}'::jsonb`;
        } else {
          return `'${escapedJsonString}'`;
        }
      } else if (Array.isArray(value)) {
        const jsonString = JSON.stringify(value);
        const escapedJsonString = escapeSqlValue(jsonString);
        if (fieldType === 'JSONB') {
          return `'${escapedJsonString}'::jsonb`;
        } else {
          return `'${escapedJsonString}'`;
        }
      } else if (typeof value === 'string') {
        const escapedString = escapeSqlValue(value);
        return `'${escapedString}'`;
      } else {
        return value;
      }
    });

    const columns_string = mapped_columns.join(', ');
    const values_string = values.join(', ');

    // Prepare final return keys (no duplicates)
    const return_keys_set = new Set([
      ...filtered_columns,
      ...always_return_keys,
    ]);

    const returning_clause = return_all
      ? '*'
      : [
          ...Array.from(return_keys_set).map((column) => {
            const alias = column_alias_map[column] || column;
            return `"${column}" AS "${alias}"`;
          }),
          order_row_column_name,
        ].join(', ');

    return `INSERT INTO ${tableName} (${columns_string}) VALUES (${values_string}) RETURNING ${returning_clause};`;
  }

  // will be depricating this function
  async getRecord(
    payload: GetRecordPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      baseId,
      tableId,
      manual_filters,
      state,
      __status = 'active',
    } = payload;

    const tableName = `"${baseId}".${tableId}`;

    let filter_query: string = `WHERE "__status" = '${__status}' `;

    if (manual_filters) {
      const field_ids_mapping: Record<number, any> = {};
      let field_id_to_field_map: Record<string, any> = {};

      this.recordUtils.getFilterFieldIds({
        filter: manual_filters,
        field_ids_mapping,
      });

      if (!this.lodash.isEmpty(field_ids_mapping)) {
        const payload = {
          ids: Object.keys(field_ids_mapping).map(Number),
        };

        const [fields] = await this.emitter.emitAsync(
          'field.getFieldsById',
          payload,
          prisma,
        );

        const response = this.recordUtils.createFieldIdToFieldMap({
          fields,
        });

        field_id_to_field_map = {
          ...field_id_to_field_map,
          ...response,
        };
      }

      filter_query = this.buildFilterQuery(
        manual_filters,
        filter_query,
        state,
        field_id_to_field_map,
      );
    }

    const find_query = `SELECT * FROM ${tableName} ${filter_query}  LIMIT 1`;

    let record: any[] = [];
    try {
      record = await prisma.$queryRawUnsafe(find_query);

      if (record.length > 0) {
        return record[0];
      }
      return {};
    } catch (error) {
      throw new BadRequestException('Could not Fetch Record');
    }
  }

  async getRecordV2(
    payload: GetRecordsPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const get_records_response = await this.getRecords(payload, prisma);

    const respone = {
      fields: get_records_response.fields,
      record:
        get_records_response.records.length > 0
          ? get_records_response.records[0]
          : {},
    };

    return respone;
  }

  async getRecordV3(
    payload: GetRecordsPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { fields, records } = await this.getRecords(payload, prisma);
    console.log('records::', records);

    const respone = {
      fields: fields,
      record: records.length > 0 ? records[0] : {},
    };

    return respone;
  }

  stringifyArrayValues(arr: any[]): any[] {
    return arr.map((obj) => {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          newObj[key] =
            this.lodash.isObject(value) && !this.lodash.isDate(value)
              ? JSON.stringify(value)
              : value;
        }
      }
      return newObj;
    });
  }

  private extractRecordId(
    record: any,
    fields: any[],
    column_alias_map?: Record<string, string | number>,
  ): number {
    if (!record) {
      throw new BadRequestException(
        'Cannot extract __id: record is null or undefined',
      );
    }

    // Case 1: Try direct access (when no ID field exists or return_all=true)
    if (record.__id !== undefined && record.__id !== null) {
      return Number(record.__id);
    }

    // Case 2: ID field exists, find it and access via alias
    // First try using column_alias_map if provided (optimization)
    if (column_alias_map && column_alias_map['__id']) {
      const aliasKey = column_alias_map['__id'].toString();
      const idValue = record[aliasKey];
      if (idValue !== undefined && idValue !== null) {
        return Number(idValue);
      }
    }

    // Fallback: find ID field in fields array
    const idField = fields.find((f) => f.dbFieldName === '__id');
    if (idField) {
      const fieldId = idField.id.toString();
      const idValue = record[fieldId];
      if (idValue !== undefined && idValue !== null) {
        return Number(idValue);
      }
    }

    // If we still can't find it, try to find any numeric key that might be the ID
    // This is a last resort fallback
    const numericKeys = Object.keys(record).filter((key) => {
      const value = record[key];
      return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value > 0 &&
        key !== '__status' &&
        key !== '__version'
      );
    });

    if (numericKeys.length === 1) {
      // If there's only one numeric key, it's likely the __id
      return Number(record[numericKeys[0]]);
    }

    throw new BadRequestException(
      'Could not extract __id from inserted record. This should not happen.',
    );
  }

  getValue = ({ operatorObj, value, data_type }) => {
    const { key } = operatorObj || {};
    // Use nullish coalescing to preserve 0, false, and empty string as valid values
    const val = value ?? '';

    // Escape the value once at the top - handles all data types automatically
    const escapedVal = escapeSqlValue(val);

    if (['ilike', 'not_ilike'].includes(key)) {
      return `'%${escapedVal}%'`;
    } else if (data_type === 'number') {
      // For numbers, we need to handle the escaped value properly
      if (typeof val === 'number') {
        // If it's actually a number, return the original number (no quotes needed)
        return val;
      } else if (val !== '' && !isNaN(Number(val))) {
        // If it's a string that represents a valid number, convert and return it
        return Number(val);
      } else {
        // If it's a string that looks like a number but has special chars, use escaped version
        return `'${escapedVal}'`;
      }
    } else {
      return `'${escapedVal}'`;
    }
  };

  buildFilterQuery = (
    filters: any,
    initialQuery: string,
    state?: Record<any, any>,
    field_id_to_field_map?: Record<string, any>,
  ) => {
    if (this.lodash.isEmpty(filters)) return initialQuery;

    const where_clause = this.getWhereClauseStr({
      initialVal: filters,
      includeWhere: false,
      state,
      field_id_to_field_map,
    });

    return where_clause
      ? `${initialQuery} and (${where_clause})`
      : initialQuery;
  };

  buildSortQuery = (
    sorting: any,
    orderRowColumnName: string,
    field_id_to_field_map,
  ) => {
    return this.getSortClauseStr({
      applied_sorting: sorting,
      orderRowColumnName,
      field_id_to_field_map,
    });
  };

  resolvedValue(
    state = {},
    key = '',
    value = '',
    type = 'ANY',
    default_value = undefined,
    case_type = undefined,
  ): string {
    try {
      const resolved_value = this.flow_utility_sdk.resolveValue(
        state,
        key,
        value,
        type,
        default_value,
        case_type,
      );

      return resolved_value.value;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  getWhereClauseStr = ({
    initialVal,
    includeWhere = false,
    state = {},
    field_id_to_field_map,
  }) => {
    const { condition = '', childs = [] } = initialVal || {};

    let query = includeWhere ? 'WHERE ' : '';

    childs.forEach((ele: Record<string, any>, i: number) => {
      const { field, type, operator, value, nested_key } = ele;

      if (i !== 0) {
        query += ` ${condition.toUpperCase()} `;
      }

      if (ele?.childs) {
        const childCndStr = this.getWhereClauseStr({
          initialVal: ele,
          state,
          field_id_to_field_map,
        });
        query += ` (${childCndStr}) `;
      } else {
        let key = '';
        if (typeof field === 'string') {
          key = field;
        } else {
          key = field_id_to_field_map[field]?.dbFieldName;
        }

        const final_value =
          this.resolvedValue(state, key, value, 'ANY', undefined, undefined) ||
          value;

        const data_type = TYPE_VALUE_MAPPING[type] || 'string';

        const jsonPath =
          JSONB_KEY_FOR_SEARCHING[type] ||
          Object.keys(JSONB_KEY_FOR_SEARCHING).includes(type) ||
          '';

        const val = this.getValue({
          value: final_value,
          operatorObj: operator,
          data_type,
        });

        // Store the condition in a variable first
        let conditionQuery = '';

        if (keys_with_data_type_jsonb.includes(type)) {
          if (type === 'DROP_DOWN') {
            conditionQuery = this.recordUtils.generateDropDownFilterQuery({
              key,
              operator,
              value,
            });
          }
          if (data_type === 'array_of_objects') {
            conditionQuery = this.recordUtils.getArrayOfObjectWhereQuery({
              key,
              operator,
              value,
            });
            // query += `EXISTS ( SELECT 1 FROM jsonb_array_elements("${key}")  AS elem WHERE elem->>'${jsonPath}' ${opVal} ${val} )`;
          } else if (data_type === 'array_of_strings') {
            conditionQuery = this.recordUtils.getArrayOfStringWhereQuery({
              key,
              operator,
              value,
            });
          } else if (jsonPath) {
            //   if column is address type
            if (type === QUESTION_TYPE.ADDRESS) {
              const column_name = key;
              const value = String(val);

              const address = new AddressFilterBuilder(
                column_name,
                operator?.key,
                value,
                nested_key,
              );

              conditionQuery = address.build();
            } else if (type === QUESTION_TYPE.PHONE_NUMBER) {
              const column_name = key;
              const value = String(val);

              const phone_number = new PhoneNumberFilterBuilder(
                column_name,
                operator?.key,
                value,
                nested_key,
              );

              conditionQuery = phone_number.build();
            } else {
              // query += `"${key}"->>'${jsonPath}' ${opVal} ${val} `;
              conditionQuery = this.recordUtils.getObjectWhereQuery({
                key,
                operator,
                val,
                jsonPath,
              });
            }
          }
        } else if (data_type === 'timestamptz') {
          conditionQuery = this.recordUtils.getDateWhereQuery({
            key,
            operator,
            value,
          });
        } else if (data_type === 'number') {
          conditionQuery = this.recordUtils.getNumberWhereQuery({
            key,
            operator,
            val,
          });
        } else {
          conditionQuery = this.recordUtils.getStringWhereQuery({
            key,
            operator,
            val,
          });
        }

        // THIS IS THE KEY FIX: Wrap each individual condition in parentheses
        // FIXED: Only add the condition if it's not empty
        if (conditionQuery && conditionQuery.trim() !== '') {
          query += ` (${conditionQuery}) `;
        }
      }
    });

    return query.trim();
  };

  getDateWhereQuery({ key, operator, value }) {
    const { key: operator_key, value: operator_value } = operator;

    let where_query: string = '';

    const formated_key = this.lodash.upperCase(operator_key);

    if (operator_value.includes('not')) {
      where_query = `"${key}" ${formated_key}`; // IS NOT EMPTY
    } else if (operator_value.includes('empty')) {
      where_query = `"${key}" ${formated_key}`; // IS EMPTY
    } else {
      where_query = `"${key}" ${operator_key} '${value}'`; // is , is before , is after, is on or before, is on or after
    }

    return where_query;
  }

  getSortClauseStr({
    applied_sorting,
    orderRowColumnName,
    field_id_to_field_map,
  }): string {
    const { sortObjs = [] } = applied_sorting || {};

    if (!applied_sorting || !sortObjs || sortObjs.length === 0) {
      return `ORDER BY ${orderRowColumnName} asc`;
    }

    // Log field map state for debugging
    console.log('🟡 [getSortClauseStr] Processing sort objects:', {
      sortObjsCount: sortObjs.length,
      sortObjs: sortObjs.map((obj: any) => ({
        fieldId: obj.fieldId,
        order: obj.order,
        type: obj.type,
      })),
      fieldMapSize: Object.keys(field_id_to_field_map).length,
      fieldMapKeys: Object.keys(field_id_to_field_map).map(Number),
    });

    let sort_query: string = '';

    sortObjs.forEach((obj: any, index: number) => {
      const { order, type, fieldId } = obj;

      // Try both string and number keys
      const fieldIdStr = String(fieldId);
      const fieldIdNum = fieldId;
      const field =
        field_id_to_field_map[fieldIdStr] || field_id_to_field_map[fieldIdNum];

      if (!field) {
        console.error('❌ [getSortClauseStr] Field not found in map:', {
          fieldId,
          fieldIdStr,
          fieldIdNum,
          fieldMapKeys: Object.keys(field_id_to_field_map).map(Number),
          availableFields: Object.keys(field_id_to_field_map),
        });
        throw new Error(
          `Invalid field mapping: Field ID ${fieldId} not found in field map. Available field IDs: ${Object.keys(field_id_to_field_map).join(', ')}`,
        );
      }

      if (!field.dbFieldName) {
        console.error('❌ [getSortClauseStr] Field missing dbFieldName:', {
          fieldId,
          field: {
            id: field.id,
            type: field.type,
            hasDbFieldName: !!field.dbFieldName,
            keys: Object.keys(field),
          },
        });
        throw new Error(
          `Invalid field mapping: Field ID ${fieldId} does not have a valid dbFieldName. Field data: ${JSON.stringify(field)}`,
        );
      }

      const dbFieldName = field.dbFieldName;

      const data_type = TYPE_VALUE_MAPPING[type];

      console.log('data_type::', data_type);

      const order_query = `${order} NULLS LAST`;

      if (data_type === 'array_of_strings') {
        sort_query += `"${dbFieldName}"::text ${order_query}`;
      } else if (data_type === 'array_of_objects') {
        if (type === 'DROP_DOWN') {
          const key = JSONB_KEY_FOR_SEARCHING[type];

          sort_query += ` (
                SELECT string_agg((value->>'${key}'), '')
                FROM jsonb_array_elements("${dbFieldName}") AS value
            ) ${order_query}`;
        } else if (type === 'FILE_PICKER') {
          const key = JSONB_KEY_FOR_SEARCHING[type];

          sort_query += ` (
                  SELECT string_agg((value->>'${key}'), '')
                  FROM jsonb_array_elements("${dbFieldName}") AS value
              ) ${order_query}`;
        } else if (type === 'RANKING') {
          const key = JSONB_KEY_FOR_SEARCHING[type];

          sort_query += ` (
                  SELECT string_agg((value->>'${key}'), '')
                  FROM jsonb_array_elements("${dbFieldName}") AS value
              ) ${order_query}`;
        }
      } else if (data_type === 'object') {
        const key = JSONB_KEY_FOR_SEARCHING[type];

        sort_query += `"${dbFieldName}" ->> '${key}' ${order_query}`;
      } else {
        sort_query += `"${dbFieldName}" ${order_query}`;
      }

      if (index < sortObjs.length - 1) {
        sort_query += ', ';
      }
    });

    return `ORDER BY ${sort_query}`;
  }

  private async cleanupLinksOnDelete(
    tableId: string,
    baseId: string,
    recordIds: number[],
    prisma: Prisma.TransactionClient,
  ) {
    try {
      const linkFields = await prisma.field.findMany({
        where: { tableMetaId: tableId, type: 'LINK', status: 'active' },
      });

      for (const linkField of linkFields) {
        const options = linkField.options as any;
        if (!options?.fkHostTableName || !options?.selfKeyName || !options?.foreignKeyName) continue;

        const [schemaName, tableName] = options.fkHostTableName.split('.');

        try {
          if (options.relationship === 'ManyMany') {
            await prisma.$queryRawUnsafe(
              `DELETE FROM "${schemaName}"."${tableName}" WHERE "${options.selfKeyName}" = ANY($1::int[])`,
              recordIds,
            );
          } else if (options.relationship === 'OneMany' || options.relationship === 'OneOne') {
            await prisma.$queryRawUnsafe(
              `UPDATE "${schemaName}"."${tableName}" SET "${options.selfKeyName}" = NULL WHERE "${options.selfKeyName}" = ANY($1::int[])`,
              recordIds,
            );
          } else if (options.relationship === 'ManyOne') {
            await prisma.$queryRawUnsafe(
              `UPDATE "${schemaName}"."${tableName}" SET "${options.foreignKeyName}" = NULL WHERE "${options.foreignKeyName}" = ANY($1::int[])`,
              recordIds,
            );
          }
        } catch (err) {
          console.error(`Link cleanup failed for field ${linkField.id}:`, err);
        }

        if (options.foreignTableId && options.symmetricFieldId) {
          try {
            await this.emitter.emitAsync('recalc.triggerRecalculation', {
              tableId: options.foreignTableId,
              baseId,
              changedFieldIds: [typeof options.symmetricFieldId === 'string' ? parseInt(options.symmetricFieldId, 10) : options.symmetricFieldId],
              changedRecordIds: [],
            }, prisma);
          } catch (err) {
            console.error('Cascade recalc failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('cleanupLinksOnDelete failed:', err);
    }
  }

  async updateRecordsStatus(
    updateRecodStatusPayload: UpdateRecordsStatusDTO,
    prisma: Prisma.TransactionClient,
    user_id?: string,
  ) {
    const { tableId, baseId, viewId, records } = updateRecodStatusPayload;

    let ids = '';
    if (!this.lodash.isEmpty(records)) {
      const record_ids = records.map(
        (record: UpdateRecordStatusDTO) => record.__id,
      );
      ids = record_ids.join(', ');
    }

    let dbName: string;

    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );

      dbName = result[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }

    if (!dbName) {
      throw new NotFoundException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    let recordSnapshots: any[] = [];
    try {
      let snapshotQuery = `SELECT * FROM "${schemaName}".${tableName} WHERE __status = 'active'`;
      if (ids) {
        snapshotQuery += ` AND __id IN (${ids})`;
      }
      recordSnapshots = await prisma.$queryRawUnsafe(snapshotQuery);
    } catch (error) {
      this.logger.error('Failed to fetch record snapshots before delete', { error });
    }

    // Adjust query depending on whether ids are provided
    let query = `
      UPDATE "${schemaName}".${tableName}
      SET __status = 'inactive',
      "__last_modified_time" = '${new Date().toISOString()}'
      WHERE __status = 'active'
    `;

    if (ids) {
      query += ` and __id IN (${ids})`;
    }

    query += ' RETURNING __id, __status';

    console.log('query::', query);

    const deleteRecordIds: number[] = ids
      ? ids.split(', ').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id))
      : [];
    if (deleteRecordIds.length > 0) {
      await this.cleanupLinksOnDelete(tableId, baseId, deleteRecordIds, prisma);
    }

    try {
      const updated_records: any = await prisma.$queryRawUnsafe(query);

      if (recordSnapshots.length > 0) {
        try {
          const historyValues = recordSnapshots.map((snapshot) => {
            const recordId = snapshot.__id;
            const snapshotJson = JSON.stringify(snapshot);
            const changedByJson = user_id ? JSON.stringify({ id: user_id }) : null;
            return `(${recordId}, '__all__', NULL, '${snapshotJson.replace(/'/g, "''")}'::jsonb, NULL, 'delete', ${changedByJson ? `'${changedByJson.replace(/'/g, "''")}'::jsonb` : 'NULL'}, CURRENT_TIMESTAMP)`;
          });

          const historyInsertQuery = `
            INSERT INTO "${schemaName}".${tableName}_history
              (record_id, field_id, field_name, before_value, after_value, action, changed_by, changed_at)
            VALUES ${historyValues.join(', ')}
          `;
          await prisma.$queryRawUnsafe(historyInsertQuery);
        } catch (historyError) {
          this.logger.error('Failed to log delete history', { error: historyError });
        }
      }

      // Cancel time-based triggers for deleted records
      for (const record of updated_records) {
        await this.emitter.emitAsync(
          'timeBasedTrigger.cancelScheduledTriggersForRecord',
          {
            tableId,
            recordId: record.__id,
          },
          prisma,
        );
      }

      await this.handleDataStreamAndQueueJob(
        tableId,
        baseId,
        viewId,
        updated_records,
        'delete_record',
        prisma,
        [], // No field updates for delete
      );

      // Socket emission for deleted records
      this.emitter.emit(
        'emit_deleted_records',
        updated_records,
        tableId,
        baseId,
      );

      return updated_records;
    } catch (error) {
      throw new BadRequestException('Could not Delete the Records');
    }
  }

  async updateRecordsByFilters(
    payload: UpdateRecordByFiltersDTO,
    prisma: Prisma.TransactionClient,
    is_http: boolean = false,
  ) {
    const {
      tableId,
      baseId,
      viewId,
      fields_info = [],
      is_single_update = false,
      is_delete = false,
      manual_filters,
      state,
    } = payload;

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName: string = result[0]; // Assuming the first element of the array is the database name

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    let update_set_clauses: string = '';

    // create payload for
    const get_records_payload: GetRecordsPayloadDTO = {
      tableId,
      baseId,
      viewId,
      should_stringify: true,
      manual_filters,
      state,
    };

    if (is_single_update) {
      get_records_payload.limit = 1;
    }

    const { fields = [], records = [] } = await this.getRecords(
      get_records_payload,
      prisma,
    );

    // Create field type mapping
    const fieldTypeMap: Record<string, string> = {};
    fields.forEach((field) => {
      let dbFieldType: string;
      if (TYPE_MAPPING[field.type]) {
        dbFieldType = TYPE_MAPPING[field.type];
      } else {
        dbFieldType = TYPE_MAPPING['UNKNOWN'];
      }
      fieldTypeMap[field.dbFieldName] = dbFieldType;
    });

    // Transform fields_info to use dbFieldName instead of field_id
    const transformed_fields_info = fields_info.map((field_info) => {
      const field = fields.find((f) => f.id === field_info.field_id);
      return {
        dbFieldName: field?.dbFieldName || '',
        field_id: field_info.field_id,
        data: field_info.data,
      };
    });

    const formula_recalculation_payload = records.map((record) => {
      return {
        row_id: record.__id,
        fields_info: transformed_fields_info,
      };
    });

    const formulaResult = await this.handleFormulaRecalculation(
      tableId,
      baseId,
      formula_recalculation_payload,
      prisma,
    );

    if (is_delete) {
      // update_set_clauses.push(`"__status" = 'inactive'`);
      const delete_update_payload = records.map((record) => ({
        row_id: record.__id,
        fields_info: [{ dbFieldName: '__status', data: 'inactive' }],
      }));

      update_set_clauses = this.createUpdateSetClause(
        delete_update_payload,
        true,
        '*',
        fieldTypeMap, // Add fieldTypeMap
      );
    } else {
      const field_ids: number[] = [];
      fields_info.forEach((field) => {
        field_ids.push(Number(field?.field_id));
      });

      // Create update payload that includes both original fields and formula results
      const merged_update_payload = formula_recalculation_payload.map(
        (originalPayload) => {
          const formulaResultForRow = formulaResult?.find(
            (result) => result.row_id === originalPayload.row_id,
          );

          return {
            row_id: originalPayload.row_id,
            fields_info: [
              ...originalPayload.fields_info,
              ...(formulaResultForRow?.fields_info || []),
            ],
          };
        },
      );

      // Get only the SET clause for use in different query structures
      update_set_clauses = this.createUpdateSetClause(
        merged_update_payload,
        true, // return_updated
        '', // return_clause
        fieldTypeMap, // Add fieldTypeMap
      );
    }

    // Extract field IDs for time-based triggers
    const updatedFieldIdsForTriggers = fields_info.map((f) =>
      Number(f.field_id),
    );

    //   No records to update so return empty array
    if (this.lodash.isEmpty(update_set_clauses)) {
      return [];
    }

    let update_query: string = ``;
    update_query = `UPDATE "${schemaName}".${tableName} ${update_set_clauses}`;
    console.log('update_query---', update_query);

    try {
      const updated_records: any[] = await prisma.$queryRawUnsafe(update_query);

      if (!is_delete && records.length > 0) {
        try {
          const beforeRecordsForHistory = records.map((record) => {
            const beforeRecord: any = { __id: record.__id };
            fields.forEach((f) => {
              beforeRecord[f.dbFieldName] = record[f.id] !== undefined ? record[f.id] : record[f.dbFieldName];
            });
            return beforeRecord;
          });

          const historyPayload = formula_recalculation_payload.map(
            (originalPayload) => {
              const formulaResultForRow = formulaResult?.find(
                (result) => result.row_id === originalPayload.row_id,
              );
              return {
                row_id: originalPayload.row_id,
                fields_info: [
                  ...originalPayload.fields_info,
                  ...(formulaResultForRow?.fields_info || []),
                ],
              };
            },
          );

          await this.logUpdateHistory({
            schemaName,
            tableName,
            beforeRecords: beforeRecordsForHistory,
            updatedPayload: historyPayload,
            fields,
            userId: (payload as any).user_id,
            prisma,
          });
        } catch (error) {
          this.logger.error('Error logging update history in updateRecordsByFilters', { error });
        }
      }

      await this.handleDataStreamAndQueueJob(
        tableId,
        baseId,
        viewId,
        updated_records,
        'update_record',
        prisma,
        updatedFieldIdsForTriggers,
      );

      // Handle delete case - emit deleted records with only __id and __status
      if (is_delete) {
        const deleted_records_for_emission = updated_records.map((record) => ({
          __id: record.__id,
          __status: record.__status,
        }));

        // Socket emission for deleted records
        await this.emitter.emitAsync(
          'emit_deleted_records',
          deleted_records_for_emission,
          tableId,
          baseId,
        );

        // Return the filtered records for delete operations
        return deleted_records_for_emission;
      }

      // Process fields_info once outside the loop for non-delete updates
      let processed_fields_info = fields_info;

      if (is_http && !is_delete) {
        processed_fields_info = this.recordUtils.getStringifyFieldsInfo({
          fields_info,
        });
      }

      const update_record_emission: any = [];

      for (let i = 0; i < updated_records.length; i++) {
        const record = updated_records[i];

        // Start with processed fields_info for this record
        const record_fields_info = [...processed_fields_info];

        // Add formula results for this specific record
        if (formulaResult && formulaResult.length > 0) {
          const recordFormulaResult = formulaResult.find(
            (result) => result.row_id === record.__id,
          );

          if (recordFormulaResult) {
            recordFormulaResult.fields_info.forEach((formulaField) => {
              // Find the field to get field_id for emission
              const field = fields.find(
                (fieldElement) =>
                  fieldElement.dbFieldName === formulaField.dbFieldName,
              );

              if (field) {
                record_fields_info.push({
                  field_id: field.id,
                  data: formulaField.data,
                });
              }
            });
          }
        }

        const row = {
          row_id: record?.__id,
          fields_info: record_fields_info,
        };

        update_record_emission.push(row);
      }

      // I want to emit the same to the frontend
      await this.emitter.emitAsync(
        'emitUpdatedRecord',
        update_record_emission,
        tableId,
        baseId,
      );

      return updated_records;
    } catch (error) {
      throw new BadRequestException(`Could not update the records`);
    }
  }

  async updateRecordOrders(
    payload: updateRowOrderDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { baseId, tableId, viewId, moved_rows, order_info } = payload;

    const correct_order_payload = {
      tableId,
      baseId,
      viewId,
      order_info,
    };
    const correct_order = await this.getCorrectRowOrder(
      correct_order_payload,
      prisma,
    );

    const { order, is_above } = order_info;
    let case_statement: string = '';
    const ids: string[] = [];
    let left_most: number;
    let right_most: number;
    let new_order: number;

    if (is_above) {
      left_most = correct_order;
      right_most = order;
    } else {
      left_most = order;
      right_most = correct_order;
    }

    const moved_records_length = moved_rows.length;

    if (is_above) {
      for (let i = 0; i < moved_records_length; i++) {
        const { __id } = moved_rows[i];
        if (i === 0) {
          new_order = left_most;
        } else {
          new_order = (left_most + right_most) / 2;
          left_most = new_order;
        }

        case_statement += `WHEN __id = ${__id} THEN ${new_order} `;
        ids.push(__id.toString());
      }
    } else {
      for (let i = moved_records_length - 1; i >= 0; i--) {
        const { __id } = moved_rows[i];
        if (i === moved_records_length - 1) {
          new_order = right_most;
        } else {
          new_order = (left_most + right_most) / 2;
          right_most = new_order;
        }

        case_statement += `WHEN __id = ${__id} THEN ${new_order} `;
        ids.push(__id.toString());
      }
    }

    const column_name = ` _row_view${viewId} = CASE`;
    const update_query = `UPDATE "${baseId}".${tableId} SET ${column_name} ${case_statement} END where __id in (${ids.join(', ')})`;

    console.log('update_query::', update_query);

    try {
      await prisma.$queryRawUnsafe(update_query);

      const get_records_payload = {
        tableId,
        baseId,
        viewId,
        should_stringify: true,
      };
      const records = await this.getRecords(get_records_payload, prisma);

      await this.emitter.emitAsync('emit_get_records', records, tableId);

      return moved_rows;
    } catch (error) {
      throw new BadRequestException(`Could not update the row Order ${error}`);
    }
  }

  async getCorrectRowOrder(
    payload: GetCorrectRowOrderDTO,
    prisma: Prisma.TransactionClient,
  ): Promise<number> {
    const { tableId, baseId, viewId, order_info } = payload;
    const { is_above, __id } = order_info;

    const order_row_column_name = `_row_view${viewId}`;
    const schematableName = `"${baseId}".${tableId}`;

    const query = `
          WITH main_record AS (
            SELECT "${order_row_column_name}" AS main_value
            FROM ${schematableName}
            WHERE __id = ${__id}
          ),
          neighboring_records AS (
            SELECT "${order_row_column_name}" AS neighbor_value
            FROM ${schematableName}
            WHERE "${order_row_column_name}" ${is_above ? '<' : '>'} (
              SELECT main_value FROM main_record
            )
            ORDER BY "${order_row_column_name}" ${is_above ? 'DESC' : 'ASC'}
            LIMIT 1
          )
          SELECT main_value, neighbor_value
          FROM main_record
          LEFT JOIN neighboring_records
          ON TRUE
        `;

    const result: any = await prisma.$queryRawUnsafe(query);

    const columnValue = result[0]?.main_value;
    const neighborValue = result[0]?.neighbor_value;

    let record_order: number;

    if (is_above) {
      if (neighborValue !== null) {
        record_order = (columnValue + neighborValue) / 2;
      } else {
        record_order = columnValue / 2; // Adjust as necessary
      }
    } else {
      if (neighborValue !== null) {
        record_order = (columnValue + neighborValue) / 2;
      } else {
        // Instead of manually doing columnValue + 1, fetch from the sequence
        const sequence_name = `_row_view${viewId}`;
        const sequence_schema = baseId;

        const sequence_query = `SELECT nextval('"${sequence_schema}"."${sequence_name}"') as next_order_value;`;
        const result: any = await prisma.$queryRawUnsafe(sequence_query);

        //   record_order = result[0]?.next_order_value;
        record_order = Number(result[0]?.next_order_value);
      }
    }

    return record_order;
  }

  async createMultipleRecords(
    payload: CreateMultipleRecordsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { records, columns, baseId, tableId, viewId } = payload;

    const column_names = columns.map((col) => `"${col}"`).join(', ');
    console.log('column_names::', column_names);

    // get fields with given tableId
    const fields_array = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );
    const fields = fields_array[0];

    const record = records[0];
    const field_types = {};

    Object.keys(record).forEach((column_name: string) => {
      const field = fields.find((field) => field.dbFieldName === column_name);
      if (!field) {
        throw new BadRequestException(`Field not found: ${column_name}`);
      }

      field_types[column_name] = TYPE_VALUE_MAPPING[field.type];
    });

    // NEW: Formula Recalculation Logic for Create Multiple Records
    const formulaResults =
      await this.handleFormulaRecalculationForMultipleRecords(
        tableId,
        baseId,
        records,
        columns,
        prisma,
      );

    // Merge formula results with original records
    const recordsWithFormulas = records.map((record, index) => {
      const formulaResult = formulaResults[index];
      if (formulaResult && formulaResult.fields_info.length > 0) {
        // Merge formula fields into the record
        const mergedRecord = { ...record };
        formulaResult.fields_info.forEach((formulaField) => {
          mergedRecord[formulaField.dbFieldName] = formulaField.data;
        });
        return mergedRecord;
      }
      return record;
    });

    // Update columns to include formula columns
    const allColumns = [...columns];
    if (formulaResults.length > 0 && formulaResults[0].fields_info.length > 0) {
      formulaResults[0].fields_info.forEach((formulaField) => {
        if (!allColumns.includes(formulaField.dbFieldName)) {
          allColumns.push(formulaField.dbFieldName);
          // Add field type for formula fields (default to string)
          field_types[formulaField.dbFieldName] = 'string';
        }
      });
    }

    const updated_column_names = allColumns.map((col) => `"${col}"`).join(', ');

    // Construct the value part of the query with formula results
    const value_part = recordsWithFormulas
      .map((record: any) => {
        // Construct value string for each record
        const values = allColumns
          .map((column: string) => {
            const data = record[column];
            const fieldType = field_types[column] || 'string';

            let formatted_data: any;

            switch (fieldType) {
              case 'string':
                formatted_data = data
                  ? `'${data.replace(/'/g, "''")}'`
                  : 'NULL';
                break;
              case 'number':
                if (data === null || data === undefined) {
                  formatted_data = 'NULL';
                } else {
                  const cleaned_data = String(data).replace(/,/g, '');
                  const parsed_number = Number(cleaned_data);
                  formatted_data = isNaN(parsed_number)
                    ? 'NULL'
                    : parsed_number;
                }
                break;
              case 'timestamptz':
                if (data) {
                  // validate_and_convert_date now returns ISO string format directly
                  // (YYYY-MM-DDTHH:mm:ssZ) which is compatible with PostgreSQL timestamptz
                  const validatedDate =
                    this.dateTimeUtils.validate_and_convert_date(data);
                  formatted_data = validatedDate
                    ? `'${validatedDate}'`
                    : 'NULL';
                } else {
                  formatted_data = 'NULL';
                }
                break;
              case 'array_of_strings':
                formatted_data = Array.isArray(data)
                  ? `'${JSON.stringify(data)}'`
                  : 'NULL';
                break;
              case 'array_of_objects':
              case 'object':
                formatted_data = data ? `'${JSON.stringify(data)}'` : 'NULL';
                break;
              default:
                formatted_data = data
                  ? `'${data.replace(/'/g, "''")}'`
                  : 'NULL';
            }

            return formatted_data;
          })
          .join(', ');

        return `(${values})`;
      })
      .join(', ');

    // Construct the final SQL query
    const insert_query = `
      WITH inserted AS (
        INSERT INTO "${baseId}".${tableId} (${updated_column_names})
        VALUES ${value_part}
        RETURNING *
      )
      SELECT * FROM inserted;
    `;

    console.log('insert_query-->>', insert_query);
    let result;

    try {
      result = await prisma.$queryRawUnsafe(insert_query);
    } catch (error) {
      console.log('error->>', error);
      throw new BadRequestException('Could not insert the records');
    }

    try {
      const historyRows: string[] = [];
      for (const insertedRecord of result) {
        const recId = Number(insertedRecord.__id);
        for (const column of columns) {
          const field = fields.find((f) => f.dbFieldName === column);
          if (!field) continue;
          const value = insertedRecord[column] ?? insertedRecord[field.id];
          const fieldId = escapeSqlValue(String(field.id));
          const fieldName = escapeSqlValue(field.name || '');
          const afterValue = value !== null && value !== undefined
            ? `'${escapeSqlValue(JSON.stringify(value))}'::jsonb`
            : 'NULL';
          historyRows.push(
            `(${recId}, '${fieldId}', '${fieldName}', NULL, ${afterValue}, 'create', NULL, CURRENT_TIMESTAMP)`,
          );
        }
      }
      if (historyRows.length > 0) {
        const historyInsertQuery = `
          INSERT INTO "${baseId}".${tableId}_history
            (record_id, field_id, field_name, before_value, after_value, action, changed_by, changed_at)
          VALUES ${historyRows.join(', ')}
        `;
        await prisma.$queryRawUnsafe(historyInsertQuery);
      }
    } catch (error) {
      this.logger.error('Failed to log create history entries for multiple records', { error });
    }

    // For record creation, pass only payload column field IDs
    // (TIME_BASED triggers are filtered inside handleDataStreamAndQueueJob)
    const payloadFieldIdsForTriggers = columns
      .map((column) => fields.find((f) => f.dbFieldName === column)?.id)
      .filter((id): id is number => typeof id === 'number');

    await this.handleDataStreamAndQueueJob(
      tableId,
      baseId,
      viewId,
      result,
      'create_record',
      prisma,
      payloadFieldIdsForTriggers,
    );

    return result;
  }

  /**
   * Handles formula recalculation for multiple records in create mode
   */
  private async handleFormulaRecalculationForMultipleRecords(
    tableId: string,
    baseId: string,
    records: any[],
    columns: string[],
    prisma: Prisma.TransactionClient,
  ): Promise<
    { row_id?: number; fields_info: { dbFieldName: string; data: any }[] }[]
  > {
    try {
      // NEW: Always get ALL formula fields, not just dependent ones
      const [allFormulaFields]: field[][] = await this.emitter.emitAsync(
        'field.getAllFormulaFields',
        tableId,
        prisma,
      );

      const formulaColumnsToRecalculate: string[] = allFormulaFields.map(
        (field: field) => field.dbFieldName,
      );

      if (formulaColumnsToRecalculate.length === 0) {
        return [];
      }

      // Get execution order for formula columns
      const executionOrder =
        await this.formulaRecalculator.getFormulaExecutionOrder(
          tableId,
          formulaColumnsToRecalculate,
          prisma,
        );

      const allFormulaResults: {
        row_id?: number;
        fields_info: { dbFieldName: string; data: any }[];
      }[] = [];

      // Process each record
      for (const record of records) {
        // For create operations, use the record data as current data
        const currentRecordData: Record<string, any> = {};
        columns.forEach((column) => {
          currentRecordData[column] = record[column];
        });

        // Create updatedRecordData from the record fields
        const updatedRecordData: Record<string, any> = {};
        columns.forEach((column) => {
          updatedRecordData[column] = record[column];
        });

        // Calculate formula values using the record data
        const formulaResults =
          await this.formulaRecalculator.calculateFormulaValues(
            tableId,
            baseId,
            executionOrder,
            currentRecordData,
            updatedRecordData,
            prisma,
            undefined, // No row_id for create operations
          );

        // Transform the formula results to the desired format
        const fields_info: { dbFieldName: string; data: any }[] = [];
        formulaResults.forEach((result) => {
          fields_info.push({
            dbFieldName: result.columnName,
            data: result.value,
          });
        });

        allFormulaResults.push({
          fields_info,
        });
      }

      return allFormulaResults;
    } catch (error) {
      console.error(
        'Error in formula recalculation for multiple records:',
        error,
      );
      // Return empty array to avoid breaking the main create flow
      return [];
    }
  }

  getDeletedFieldName(dbFieldName: string): string {
    // Trim the field name to avoid leading/trailing spaces
    const trimmedFieldName = dbFieldName.trim();

    // Define the prefix for deleted fields
    const prefix = 'del_';

    // Get the current timestamp in a format suitable for naming
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]; // Format: YYYYMMDDTHHMMSS

    // Calculate the maximum length available for the trimmed field name
    const maxLength = 63;
    const availableLength = maxLength - (prefix.length + timestamp.length + 1); // +1 for the underscore

    // Trim the field name if necessary to fit within the maximum length
    const finalFieldName =
      availableLength > 0 ? trimmedFieldName.slice(0, availableLength) : '';

    // Create the deleted field name
    const deletedFieldName = `${prefix}${finalFieldName}_${timestamp}`;

    return deletedFieldName;
  }

  async renameColumn(
    payload: RenameColumnDto,
    prisma: Prisma.TransactionClient,
  ): Promise<string> {
    const { current_name, future_name, baseId, tableId } = payload;

    // Construct the SQL query
    const query = `ALTER TABLE "${baseId}".${tableId} RENAME COLUMN "${current_name}" TO "${future_name}";`;

    try {
      // Execute the query using the Prisma client
      await prisma.$executeRawUnsafe(query);
      return 'Renamed Successfully';
    } catch (error) {
      console.error('Error renaming column:', error);
      throw new BadRequestException(`Failed to rename column`);
    }
  }

  createUpdateSetClause(
    payload: {
      row_id: number;
      fields_info: { dbFieldName: string; data: any }[];
    }[],
    return_updated: boolean = false,
    return_clause: string = '',
    fieldTypeMap: Record<string, string>,
    skipLastModifiedTime: boolean = false,
  ): string {
    const updates = new Map<string, string[]>();
    const ids = new Set<number>();

    payload.forEach((item) => {
      const rowId = item.row_id;
      ids.add(rowId);

      item.fields_info.forEach((field) => {
        const columnName = field.dbFieldName;
        let value = field.data;
        const fieldType = fieldTypeMap?.[columnName] || 'TEXT'; // Get field type, default to text

        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (typeof value === 'number' && isNaN(value))
        ) {
          value = 'NULL';
        } else if (typeof value === 'string') {
          // Check if it's a JSON string (array or object)
          if (this.isJsonString(value) && fieldType === 'JSONB') {
            // Use escapeSqlValue for consistent escaping
            const escapedJsonString = escapeSqlValue(value);
            value = `'${escapedJsonString}'::jsonb`;
          } else {
            // Default to text for all other types
            const escapedString = escapeSqlValue(value);
            value = `'${escapedString}'`;
          }
        } else if (typeof value === 'object') {
          if (fieldType === 'JSONB') {
            const jsonString = JSON.stringify(value);
            // Use escapeSqlValue for consistent escaping
            const escapedJsonString = escapeSqlValue(jsonString);
            value = `'${escapedJsonString}'::jsonb`;
          } else {
            const escapedString = escapeSqlValue(JSON.stringify(value));
            value = `'${escapedString}'`;
          }
        } else {
          // Handle any other type (numbers, booleans, etc.) by converting to string
          const escapedString = escapeSqlValue(String(value));
          value = `'${escapedString}'`;
        }

        if (!updates.has(columnName)) {
          updates.set(columnName, []);
        }
        updates.get(columnName)?.push(`WHEN __id = ${rowId} THEN ${value}`);
      });
    });

    // Check if there are any valid IDs to update
    if (ids.size === 0) {
      // Return an empty string or a placeholder that indicates no updates needed
      return '';
    }

    // Add the __last_modified_time update to the set clause
    if (!skipLastModifiedTime) {
      const current_time = new Date().toISOString(); // Get the current timestamp in ISO format
      // Correctly generate the CASE statement for __last_modified_time
      const last_modified_time = Array.from(ids)
        .map((id) => `WHEN __id = ${id} THEN '${current_time}'`)
        .join(' ');

      // Add the correct CASE statement to the updates map
      updates.set('__last_modified_time', [`${last_modified_time}`]);
    }

    // Construct the SET clause using the unique column updates
    const setClause = Array.from(updates.entries())
      .map(([columnName, cases]) => {
        return `"${columnName}" = CASE ${cases.join(' ')} ELSE "${columnName}" END`;
      })
      .join(', ');

    const idList = Array.from(ids).join(', ');

    // Build the final returning clause
    const returning_clause = return_updated
      ? return_clause
        ? `RETURNING ${return_clause}`
        : 'RETURNING *'
      : '';

    // Return the constructed query without the table name
    return `SET ${setClause} WHERE __id IN (${idList}) AND "__status" = 'active' ${returning_clause}`;
  }

  // Update the isJsonString method to be more specific
  private isJsonString(str: string): boolean {
    try {
      const parsed = JSON.parse(str);
      // Only return true if it's an array or object (not primitive values)
      return (
        Array.isArray(parsed) || (typeof parsed === 'object' && parsed !== null)
      );
    } catch {
      return false;
    }
  }

  async createDuplicateRecords(payload: any, prisma: Prisma.TransactionClient) {
    const { new_base_id, old_base_id, new_table_id, old_table_id } = payload;

    const [old_fields] = await this.emitter.emitAsync(
      'field.getFields',
      old_table_id,
      prisma,
    );

    console.log('old_fields-->>', old_fields);

    const [new_fields] = await this.emitter.emitAsync(
      'field.getFields',
      new_table_id,
      prisma,
    );

    console.log('new_fields-->>', new_fields);

    const db_field_name_mapping: Record<string, string> = {};

    const old_fieled_id_mapping: Record<string, string> = old_fields.reduce(
      (acc, field) => {
        acc[field.id] = field.dbFieldName;
        return acc;
      },
      {},
    );

    new_fields.forEach((field) => {
      if (old_fieled_id_mapping[field.source_id]) {
        db_field_name_mapping[field.dbFieldName] =
          old_fieled_id_mapping[field.source_id];
      } else {
        throw new BadRequestException('Could Not Field to inser the data');
      }
    });

    const get_views_payload = {
      baseId: new_base_id,
      tableId: new_table_id,
    };

    const [views] = await this.emitter.emitAsync(
      'view.getViews',
      get_views_payload,
      prisma,
    );

    views.forEach((view) => {
      db_field_name_mapping[`_row_view${view.id}`] =
        `_row_view${view.source_id}`;
    });

    const same_columns = [
      '__id',
      '__status',
      '__created_by',
      '__last_updated_by',
      '__created_time',
      '__last_modified_time',
      '__auto_number',
      '__version',
    ];

    // Generate dynamic column names for the new table (the target columns)
    const new_columns = [
      ...same_columns, // include static columns
      ...Object.keys(db_field_name_mapping), // dynamic columns from new table
    ]
      .map((col) => `"${col}"`)
      .join(', ');

    // Now modify the SELECT part of the query to replace __created_time and __last_modified_time
    // with CURRENT_TIMESTAMP in the query
    const select_values = [
      ...same_columns.map((col) => {
        if (col === '__created_time' || col === '__last_modified_time') {
          return 'CURRENT_TIMESTAMP'; // Use CURRENT_TIMESTAMP for these columns
        }
        return col; // Keep the rest unchanged
      }),
      ...Object.values(db_field_name_mapping).map((col) => `"${col}"`), // dynamic columns from the old table
    ].join(', ');

    // Build the complete INSERT INTO SELECT query
    const insert_query = `
    INSERT INTO "${new_base_id}".${new_table_id} (${new_columns})
    SELECT ${select_values} 
    FROM "${old_base_id}".${old_table_id};
  `;

    // Log or return the generated query for testing/debugging
    console.log('Generated Insert Query:', insert_query);

    try {
      await prisma.$queryRawUnsafe(insert_query);
      return {
        message: 'Records successfully duplicated to the new table',
      };
    } catch (e) {
      throw new BadRequestException('Could Not Insert the records');
    }
  }

  /**
   * Filter field IDs to only include timestamp field types (DATE, CREATED_TIME, etc.)
   * This ensures we only process time-based triggers for relevant fields
   */
  private async filterTimestampFieldIds(
    fieldIds: number[],
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<number[]> {
    if (fieldIds.length === 0) {
      return [];
    }

    const TIMESTAMP_FIELD_TYPES = [
      QUESTION_TYPE.DATE,
      QUESTION_TYPE.CREATED_TIME,
    ];

    // Get field metadata
    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      { ids: fieldIds },
      prisma,
    );

    if (!fields || fields.length === 0) {
      return [];
    }

    // Filter to only timestamp field types
    const timestampFieldIds = fields
      .filter(
        (field) =>
          field.status === 'active' &&
          TIMESTAMP_FIELD_TYPES.includes(field.type as QUESTION_TYPE),
      )
      .map((field) => field.id);

    return timestampFieldIds;
  }

  async handleDataStreamAndQueueJob(
    tableId: string,
    baseId: string,
    viewId: string,
    results: Record<string, any>[], // Define type as per your data
    eventType: string, // Accept event type as a parameter
    prisma: Prisma.TransactionClient,
    updatedFieldIds: number[] = [], // Track which fields were updated
  ) {
    const data_stream_payload = {
      tableId,
      isStreaming: true,
    };

    // Get data streams for the table first
    const [data_streams] = await this.emitter.emitAsync(
      'table.getDataStream',
      data_stream_payload,
      prisma,
    );

    if (!data_streams?.length) {
      return; // No data streams, nothing to process
    }

    // Separate time-based and event-based data streams
    const timeBasedDataStreams = data_streams.filter(
      (ds) => ds.triggerType === 'TIME_BASED',
    );
    const eventBasedDataStreams = data_streams.filter(
      (ds) => ds.triggerType !== 'TIME_BASED',
    );

    // Process event-based triggers
    if (eventBasedDataStreams.length > 0) {
      for (const data_stream of eventBasedDataStreams) {
        // Ensure eventType exists in dataStream.eventType array
        if (
          !Array.isArray(data_stream.eventType) ||
          !(data_stream.eventType as string[]).includes(eventType)
        ) {
          continue;
        }

        for (const result of results) {
          const job_payload = {
            baseId,
            tableId,
            viewId,
            __id: result.__id,
            event_type: eventType,
            data_stream_id: data_stream.id,
          };

          // Emit the record on status APIs
          await this.emitter.emitAsync('bullMq.enqueueJob', {
            jobName: 'watch_records',
            data: job_payload,
            options: {
              delay: 2000,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          });
        }
      }
    }

    // Process time-based triggers only if TIME_BASED data streams exist
    if (timeBasedDataStreams.length > 0) {
      // Filter updatedFieldIds to only include timestamp field types
      // Only do this if we have TIME_BASED triggers to process
      const timestampFieldIds = await this.filterTimestampFieldIds(
        updatedFieldIds,
        tableId,
        prisma,
      );

      // Extract record IDs from results
      const recordIds = results
        .map((result) => result.__id)
        .filter((id): id is number => id !== undefined && id !== null);

      if (recordIds.length > 0) {
        await this.emitter.emitAsync(
          'timeBasedTrigger.handleTimeBasedTriggers',
          {
            tableId,
            baseId,
            recordIds,
            eventType,
            updatedFieldIds: timestampFieldIds,
          },
          prisma,
        );
      }
    }
  }

  async getTableColumns(
    schemaName: string,
    tableName: string,
    prisma: Prisma.TransactionClient,
  ) {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = '${schemaName}' 
      AND table_name = '${tableName}';
    `;

    const result: any[] = await prisma.$queryRawUnsafe(query);

    return result.map((row: any) => row.column_name);
  }

  async updateRecordsByFiltersV2(
    payload: UpdateRecordByFiltersDTO,
    prisma: Prisma.TransactionClient,
    is_http: boolean = false,
  ) {
    const {
      tableId,
      baseId,
      viewId,
      fields_info = [],
      is_single_update = false,
      is_delete = false,
      manual_filters,
      state,
    } = payload;

    const result: any[] = await this.emitter.emitAsync(
      'table.getDbName',
      tableId,
      baseId,
      prisma,
    );

    const dbName: string = result[0]; // Assuming the first element of the array is the database name

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    let update_set_clauses: string = '';

    const get_records_payload: GetRecordsPayloadDTO = {
      tableId,
      baseId,
      viewId,
      should_stringify: true,
      manual_filters,
      state,
    };

    if (is_single_update) {
      get_records_payload.limit = 1;
    }

    const { fields = [], records = [] } = await this.getRecords(
      get_records_payload,
      prisma,
    );

    // Transform fields_info to use dbFieldName instead of field_id
    const transformed_fields_info = fields_info.map((field_info) => {
      const field = fields.find((f) => f.id === field_info.field_id);
      return {
        dbFieldName: field?.dbFieldName || '',
        field_id: field_info.field_id,
        data: field_info.data,
      };
    });

    const formula_recalculation_payload = records.map((record) => {
      return {
        row_id: record.__id,
        fields_info: transformed_fields_info,
      };
    });

    const formulaResult = await this.handleFormulaRecalculation(
      tableId,
      baseId,
      formula_recalculation_payload,
      prisma,
    );

    let updateSetClausePayload: any;

    if (is_delete) {
      const delete_update_payload = records.map((record) => ({
        row_id: record.__id,
        fields_info: [{ dbFieldName: '__status', data: 'inactive' }],
      }));

      updateSetClausePayload = delete_update_payload;
    } else {
      const field_ids: number[] = [];
      fields_info.forEach((field) => {
        field_ids.push(Number(field?.field_id));
      });

      // Create update payload that includes both original fields and formula results
      const merged_update_payload = formula_recalculation_payload.map(
        (originalPayload) => {
          const formulaResultForRow = formulaResult?.find(
            (result) => result.row_id === originalPayload.row_id,
          );

          return {
            row_id: originalPayload.row_id,
            fields_info: [
              ...originalPayload.fields_info,
              ...(formulaResultForRow?.fields_info || []),
            ],
          };
        },
      );

      updateSetClausePayload = merged_update_payload;
    }

    const field_db_field_name_to_id_mapping = {};
    const filed_id_to_field_mapping = {};
    const fieldTypeMap: Record<string, string> = {};

    // Map column names to their aliases
    fields.forEach((field) => {
      field_db_field_name_to_id_mapping[field.dbFieldName] = field.id;
      filed_id_to_field_mapping[field.id] = field;
      fieldTypeMap[field.dbFieldName] = TYPE_MAPPING[field.type];
    });

    const alias_mappings = [
      '__id',
      '__status',
      '__created_by',
      '__last_updated_by',
      '__created_time',
      '__last_modified_time',
    ];

    Object.entries(field_db_field_name_to_id_mapping).forEach(
      ([dbFieldName, alias]) => {
        alias_mappings.push(`"${dbFieldName}" AS "${alias}"`);
      },
    );

    update_set_clauses = this.createUpdateSetClause(
      updateSetClausePayload,
      true,
      alias_mappings.join(', '),
      fieldTypeMap,
    );

    if (this.lodash.isEmpty(update_set_clauses)) {
      return [];
    }

    // Construct update query
    let update_query = ``;
    update_query = `UPDATE "${schemaName}".${tableName} ${update_set_clauses}`;
    console.log('update_query in v2 ->>', update_query);

    try {
      const updated_records: any[] = await prisma.$queryRawUnsafe(update_query);

      const updatedFieldIdsForTriggers = fields_info.map(
        (field: any) => field.field_id,
      );

      await this.handleDataStreamAndQueueJob(
        tableId,
        baseId,
        viewId,
        updated_records,
        'update_record',
        prisma,
        updatedFieldIdsForTriggers,
      );

      const update_record_emission: any = [];

      let updated_fields_info = fields_info;

      const [view] = await this.emitter.emitAsync(
        'view.getViewById',
        viewId,
        prisma,
      );

      if (
        !this.lodash.isEmpty(view.filter) ||
        !this.lodash.isEmpty(view.sort?.sortObjs)
      ) {
        const get_records_payload = {
          tableId,
          baseId,
          viewId,
          should_stringify: true,
        };
        const records = await this.getRecords(get_records_payload, prisma);

        await this.emitter.emitAsync('emit_get_records', records, tableId);
      }

      if (is_http) {
        updated_fields_info = this.recordUtils.getStringifyFieldsInfo({
          fields_info,
        });
      }

      // NEW: Enhanced emission logic to include formula results
      for (let i = 0; i < updated_records.length; i++) {
        const record = updated_records[i];

        // Start with original fields_info for this record
        const record_fields_info = [...updated_fields_info];

        // Add formula results for this specific record
        if (formulaResult && formulaResult.length > 0) {
          const recordFormulaResult = formulaResult.find(
            (result) => result.row_id === record.__id,
          );

          if (recordFormulaResult) {
            recordFormulaResult.fields_info.forEach((formulaField) => {
              // Find the field to get field_id for emission
              const field = fields.find(
                (fieldElement) =>
                  fieldElement.dbFieldName === formulaField.dbFieldName,
              );

              if (field) {
                record_fields_info.push({
                  field_id: field.id,
                  data: formulaField.data,
                });
              }
            });
          }
        }

        const row = {
          row_id: record?.__id,
          fields_info: record_fields_info,
        };

        update_record_emission.push(row);
      }

      //  NEW: Add enrichment dependency checking
      if (!is_delete) {
        // Only check enrichments if we're not deleting records
        await this.handleEnrichmentDependencies(
          tableId,
          baseId,
          viewId,
          updateSetClausePayload,
          prisma,
        );

        // emit the same to the frontend
        await this.emitter.emitAsync(
          'emitUpdatedRecord',
          update_record_emission,
          tableId,
          baseId,
        );
      } else {
        const deleted_records_for_emission = updated_records.map((record) => ({
          __id: record.__id,
          __status: record.__status,
        }));

        await this.emitter.emitAsync(
          'emit_deleted_records',
          deleted_records_for_emission,
          tableId,
          baseId,
        );
      }

      return {
        fields: filed_id_to_field_mapping,
        records: updated_records,
      };
    } catch (error) {
      throw new BadRequestException(`Could not update the records`);
    }
  }

  async createRecordV2(
    payload: CreateRecordDTO,
    prisma: Prisma.TransactionClient,
    is_http: boolean = false,
  ) {
    const { baseId, tableId, viewId, fields_info = [] } = payload;

    const get_table_payload = {
      tableId,
      is_view_required: 'true',
      baseId,
    };

    const [table] = await this.emitter.emitAsync(
      'table.getTable',
      get_table_payload,
      prisma,
    );

    const dbName: string = table.dbTableName;
    const views: any[] = table.views;

    const view = views.find((view) => view.id === viewId);

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    if (!view) {
      throw new BadRequestException(
        `No view of table with given View id ${viewId}`,
      );
    }

    const { schemaName, tableName } =
      this.recordUtils.getSchemaAndTable(dbName);

    const order_row_column_name: string = `_row_view${viewId}`;

    const [fields] = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    // Create field type mapping
    const fieldTypeMap: Record<string, string> = {};
    fields.forEach((field) => {
      let dbFieldType: string;
      if (TYPE_MAPPING[field.type]) {
        dbFieldType = TYPE_MAPPING[field.type];
      } else {
        dbFieldType = TYPE_MAPPING['UNKNOWN'];
      }
      fieldTypeMap[field.dbFieldName] = dbFieldType;
    });

    const recordData: { [key: string]: any } = {
      __status: 'active',
    };

    const record_data = await this.recordUtils.processAndUpdateFields({
      fields,
      fields_info,
      prisma,
      tableId,
      baseId,
      viewId,
    });

    // Corrected merge syntax
    const updatedRecordData = { ...recordData, ...record_data };

    // NEW: Formula Recalculation Logic for Create Record V2
    // Transform fields_info to the format expected by handleFormulaRecalculation
    const createPayload = [
      {
        fields_info: fields_info.map((field_info) => {
          const field = fields.find((f) => f.id === field_info.field_id);
          return {
            dbFieldName: field?.dbFieldName || '',
            data: field_info.data,
          };
        }),
      },
    ];

    const formulaResults = await this.handleFormulaRecalculation(
      tableId,
      baseId,
      createPayload,
      prisma,
      true, // isCreateMode = true
    );

    // Merge formula results with the record data
    const finalRecordData = { ...updatedRecordData };
    if (formulaResults.length > 0 && formulaResults[0].fields_info) {
      formulaResults[0].fields_info.forEach((formulaField) => {
        finalRecordData[formulaField.dbFieldName] = formulaField.data;
      });
    }

    const schematableName = `"${schemaName}".${tableName} `;

    //   create alias mapping
    const column_alias_map = fields.reduce(
      (acc, field) => {
        const { dbFieldName, id } = field;
        acc[dbFieldName] = id; // Use dbFieldName as the key and name as the alias
        return acc;
      },
      {} as Record<string, string>,
    );

    const insert_query = this.generateInsertQuery(
      schematableName,
      finalRecordData, // Use finalRecordData instead of updatedRecordData
      column_alias_map,
      false,
      order_row_column_name,
      fieldTypeMap,
    );

    console.log('insert_query-->>', insert_query);

    // throw new BadRequestException('throwing');
    let records: any[] = [];
    try {
      records = await prisma.$queryRawUnsafe(insert_query);

      if (records.length === 0) {
        throw new BadRequestException('Could not insert data into the record');
      }
    } catch (error) {
      throw new BadRequestException(`Could not insert data into the record`);
    }

    const createdFieldIdsForTriggers = fields_info.map(
      (field_info: any) => field_info.field_id,
    );

    // Extract __id using helper function to handle both cases (ID field exists or not)
    const recordId = this.extractRecordId(records[0], fields, column_alias_map);

    await this.logCreateHistoryEntries(
      schemaName,
      tableName,
      recordId,
      fields,
      fields_info,
      null,
      prisma,
    );

    await this.handleDataStreamAndQueueJob(
      tableId,
      baseId,
      viewId,
      [{ __id: recordId }],
      'create_record',
      prisma,
      createdFieldIdsForTriggers, // Pass payload field IDs so TIME_BASED triggers can evaluate relevant timestamp fields
    );

    // ✅ NEW: Add enrichment dependency checking for created record
    const createdRecordId = recordId;

    // Prepare payload for enrichment checking
    const enrichmentPayload = [
      {
        row_id: createdRecordId,
        fields_info: fields_info.map((field_info) => {
          const field = fields.find((f) => f.id === field_info.field_id);
          return {
            dbFieldName: field?.dbFieldName || '',
            data: field_info.data,
          };
        }),
      },
    ];

    // Add formula results to the enrichment payload
    if (formulaResults.length > 0 && formulaResults[0].fields_info) {
      enrichmentPayload[0].fields_info.push(...formulaResults[0].fields_info);
    }

    await this.handleEnrichmentDependencies(
      tableId,
      baseId,
      viewId,
      enrichmentPayload,
      prisma,
    );

    if (
      !this.lodash.isEmpty(view.filter) ||
      !this.lodash.isEmpty(view.sort?.sortObjs)
    ) {
      const get_records_payload = {
        tableId,
        baseId,
        viewId,
        should_stringify: true,
      };
      const records = await this.getRecords(get_records_payload, prisma);

      await this.emitter.emitAsync('emit_get_records', records, tableId);
    }

    if (is_http) {
      // Reverse mapping: Alias → Original Column Name
      const alias_to_original_map = Object.entries(column_alias_map).reduce<
        Record<string, string>
      >((acc, [original, alias]) => {
        acc[alias as string] = original;
        return acc;
      }, {});

      // STRINGIFY COMPLEX DATA TYPES FOR HTTP RESPONSE TO EMIT TO SHEETS
      const results = this.stringifyArrayValues(records);

      // Convert alias names back to original column names
      const originalResults = results.map((record) => {
        return Object.keys(record).reduce(
          (acc, alias) => {
            // Use alias_to_original_map, defaulting to alias itself if not found
            const originalColumn = alias_to_original_map[alias] || alias;

            acc[originalColumn] = record[alias];
            return acc;
          },
          {} as Record<string, any>,
        );
      });

      await this.emitter.emitAsync(
        'emitCreatedRow',
        originalResults,
        tableId,
        baseId,
      );
    }

    const filed_id_to_field_mapping = {};

    // Map column names to their aliases
    fields.forEach((field) => {
      filed_id_to_field_mapping[field.id] = field;
    });

    const respone = {
      fields: filed_id_to_field_mapping,
      records: records,
    };

    return respone;
  }

  async getRecordSummary(payload: any, prisma: Prisma.TransactionClient) {
    const { tableId, baseId } = payload;

    const get_records_count = `Select count(*) from "${baseId}".${tableId} where __status = 'active'`;

    try {
      const records_count: any =
        await prisma.$queryRawUnsafe(get_records_count);

      const response = {
        recordsCount: records_count[0].count,
      };

      return response;
    } catch (error) {
      throw new BadRequestException(`Could not get the record summary`);
    }
  }

  /**
   * Gets all dependent formula fields including transitive dependencies
   */
  getTransitiveDependentFields(
    dbFieldName: string,
    dependencyGraph: { [columnName: string]: string[] },
  ): string[] {
    const visited = new Set<string>();
    const dependentFields = new Set<string>();

    const findDependents = (targetField: string) => {
      if (visited.has(targetField)) return;
      visited.add(targetField);

      Object.keys(dependencyGraph).forEach((formulaField) => {
        if (dependencyGraph[formulaField].includes(targetField)) {
          dependentFields.add(formulaField);
          findDependents(formulaField); // Recursively find transitive dependents
        }
      });
    };

    findDependents(dbFieldName);
    return Array.from(dependentFields);
  }

  /**
   * UNIFIED: Migrates formula field data for all existing records in a table
   * This function handles both scenarios:
   * 1. New formula field creation (no dependencies to consider)
   * 2. Formula field expression update (may have dependent formula fields)
   *
   * @param payload - Contains field_id, baseId, tableId, viewId
   * @param prisma - Prisma transaction client
   */
  async migrateFormulaFieldData(
    payload: MigrateFormulaFieldDataDTO,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const { baseId, tableId, viewId, field_id } = payload;

    try {
      let fieldsToCalculate: string[] = [];
      let executionOrder: string[] = [];
      const fieldIdMapping: Record<string, number> = {};

      if (field_id) {
        // Step 1: Get the specific formula field and its expression
        const [fields] = await this.emitter.emitAsync(
          'field.getFieldsById',
          {
            ids: [field_id],
          },
          prisma,
        );

        const field = fields[0];

        if (!field || field.type !== 'FORMULA') {
          return;
        }

        const formulaColumnName = field.dbFieldName;

        // Step 2: Check if this field has dependent formula fields and get field mappings
        const [computedConfig] = await this.emitter.emitAsync(
          'table.getFormulaFieldConfig',
          tableId,
          prisma,
        );

        fieldsToCalculate = [formulaColumnName];
        executionOrder = [formulaColumnName];
        fieldIdMapping[formulaColumnName] = field.id;

        if (computedConfig?.dependencyGraph) {
          // Find all dependent formula fields using transitive dependency resolution
          const allDependentFields = this.getTransitiveDependentFields(
            formulaColumnName,
            computedConfig.dependencyGraph,
          );

          if (allDependentFields.length > 0) {
            // Get proper execution order for all affected fields
            const allAffectedFields = [
              ...allDependentFields,
              formulaColumnName,
            ];
            executionOrder =
              await this.formulaRecalculator.getFormulaExecutionOrder(
                tableId,
                allAffectedFields,
                prisma,
              );
            fieldsToCalculate = allAffectedFields;

            // Get all fields for this table
            const [allFields] = await this.emitter.emitAsync(
              'field.getFields',
              tableId,
              prisma,
            );

            // Build the field ID mapping for formula fields
            allFields.forEach((fieldInfo) => {
              if (
                fieldInfo.type === 'FORMULA' &&
                allDependentFields.includes(fieldInfo.dbFieldName)
              ) {
                fieldIdMapping[fieldInfo.dbFieldName] = fieldInfo.id;
              }
            });
          }
        }
      } else {
        // Get all fields for this table
        const [allFields] = await this.emitter.emitAsync(
          'field.getFields',
          tableId,
          prisma,
        );

        // Find all formula fields with hasError flag
        const erroredFormulaFields = allFields.filter(
          (field) =>
            field.type === 'FORMULA' &&
            field.computedFieldMeta &&
            (field.computedFieldMeta as any).hasError === true,
        );

        if (erroredFormulaFields.length === 0) {
          console.log('No errored formula fields found');
          return;
        }

        // Build field mappings for all errored fields
        erroredFormulaFields.forEach((field) => {
          fieldsToCalculate.push(field.dbFieldName);
          fieldIdMapping[field.dbFieldName] = field.id;
        });

        // Get execution order for all errored fields
        executionOrder =
          await this.formulaRecalculator.getFormulaExecutionOrder(
            tableId,
            fieldsToCalculate,
            prisma,
          );
      }

      // Step 3: Get all records in batches
      const getRecordPayload = {
        tableId: tableId,
        baseId: baseId,
        viewId: viewId,
        manual_filters: {}, // Empty to fetch all records
        should_stringify: true, // We need raw data for formula calculation
        is_field_required: false, // We don't need field metadata
        version: 1,
        skip_filters: true,
      };

      const response = await this.getRecords(getRecordPayload, prisma);
      const records = response.records || [];
      const fields = response.fields || [];

      // Step 4: Calculate formula values for each record using existing logic
      const updatePayloads: {
        row_id: number;
        fields_info: { dbFieldName: string; data: any }[];
      }[] = [];

      for (const record of records) {
        try {
          const row_id = record.__id;

          // Extract current record data (all fields except system fields)
          const currentRecordData: Record<string, any> = {};
          Object.keys(record).forEach((key) => {
            currentRecordData[key] = record[key];
          });

          // Empty updated data since we're not updating any existing fields
          const updatedRecordData: Record<string, any> = {};

          // Use the existing formula recalculation logic
          const formulaResults =
            await this.formulaRecalculator.calculateFormulaValues(
              tableId,
              baseId,
              executionOrder, // Calculate for all affected fields in proper order
              currentRecordData,
              updatedRecordData, // Empty since no fields are being updated
              prisma,
              row_id,
            );

          // Transform results to the expected format
          if (formulaResults.length > 0) {
            const fields_info = formulaResults
              .map((result) => {
                const fieldId = fieldIdMapping[result.columnName];
                if (!fieldId) {
                  console.warn(
                    `Field ID not found for column: ${result.columnName}`,
                  );
                  return null;
                }

                return {
                  field_id: fieldId, // Use correct field ID for each formula field
                  dbFieldName: result.columnName,
                  data: result.value,
                };
              })
              .filter(
                (
                  item,
                ): item is {
                  field_id: number;
                  dbFieldName: string;
                  data: any;
                } => item !== null,
              ); // Type-safe filter

            if (fields_info.length > 0) {
              updatePayloads.push({
                row_id,
                fields_info,
              });
            }
          }
        } catch (error) {
          console.error(
            `Error calculating formula for record ${record.__id}:`,
            error,
          );
          // Continue with other records
        }
      }

      // Create field type mapping
      const fieldTypeMap: Record<string, string> = {};

      fields.forEach((field) => {
        let dbFieldType: string;
        if (TYPE_MAPPING[field.type]) {
          dbFieldType = TYPE_MAPPING[field.type];
        } else {
          dbFieldType = TYPE_MAPPING['UNKNOWN'];
        }
        fieldTypeMap[field.dbFieldName] = dbFieldType;
      });

      // Step 5: Update database with calculated values
      if (updatePayloads.length > 0) {
        const update_set_clauses: string = this.createUpdateSetClause(
          updatePayloads,
          false,
          '',
          fieldTypeMap,
        );

        const update_query = `UPDATE "${baseId}".${tableId} ${update_set_clauses}`;

        console.log('update_query::->>', update_query);

        try {
          await prisma.$queryRawUnsafe(update_query);
        } catch (error) {
          console.log('error-->>', error);
          throw new Error(`Could not update the records`);
        }
      }

      // Step 6: Emit to frontend
      await this.emitter.emitAsync(
        'emitUpdatedRecord',
        updatePayloads,
        tableId,
        baseId,
      );
    } catch (error: any) {
      console.error('Error in unified formula field migration:', error);
      throw new BadRequestException(
        `Unified formula field migration failed: ${error.message}`,
      );
    }
  }

  async processEnrichment(payload: any, prisma: Prisma.TransactionClient) {
    const { tableId, baseId, viewId, id, enrichedFieldId } = payload;

    console.log('enrichedFieldId-->>', enrichedFieldId);

    const get_records_payload = {
      tableId,
      baseId,
      viewId,
      should_stringify: true,
      manual_filters: {},
      version: 1,
    };

    const manual_filters = {
      id: Date.now(),
      condition: 'and',
      childs: [
        {
          id: Date.now(),
          key: '__id',
          field: '__id',
          type: 'NUMBER',
          operator: {
            key: '=',
            value: 'is...',
          },
          value: id,
          valueStr: id,
        },
      ],
    };

    get_records_payload.manual_filters = manual_filters;
    const { records } = await this.getRecords(get_records_payload, prisma);
    const record = records[0];

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    // Get only the specific enrichment field instead of all fields
    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      { ids: [enrichedFieldId] },
      prisma,
    );

    const field = fields[0];

    if (!field) {
      throw new BadRequestException(
        `Field with ID ${enrichedFieldId} not found`,
      );
    }

    // Validate it's an enrichment field
    if (field.type !== 'ENRICHMENT') {
      throw new BadRequestException(
        `Field ${field.name} is not an enrichment field`,
      );
    }

    // Use the helper method to process enrichment
    const result = await this.processSingleRecordEnrichment(
      record,
      field,
      tableId,
      baseId,
      viewId,
      enrichedFieldId,
    );

    if (!result.success) {
      throw new BadRequestException(
        result.error || 'Failed to process enrichment',
      );
    }

    return {
      message: 'Enrichment request sent successfully',
      data: result.data,
    };
  }

  /**
   * Helper method to process enrichment for a single record
   * Extracted from processEnrichment for reuse
   */
  private async processSingleRecordEnrichment(
    record: any,
    field: any,
    tableId: string,
    baseId: string,
    viewId: string,
    enrichedFieldId: number,
  ) {
    const { config, entityType } = field?.options;
    const { hasError = false } = field?.computedFieldMeta || {};

    if (hasError) {
      console.log(
        `Enrichment field ${enrichedFieldId} has configuration errors, skipping record ${record.__id}...`,
      );
      return {
        success: false,
        recordId: record.__id,
        error: 'Field has configuration errors',
      };
    }

    const identifierWithData = config.identifier.map((identifier) => {
      return {
        ...identifier,
        data: record[identifier.dbFieldName],
      };
    });

    const fieldsToEnrichWithData = config.fieldsToEnrich.map((field) => {
      return {
        ...field,
        data: record[field.dbFieldName],
      };
    });

    const updatedIdentifier = {};

    identifierWithData.forEach((identifier) => {
      updatedIdentifier[identifier.key] = identifier.data;
    });

    const fieldToEnrichKeys = fieldsToEnrichWithData.map((field) => field.key);

    const enrichmentPayload = {
      entityType: entityType,
      identifier: updatedIdentifier,
      fieldsToEnrich: fieldToEnrichKeys,
      webhookUrl: `${process.env.BASE_URL}/record/v1/enrichment/get_enriched_data`,
      meta: {
        id: record.__id,
        baseId: baseId,
        tableId: tableId,
        viewId: viewId,
        fieldsToEnrichWithData: fieldsToEnrichWithData,
        identifierWithData: identifierWithData,
        enrichedFieldId: enrichedFieldId,
      },
    };

    try {
      const response = await axios.post(
        `${process.env.ENRICHMENT_SERVICE_URL}/api/enrichment/submit`,
        enrichmentPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      const processEnrichmentPayload = {
        tableId,
        baseId,
        viewId,
        id: record.__id,
        enrichedFieldId,
      };

      await this.emitter.emitAsync(
        'emitEnrichmentRequestSent',
        processEnrichmentPayload,
        tableId,
      );

      return {
        success: true,
        recordId: record.__id,
        data: response.data,
      };
    } catch (error: any) {
      const apiErrorMessage =
        error.response?.data?.error || 'Failed to send enrichment request';

      return {
        success: false,
        recordId: record.__id,
        error: apiErrorMessage,
      };
    }
  }

  /**
   * Process enrichment for all records in a view
   * Uses batch processing with Promise.allSettled for optimal performance
   * Respects view filters (no manual_filters passed to getRecords)
   */
  async processEnrichmentForAllRecords(
    payload: {
      tableId: string;
      baseId: string;
      viewId: string;
      enrichedFieldId: number;
      batchSize?: number;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const {
      tableId,
      baseId,
      viewId,
      enrichedFieldId,
      batchSize = 10,
    } = payload;

    // Get all records without manual_filters - view filters will be applied
    const get_records_payload = {
      tableId,
      baseId,
      viewId,
      should_stringify: true,
      // No manual_filters - view filters will be applied
      version: 1,
    };

    const { records } = await this.getRecords(get_records_payload, prisma);

    if (!records || records.length === 0) {
      return {
        message: 'No records found to process',
        totalRecords: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }

    // Get the enrichment field
    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      { ids: [enrichedFieldId] },
      prisma,
    );

    const field = fields[0];

    if (!field) {
      throw new BadRequestException(
        `Field with ID ${enrichedFieldId} not found`,
      );
    }

    // Validate it's an enrichment field
    if (field.type !== 'ENRICHMENT') {
      throw new BadRequestException(
        `Field ${field.name} is not an enrichment field`,
      );
    }

    // Process records in batches
    const results: Array<{
      success: boolean;
      recordId: number;
      error?: string;
      data?: any;
    }> = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      // Process batch in parallel using Promise.allSettled
      const batchPromises = batch.map((record) =>
        this.processSingleRecordEnrichment(
          record,
          field,
          tableId,
          baseId,
          viewId,
          enrichedFieldId,
        ),
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            recordId: batch[index].__id,
            error: result.reason?.message || 'Unknown error',
          });
        }
      });
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      message: `Processed enrichment for ${records.length} records`,
      totalRecords: records.length,
      processed: results.length,
      successful,
      failed,
      results,
    };
  }

  async getEnrichedData(
    payload: GetEnrichedDataDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { meta, data } = payload;

    const {
      id,
      baseId,
      tableId,
      viewId,
      fieldsToEnrichWithData,
      enrichedFieldId,
      //   identifierWithData,
    } = meta;

    const updaeRecordPayload: UpdateRecordsDTO = {
      tableId,
      baseId,
      viewId,
      column_values: [
        {
          fields_info: [],
          row_id: id,
        },
      ],
    };

    const fieldInfo = fieldsToEnrichWithData.map((field) => {
      return {
        field_id: field.field_id,
        data: data[field.key],
      };
    });

    updaeRecordPayload.column_values[0].fields_info = fieldInfo;

    const updateRecords = await this.updateRecord(updaeRecordPayload, prisma);

    const enrichedRecords = updateRecords.map((record) => {
      return {
        ...record,
        enrichedFieldId,
      };
    });

    await this.emitter.emitAsync(
      'emitUpdatedRecord',
      enrichedRecords,
      tableId,
      baseId,
    );

    return {
      message: 'Enriched data updated successfully',
    };
  }

  /**
   * Checks if any updated fields are dependencies of enrichment fields
   * Returns enrichment jobs that need to be processed
   */
  async checkEnrichmentDependencies(
    tableId: string,
    updatedRecords: {
      row_id: number;
      fields_info: { dbFieldName: string; data: any }[];
    }[], // Accept complete records
    fields: any[], // Accept fields as parameter
    prisma: Prisma.TransactionClient,
  ): Promise<
    Array<{
      row_id: number;
      enrichments_to_process: Array<{
        enrichmentFieldId: number;
      }>;
    }>
  > {
    // No need to call getFields again - use passed fields
    const enrichmentFields: field[] = fields.filter(
      (field) => field.type === 'ENRICHMENT',
    );

    if (enrichmentFields.length === 0) {
      return updatedRecords.map((record) => ({
        row_id: record.row_id,
        enrichments_to_process: [],
      }));
    }

    // Get computed config to check dependencies
    const [computedConfig] = await this.emitter.emitAsync(
      'table.getFormulaFieldConfig',
      tableId,
      prisma,
    );

    if (!computedConfig || !computedConfig.dependencyGraph) {
      return updatedRecords.map((record) => ({
        row_id: record.row_id,
        enrichments_to_process: [],
      }));
    }

    // Process each record and return results
    return updatedRecords.map((record) => {
      const { row_id, fields_info } = record;
      const updatedFieldNames = fields_info.map((field) => field.dbFieldName);

      const enrichments_to_process: Array<{
        enrichmentFieldId: number;
      }> = [];

      // Check each enrichment field for this record
      for (const enrichmentField of enrichmentFields) {
        const { options, dbFieldName: enrichmentFieldName } = enrichmentField;
        if (
          (options as any)?.autoUpdate === false &&
          (options as any)?.autoUpdate !== undefined
        ) {
          continue;
        }

        // // Check if this enrichment field has dependencies in the dependency graph
        if (computedConfig.dependencyGraph[enrichmentFieldName]) {
          const dependencies =
            computedConfig.dependencyGraph[enrichmentFieldName];

          // Check if any of the updated fields are dependencies of this enrichment field
          const hasDependency = dependencies.some((dependency) =>
            updatedFieldNames.includes(dependency),
          );

          if (hasDependency) {
            enrichments_to_process.push({
              enrichmentFieldId: enrichmentField.id,
            });
          }
        }
      }

      return {
        row_id,
        enrichments_to_process,
      };
    });
  }

  // Add this private method anywhere in the RecordService class (I suggest near the end, before checkEnrichmentDependencies)
  private async handleEnrichmentDependencies(
    tableId: string,
    baseId: string,
    viewId: string,
    updatedRecords: {
      row_id: number;
      fields_info: { dbFieldName: string; data: any }[];
    }[],
    prisma: Prisma.TransactionClient,
  ) {
    // Step 1: Get complete records for validation
    const manual_filters = {
      id: Date.now(),
      condition: 'or',
      childs: updatedRecords.map((record) => ({
        id: Date.now() + Math.random(),
        key: '__id',
        field: '__id',
        type: 'NUMBER',
        operator: { key: '=', value: 'is...' },
        value: record.row_id,
        valueStr: record.row_id.toString(),
      })),
    };

    const get_records_payload = {
      tableId,
      baseId,
      viewId,
      should_stringify: true,
      manual_filters,
      version: 1,
    };

    const { records } = await this.getRecords(get_records_payload, prisma);

    // Step 2: Get fields once and reuse
    const [fields] = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    // Step 3: Validate identifier fields and filter out invalid records
    const recordsWithValidIdentifiers = await this.validateIdentifierFields(
      tableId,
      records,
      fields,
    );

    // Step 4: Filter updatedRecords to only include records that passed validation
    const validUpdatedRecords = updatedRecords.filter((updatedRecord) =>
      recordsWithValidIdentifiers.some(
        (validRecord) => validRecord.__id === updatedRecord.row_id,
      ),
    );

    // Step 5: Check which enrichments need processing (only for valid records)
    const enrichmentResponse = await this.checkEnrichmentDependencies(
      tableId,
      validUpdatedRecords, // Pass only the validated updated records
      fields,
      prisma,
    );

    console.log('enrichmentResponse-->>', JSON.stringify(enrichmentResponse));

    // Queue enrichment jobs for each record that has enrichments to process
    for (const recordEnrichment of enrichmentResponse) {
      if (recordEnrichment.enrichments_to_process.length > 0) {
        for (const enrichment of recordEnrichment.enrichments_to_process) {
          const jobPayload = {
            baseId,
            tableId,
            viewId,
            id: recordEnrichment.row_id,
            enrichmentFieldId: enrichment.enrichmentFieldId,
          };

          // Queue the enrichment job
          await this.emitter.emitAsync('bullMq.enqueueJob', {
            jobName: 'enrichment',
            data: jobPayload,
            options: {
              delay: 2000, // 2 second delay
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          });
        }
      }
    }
  }

  private async validateIdentifierFields(
    tableId: string,
    records: any[],
    fields: any[], // Accept fields as parameter
  ) {
    const enrichmentFields = fields.filter(
      (field) => field.type === 'ENRICHMENT',
    );

    // Filter out records where required identifier fields are missing
    return records?.filter((record) => {
      for (const enrichmentField of enrichmentFields) {
        const { config } = enrichmentField.options || {};
        if (config?.identifier && Array.isArray(config.identifier)) {
          // Check if all required identifier fields have data
          const hasAllRequiredIdentifiers = config.identifier.every(
            (identifier) => {
              // Skip if required is false or undefined
              if (identifier.required === false) {
                return true;
              }

              // For required fields, check if data exists
              const value = record[identifier.dbFieldName];
              return value !== null && value !== undefined && value !== '';
            },
          );

          if (!hasAllRequiredIdentifiers) {
            return false;
          }
        }
      }
      return true;
    });
  }

  // ==================== Sheets UI GroupBy Functions ====================

  async sheets_processGroupBy(
    getRecordPayload: GetRecordsPayloadDTO,
    view: any,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      tableId,
      baseId,
      __status = 'active',
      manual_filters,
      manual_sort,
      manual_group_by,
      state,
      should_stringify = false,
      is_field_required = true,
      viewId: _view_id, // eslint-disable-line @typescript-eslint/no-unused-vars
      limit = 20000,
      offset,
      version = 1,
      skip_filters = false,
      requiredFields,
    } = getRecordPayload;

    const viewId = view.id;

    let dbName: string;
    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );
      dbName = result[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];
    const orderRowColumnName = `_row_view${viewId}`;

    const applied_group_by: GroupBy = view.group || manual_group_by;

    if (
      !applied_group_by?.groupObjs ||
      applied_group_by.groupObjs.length === 0
    ) {
      throw new BadRequestException('GroupBy config is empty');
    }

    if (applied_group_by.groupObjs.length > 3) {
      throw new BadRequestException('Maximum 3 fields allowed for grouping');
    }

    const groupByFields = await this.sheets_getGroupByFields(
      applied_group_by.groupObjs,
      prisma,
    );

    const applied_filters = view.filter;
    const applied_sorting = view.sort;
    let filter_query: string = `WHERE "__status" = '${__status}' `;

    const field_ids_mapping: Record<number, any> = {};
    let field_id_to_field_map: Record<string, any> = {};

    if (!skip_filters) {
      if (
        !this.lodash.isEmpty(manual_filters) ||
        !this.lodash.isEmpty(manual_sort) ||
        manual_group_by
      ) {
        if (manual_filters) {
          this.recordUtils.getFilterFieldIds({
            filter: manual_filters,
            field_ids_mapping,
          });
        }

        if (manual_sort) {
          this.recordUtils.getSortFieldIds({
            sorting: manual_sort,
            field_ids_mapping,
          });
        }

        // If manual_filters is empty but applied_filters exist, collect their field IDs too
        // This ensures we have all necessary fields when falling back to applied_filters
        if (this.lodash.isEmpty(manual_filters) && applied_filters) {
          this.recordUtils.getFilterFieldIds({
            filter: applied_filters,
            field_ids_mapping,
          });
        }

        groupByFields.forEach((field) => {
          field_ids_mapping[field.id] = true;
        });

        if (!this.lodash.isEmpty(field_ids_mapping)) {
          const payload = {
            ids: Object.keys(field_ids_mapping).map(Number),
          };

          const [fields] = await this.emitter.emitAsync(
            'field.getFieldsById',
            payload,
            prisma,
          );

          const response = this.recordUtils.createFieldIdToFieldMap({
            fields,
          });

          field_id_to_field_map = {
            ...field_id_to_field_map,
            ...response,
          };
        }

        // Use manual_filters if not empty, otherwise fall back to applied_filters
        const filtersToUse = !this.lodash.isEmpty(manual_filters)
          ? manual_filters
          : applied_filters;

        // Use state for manual_filters, empty object for applied_filters (matching regular getRecords)
        const stateToUse = !this.lodash.isEmpty(manual_filters) ? state : {};

        filter_query = this.buildFilterQuery(
          filtersToUse,
          filter_query,
          stateToUse,
          field_id_to_field_map,
        );
      } else {
        if (applied_filters) {
          this.recordUtils.getFilterFieldIds({
            filter: applied_filters,
            field_ids_mapping,
          });
        }

        if (applied_sorting) {
          this.recordUtils.getSortFieldIds({
            sorting: applied_sorting,
            field_ids_mapping,
          });
        }

        groupByFields.forEach((field) => {
          field_ids_mapping[field.id] = true;
        });

        if (!this.lodash.isEmpty(field_ids_mapping)) {
          const payload = {
            ids: Object.keys(field_ids_mapping).map(Number),
          };

          const [fields] = await this.emitter.emitAsync(
            'field.getFieldsById',
            payload,
            prisma,
          );

          const response = this.recordUtils.createFieldIdToFieldMap({
            fields,
          });

          field_id_to_field_map = {
            ...field_id_to_field_map,
            ...response,
          };
        }

        filter_query = this.buildFilterQuery(
          applied_filters,
          filter_query,
          {},
          field_id_to_field_map,
        );
      }
    }

    // Determine sort to use before building GROUP BY query
    const sortToUse = manual_sort || applied_sorting;

    const groupByQuery = this.sheets_buildGroupByQuery(
      schemaName,
      tableName,
      filter_query,
      groupByFields,
      applied_group_by,
      sortToUse,
      field_id_to_field_map,
    );

    let groupResult: any[] = [];
    try {
      groupResult = await prisma.$queryRawUnsafe(groupByQuery);
    } catch (e) {
      throw new BadRequestException('Could not execute GROUP BY query: ' + e);
    }

    const totalRowCount = await this.sheets_getTotalRowCount(
      schemaName,
      tableName,
      filter_query,
      prisma,
    );

    // GroupPoints are now fetched via separate getGroupPoints endpoint
    // No longer needed here as frontend handles grouping
    this.sheets_transformToGroupPoints(
      groupResult,
      groupByFields,
      applied_group_by,
      field_id_to_field_map,
      totalRowCount,
    );

    // sortToUse is already declared above, use it here
    if (sortToUse?.sortObjs && sortToUse.sortObjs.length > 0) {
      const sortFieldIds = sortToUse.sortObjs.map((obj: any) => obj.fieldId);
      const missingSortFieldIds = sortFieldIds.filter((fieldId: number) => {
        const fieldIdStr = String(fieldId);
        const fieldIdNum = fieldId;
        return (
          !field_id_to_field_map[fieldIdStr] &&
          !field_id_to_field_map[fieldIdNum]
        );
      });

      if (missingSortFieldIds.length > 0) {
        const [sortFields] = await this.emitter.emitAsync(
          'field.getFieldsById',
          { ids: missingSortFieldIds },
          prisma,
        );

        if (sortFields && sortFields.length > 0) {
          const sortFieldMap = this.recordUtils.createFieldIdToFieldMap({
            fields: sortFields,
          });
          field_id_to_field_map = {
            ...field_id_to_field_map,
            ...sortFieldMap,
          };
        }
      }
    }

    // Detect Kanban view for this method (used in getGroupPoints)
    const isKanbanViewForGroupBy = view?.type === 'kanban';

    const combinedSortQuery = this.sheets_buildCombinedSortQuery(
      groupByFields,
      applied_group_by,
      sortToUse,
      field_id_to_field_map,
      orderRowColumnName,
      isKanbanViewForGroupBy,
    );

    let get_query = `SELECT * FROM "${schemaName}".${tableName} ${filter_query} ${combinedSortQuery}`;

    if (limit) {
      get_query += ` LIMIT ${limit}`;
    }

    if (offset) {
      get_query += ` OFFSET ${offset}`;
    }

    let records: any[] = [];
    try {
      records = await prisma.$queryRawUnsafe(get_query);
    } catch (e) {
      throw new BadRequestException('Could not get Records');
    }

    // Get field order and fields
    let field_order: string;
    try {
      const field_order_array: any[] = await this.emitter.emitAsync(
        'view.getFieldOrder',
        viewId,
        prisma,
      );
      field_order = field_order_array[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch field order: ' + error);
    }

    let parsed_field_order: Record<string, any>;
    try {
      parsed_field_order = JSON.parse(field_order);
    } catch (error) {
      throw new BadRequestException('Failed to parse field order: ' + error);
    }

    let fields: any[] = [];
    try {
      const fields_array = await this.emitter.emitAsync(
        'field.getFields',
        tableId,
        prisma,
      );

      if (fields_array.length === 0) {
        throw new BadRequestException('Could not get Fields');
      }

      fields = fields_array[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch fields: ' + error);
    }

    let sorted_fields: any[] = [];

    try {
      const sorted_fields_array: any[] = await this.emitter.emitAsync(
        'field.sortFieldsByOrder',
        fields,
        parsed_field_order,
      );

      sorted_fields = sorted_fields_array[0];
    } catch (error) {
      throw new BadRequestException(error);
    }

    // Filter fields based on requiredField if provided
    if (requiredFields && requiredFields.length > 0) {
      const requiredFieldIds = requiredFields.map((field: any) => field.id);
      sorted_fields = sorted_fields.filter((field) =>
        requiredFieldIds.includes(field.id),
      );
    }

    let response: any;

    if (version === 1) {
      const ordered_records = this.orderedRecords(
        records,
        sorted_fields,
        viewId,
        should_stringify,
      );
      response = {
        viewId: viewId, // ADD viewId to response
        ...(is_field_required ? { fields: sorted_fields } : {}),
        records: ordered_records,
        // REMOVE: groupPoints - now fetched via separate API endpoint
      };
    } else if (version === 2) {
      const ordered_records = this.orderedRecordsV2(
        records,
        sorted_fields,
        viewId,
        should_stringify,
      );
      const fields = this.recordUtils.mapFieldsById(sorted_fields);
      response = {
        viewId: viewId, // ADD viewId to response
        ...(is_field_required ? { fields: fields } : {}),
        records: ordered_records,
        // REMOVE: groupPoints - now fetched via separate API endpoint
      };
    } else if (version === 3) {
      const ordered_records = this.orderedRecordsV3(
        records,
        sorted_fields,
        viewId,
      );
      const fields = this.recordUtils.mapFieldsById(sorted_fields);
      response = {
        viewId: viewId, // ADD viewId to response
        ...(is_field_required ? { fields: fields } : {}),
        records: ordered_records,
        // REMOVE: groupPoints - now fetched via separate API endpoint
      };
    }

    return response;
  }

  async getRecordHistory(
    payload: {
      tableId: string;
      baseId: string;
      recordId: number;
      page: number;
      pageSize: number;
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, recordId, page, pageSize } = payload;

    let dbName: string;
    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );
      dbName = result[0];
    } catch (error) {
      this.logger.error('Failed to fetch database name in getRecordHistory', {
        error,
      });
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];
    const historyTable = `"${schemaName}".${tableName}_history`;

    const offset = (page - 1) * pageSize;

    try {
      const countResult: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS total FROM ${historyTable} WHERE record_id = $1`,
        recordId,
      );
      const total = countResult[0]?.total ?? 0;

      const records: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM ${historyTable} WHERE record_id = $1 ORDER BY changed_at DESC LIMIT $2 OFFSET $3`,
        recordId,
        pageSize,
        offset,
      );

      return {
        records,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error('Error fetching record history', { error });
      throw new BadRequestException('Could not fetch record history');
    }
  }

  async getGroupPoints(
    getGroupPointsPayload: GetGroupPointsPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      tableId,
      baseId,
      viewId,
      __status = 'active',
    } = getGroupPointsPayload;

    // Get view to access filters, type, and groupBy/stackFieldId config
    let view: any;
    try {
      const view_array = await this.emitter.emitAsync(
        'view.getViewById',
        viewId,
        prisma,
      );
      view = view_array[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch view: ' + error);
    }

    if (!view) {
      throw new BadRequestException(`No view exist`);
    }

    // Determine view type
    const isKanbanView = view.type === 'kanban';

    // Parse view.options if it's a string, otherwise use as-is
    let viewOptions: any = {};
    if (view.options) {
      if (typeof view.options === 'string') {
        try {
          viewOptions = JSON.parse(view.options);
        } catch (e) {
          console.error('Failed to parse view.options:', e);
          viewOptions = {};
        }
      } else {
        viewOptions = view.options;
      }
    }

    // Build groupBy config based on view type:
    // - Grid view: Use view.group (has groupObjs)
    // - Kanban view: Extract stackFieldId from view.options and create groupBy structure
    let applied_group_by: any = null;

    if (isKanbanView) {
      // For Kanban: Extract stackFieldId from options and create groupBy structure
      const stackFieldId =
        viewOptions?.stackFieldId &&
        typeof viewOptions.stackFieldId === 'number'
          ? viewOptions.stackFieldId
          : null;

      if (stackFieldId) {
        applied_group_by = {
          groupObjs: [
            {
              fieldId: stackFieldId,
              order: 'asc', // Default order for Kanban stacks
            },
          ],
        };
      }
    } else {
      // For Grid view: Use view.group directly
      applied_group_by = view.group;
    }

    // If no groupBy config found, return empty groupPoints
    if (
      !applied_group_by?.groupObjs ||
      applied_group_by.groupObjs.length === 0
    ) {
      return { groupPoints: [] };
    }

    if (applied_group_by.groupObjs.length > 3) {
      throw new BadRequestException('Maximum 3 fields allowed for grouping');
    }

    // Get database name
    let dbName: string;
    try {
      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );
      dbName = result[0];
    } catch (error) {
      throw new BadRequestException('Failed to fetch database name: ' + error);
    }

    if (!dbName) {
      throw new BadRequestException(`No Table with ID ${tableId}`);
    }

    const dbNameArray = dbName.split('.');
    const schemaName = dbNameArray[0];
    const tableName = dbNameArray[1];

    // Get groupBy fields
    const groupByFields = await this.sheets_getGroupByFields(
      applied_group_by.groupObjs,
      prisma,
    );

    // Build filter query
    const applied_filters = view.filter;
    const applied_sorting = view.sort;
    let filter_query: string = `WHERE "__status" = '${__status}' `;

    const field_ids_mapping: Record<number, any> = {};
    let field_id_to_field_map: Record<string, any> = {};

    // Collect field IDs for filters, sort, and groupBy
    if (applied_filters) {
      this.recordUtils.getFilterFieldIds({
        filter: applied_filters,
        field_ids_mapping,
      });
    }

    if (applied_sorting?.sortObjs) {
      this.recordUtils.getSortFieldIds({
        sorting: applied_sorting,
        field_ids_mapping,
      });
    }

    groupByFields.forEach((field) => {
      field_ids_mapping[field.id] = true;
    });

    // Get fields for field_id_to_field_map
    if (!this.lodash.isEmpty(field_ids_mapping)) {
      const payload = {
        ids: Object.keys(field_ids_mapping).map(Number),
      };

      const [fields] = await this.emitter.emitAsync(
        'field.getFieldsById',
        payload,
        prisma,
      );

      const response = this.recordUtils.createFieldIdToFieldMap({
        fields,
      });

      field_id_to_field_map = {
        ...field_id_to_field_map,
        ...response,
      };
    }

    // Build filter query using the same buildFilterQuery function used in getRecords
    // This ensures consistency and proper handling of filter columns
    if (applied_filters) {
      filter_query = this.buildFilterQuery(
        applied_filters,
        filter_query,
        {},
        field_id_to_field_map,
      );
    }

    // Build GROUP BY query with sort order
    // Note: filter_query is used in WHERE clause, which filters before grouping
    // This is correct - WHERE clauses can reference any column, they don't need to be in GROUP BY
    const groupByQuery = this.sheets_buildGroupByQuery(
      schemaName,
      tableName,
      filter_query,
      groupByFields,
      applied_group_by,
      applied_sorting,
      field_id_to_field_map,
    );

    // Execute GROUP BY query
    let groupResult: any[] = [];
    try {
      groupResult = await prisma.$queryRawUnsafe(groupByQuery);
    } catch (e: any) {
      // Column does not exist (e.g. view references deleted/renamed field, or wrong table)
      const pgCode = e?.meta?.code ?? e?.code;
      const isMissingColumn =
        pgCode === '42703' ||
        (typeof e?.message === 'string' &&
          e.message.includes('does not exist'));
      if (isMissingColumn) {
        return { groupPoints: [] };
      }
      throw new BadRequestException('Could not execute GROUP BY query: ' + e);
    }

    // Get total row count
    const totalRowCount = await this.sheets_getTotalRowCount(
      schemaName,
      tableName,
      filter_query,
      prisma,
    );

    // Transform to groupPoints
    const { groupPoints } = this.sheets_transformToGroupPoints(
      groupResult,
      groupByFields,
      applied_group_by,
      field_id_to_field_map,
      totalRowCount,
    );

    return { groupPoints };
  }

  async sheets_getGroupByFields(
    groupObjs: IGroupByObject[],
    prisma: Prisma.TransactionClient,
  ) {
    const GROUPABLE_FIELD_TYPES = [
      'SHORT_TEXT',
      'LONG_TEXT',
      'NUMBER',
      'SCQ',
      'MCQ',
      'DATE',
    ];

    const fieldIds = groupObjs.map((obj) => obj.fieldId);
    const payload = { ids: fieldIds };

    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      payload,
      prisma,
    );

    if (!fields || fields.length === 0) {
      throw new BadRequestException('No fields found for groupBy');
    }

    const validFields = fields.filter((field: any) => {
      if (!GROUPABLE_FIELD_TYPES.includes(field.type)) {
        throw new BadRequestException(
          `Field type ${field.type} is not allowed for grouping. Allowed types: ${GROUPABLE_FIELD_TYPES.join(', ')}`,
        );
      }
      return true;
    });

    return groupObjs.map((groupObj) => {
      const field = validFields.find((f: any) => f.id === groupObj.fieldId);
      if (!field) {
        throw new BadRequestException(
          `Field with ID ${groupObj.fieldId} not found`,
        );
      }
      return {
        id: field.id,
        dbFieldName: field.dbFieldName,
        type: field.type,
        order: groupObj.order,
      };
    });
  }

  sheets_buildGroupByQuery(
    schemaName: string,
    tableName: string,
    filter_query: string,
    groupByFields: any[],
    _applied_group_by: GroupBy, // eslint-disable-line @typescript-eslint/no-unused-vars
    sort?: any,
    field_id_to_field_map?: Record<string, any>,
  ): string {
    // Helper function to normalize field based on type
    // TEXT fields: normalize '' and null to NULL
    // NUMBER/DATE fields: only normalize null (can't compare to '')
    const normalizeField = (field: any): string => {
      const fieldName = `"${field.dbFieldName}"`;
      const fieldType = field.type;

      if (
        fieldType === 'SHORT_TEXT' ||
        fieldType === 'LONG_TEXT' ||
        fieldType === 'SCQ'
      ) {
        return `COALESCE(NULLIF(${fieldName}, ''), NULL)`;
      }

      if (fieldType === 'NUMBER' || fieldType === 'DATE') {
        return fieldName;
      }

      if (fieldType === 'MCQ') {
        return `CASE WHEN ${fieldName} IS NULL OR ${fieldName} = '[]'::jsonb THEN NULL ELSE ${fieldName} END`;
      }

      return `COALESCE(NULLIF(${fieldName}, ''), NULL)`;
    };

    const selectFields = groupByFields
      .map((field) => {
        const normalized = normalizeField(field);
        return `${normalized} as "${field.dbFieldName}"`;
      })
      .join(', ');
    const selectClause = `SELECT ${selectFields}, COUNT(*) as __c`;

    const groupByFieldsNormalized = groupByFields
      .map((field) => normalizeField(field))
      .join(', ');
    const groupByClause = `GROUP BY ${groupByFieldsNormalized}`;

    // Build ORDER BY clause: groupBy fields first, then sort fields
    const orderByParts: string[] = [];

    // Add groupBy fields to ORDER BY
    groupByFields.forEach((field) => {
      const normalizedField = normalizeField(field);
      const order = field.order.toUpperCase();
      orderByParts.push(`${normalizedField} ${order} NULLS LAST`);
    });

    // Add sort fields to ORDER BY (excluding any that duplicate groupBy fields)
    if (sort?.sortObjs && sort.sortObjs.length > 0 && field_id_to_field_map) {
      const groupByFieldIds = new Set(groupByFields.map((f) => f.id));
      const additionalSortObjs = sort.sortObjs.filter(
        (obj: any) => !groupByFieldIds.has(obj.fieldId),
      );

      additionalSortObjs.forEach((obj: any) => {
        const { order, fieldId } = obj;
        const fieldIdStr = String(fieldId);
        const fieldIdNum = fieldId;
        const field =
          field_id_to_field_map[fieldIdStr] ||
          field_id_to_field_map[fieldIdNum];

        if (field && field.dbFieldName) {
          const orderUpper = order.toUpperCase();
          const normalizedSortField = normalizeField(field);
          orderByParts.push(
            `${normalizedSortField} ${orderUpper} NULLS LAST`,
          );
        }
      });
    }

    // In GROUP BY queries, ORDER BY can only reference columns in GROUP BY
    // So we only keep orderByParts that reference groupBy fields
    // Sort fields that aren't in GROUP BY cannot be used in ORDER BY
    const validOrderByParts = orderByParts.filter((orderPart) => {
      // Check if this order part references a groupBy field
      return groupByFields.some((field) => {
        const normalizedField = normalizeField(field);
        return orderPart.startsWith(normalizedField);
      });
    });

    const orderByClause =
      validOrderByParts.length > 0
        ? `ORDER BY ${validOrderByParts.join(', ')}`
        : '';

    return `${selectClause} FROM "${schemaName}".${tableName} ${filter_query} ${groupByClause} ${orderByClause}`;
  }

  sheets_buildCombinedSortQuery(
    groupByFields: any[],
    _applied_group_by: GroupBy, // eslint-disable-line @typescript-eslint/no-unused-vars
    sort: any,
    field_id_to_field_map: Record<string, any>,
    orderRowColumnName: string,
    isKanbanView?: boolean,
  ): string {
    groupByFields.forEach((field) => {
      const fieldIdStr = String(field.id);
      const fieldIdNum = field.id;
      const fieldInMap =
        field_id_to_field_map[fieldIdStr] || field_id_to_field_map[fieldIdNum];

      if (!fieldInMap) {
        field_id_to_field_map[fieldIdStr] = {
          id: field.id,
          dbFieldName: field.dbFieldName,
          type: field.type,
        };
      } else if (!fieldInMap.dbFieldName) {
        if (field_id_to_field_map[fieldIdStr]) {
          field_id_to_field_map[fieldIdStr].dbFieldName = field.dbFieldName;
        }
        if (field_id_to_field_map[fieldIdNum]) {
          field_id_to_field_map[fieldIdNum].dbFieldName = field.dbFieldName;
        }
      }
    });

    // Build groupBy sort objects (for ordering records by group fields first)
    const groupBySortObjs = groupByFields.map((field) => {
      if (!field.dbFieldName) {
        throw new BadRequestException(
          `GroupBy field ID ${field.id} is missing dbFieldName`,
        );
      }
      return {
        fieldId: field.id,
        order: field.order.toLowerCase(),
        type: field.type,
      };
    });

    // Get sort objects from view.sort (excluding any that duplicate groupBy fields)
    const sortFieldIds = new Set(groupBySortObjs.map((obj) => obj.fieldId));
    const additionalSortObjs = (sort?.sortObjs || []).filter(
      (obj: any) => !sortFieldIds.has(obj.fieldId),
    );

    // Combine: groupBy fields first (for proper ordering within groups), then view.sort fields
    // This ensures records are sorted by group fields first, then by view.sort
    const combinedSortObjs = [...groupBySortObjs, ...additionalSortObjs];

    const sortClause = this.getSortClauseStr({
      applied_sorting: { sortObjs: combinedSortObjs },
      orderRowColumnName,
      field_id_to_field_map,
    });

    // For Kanban view: Always ensure _row_view{viewId} is included after stackFieldId
    if (isKanbanView) {
      const orderByPart = sortClause.replace('ORDER BY ', '');
      const hasOrderRowColumn = orderByPart
        .toLowerCase()
        .includes(orderRowColumnName.toLowerCase());

      if (!hasOrderRowColumn) {
        return `ORDER BY ${orderByPart}, ${orderRowColumnName} asc`;
      }
    }

    const hasSortFields = sort?.sortObjs && sort.sortObjs.length > 0;
    // Only check for orderRowColumn if we have sort fields (groupBy fields no longer in ORDER BY)
    if (!hasSortFields && additionalSortObjs.length === 0) {
      // If no sort fields at all, ensure we have orderRowColumn for consistent ordering
      const orderByPart = sortClause.replace('ORDER BY ', '');
      const hasOrderRowColumn = orderByPart
        .toLowerCase()
        .includes(orderRowColumnName.toLowerCase());

      if (!hasOrderRowColumn) {
        return `ORDER BY ${orderByPart}, ${orderRowColumnName} asc`;
      }
    }

    return sortClause;
  }

  sheets_transformToGroupPoints(
    groupResult: any[],
    groupByFields: any[],
    _applied_group_by: GroupBy, // eslint-disable-line @typescript-eslint/no-unused-vars
    field_id_to_field_map: Record<string, any>,
    totalRowCount: number,
  ): { groupPoints: IGroupPoint[] } {
    const groupPoints: IGroupPoint[] = [];
    const currentPath: any[] = [];
    let curRowCount = 0;

    groupResult.forEach((row: any) => {
      const rowValues: any[] = []; // eslint-disable-line @typescript-eslint/no-unused-vars

      for (let i = 0; i < groupByFields.length; i++) {
        const field = groupByFields[i];
        const value = row[field.dbFieldName];

        if (currentPath[i] !== value) {
          for (let j = currentPath.length - 1; j >= i; j--) {
            currentPath.pop();
          }

          const groupId = this.sheets_generateGroupId(
            field.id,
            currentPath.slice(0, i),
            value,
          );

          groupPoints.push({
            type: 0,
            id: groupId,
            depth: i,
            value: value,
          });

          currentPath.push(value);
        }

        rowValues.push(value);
      }

      const count = Number(row.__c) || 0;
      curRowCount += count;

      groupPoints.push({
        type: 1,
        count: count,
      });
    });

    if (curRowCount < totalRowCount) {
      const unknownCount = totalRowCount - curRowCount;
      groupPoints.push({
        type: 0,
        id: 'sheets_unknown',
        depth: 0,
        value: 'Unknown',
      });
      groupPoints.push({
        type: 1,
        count: unknownCount,
      });
    }

    return { groupPoints };
  }

  async sheets_getTotalRowCount(
    schemaName: string,
    tableName: string,
    filter_query: string,
    prisma: Prisma.TransactionClient,
  ): Promise<number> {
    const countQuery = `SELECT COUNT(*) as total FROM "${schemaName}".${tableName} ${filter_query}`;

    try {
      const result: any[] = await prisma.$queryRawUnsafe(countQuery);
      return Number(result[0]?.total) || 0;
    } catch (e) {
      throw new BadRequestException('Could not get total row count: ' + e);
    }
  }

  sheets_generateGroupId(
    fieldId: number,
    parentValues: any[],
    currentValue: any,
  ): string {
    const valuePath = parentValues
      .concat([currentValue])
      .map((v) => String(v ?? 'null'))
      .join('_');
    // Sanitize for use in IDs (remove special characters)
    const sanitized = valuePath.replace(/[^a-zA-Z0-9_]/g, '_');
    return `sheets_${fieldId}_${sanitized}`;
  }

  sheets_convertFieldValueForDisplay(
    value: any,
    field: any,
    field_id_to_field_map: Record<string, any>,
  ): unknown {
    if (field.type === 'DATE') {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'string') {
        return value; // Already formatted
      }
      return String(value);
    }

    // Handle NUMBER fields
    if (field.type === 'NUMBER') {
      return Number(value);
    }

    // Handle TEXT fields (SHORT_TEXT, LONG_TEXT)
    if (field.type === 'SHORT_TEXT' || field.type === 'LONG_TEXT') {
      return String(value);
    }

    // Handle SCQ/MCQ fields: display option text from field options
    if (field.type === 'SCQ' || field.type === 'MCQ') {
      const fullField = field_id_to_field_map[field.id];
      if (fullField && fullField.options) {
        try {
          const options =
            typeof fullField.options === 'string'
              ? JSON.parse(fullField.options)
              : fullField.options;

          if (Array.isArray(options)) {
            const option = options.find((opt: any) => {
              if (typeof opt === 'string') {
                return opt === value;
              }
              return opt.value === value || opt.label === value;
            });
            if (option) {
              return typeof option === 'string'
                ? option
                : option.label || option.value;
            }
          }
        } catch (e) {
          // Fall through to return value as-is
        }
      }
      return String(value);
    }

    // Default: return as string
    return String(value);
  }

  async validateFieldConstraints(
    allFields: any[],
    fieldsInfo: any[],
    recordId: number | null,
    schemaName: string,
    tableName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<{ fieldId: number; fieldName: string; error: string }[]> {
    const errors: { fieldId: number; fieldName: string; error: string }[] = [];

    const fieldsInfoMap = new Map<number, any>();
    fieldsInfo.forEach((fi: any) => {
      fieldsInfoMap.set(fi.field_id, fi);
    });

    for (const field of allFields) {
      const opts = field.options || {};
      const fieldInfo = fieldsInfoMap.get(field.id);

      if (opts.isRequired) {
        const value = fieldInfo?.data;
        const isEmpty =
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty && !recordId) {
          errors.push({
            fieldId: field.id,
            fieldName: field.name,
            error: `${field.name} is required`,
          });
        }
      }

      if (opts.isUnique && fieldInfo?.data != null && fieldInfo.data !== '') {
        try {
          const dbFieldName = field.dbFieldName;
          const value = fieldInfo.data;

          let whereClause = `"${dbFieldName}" = $1 AND __status = 'active'`;
          const params: any[] = [value];

          if (recordId) {
            whereClause += ` AND __id != $2`;
            params.push(recordId);
          }

          const existingRecords: any[] = await prisma.$queryRawUnsafe(
            `SELECT __id FROM "${schemaName}".${tableName} WHERE ${whereClause} LIMIT 1`,
            ...params,
          );

          if (existingRecords.length > 0) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              error: `${field.name} must be unique`,
            });
          }
        } catch (error) {
          console.error(
            `Failed to check uniqueness for field ${field.name}:`,
            error,
          );
        }
      }
    }

    return errors;
  }

  private async logCreateHistoryEntries(
    schemaName: string,
    tableName: string,
    recordId: number | string,
    fields: any[],
    fieldsInfo: any[],
    userId: string | null,
    prisma: Prisma.TransactionClient,
  ) {
    try {
      const historyRows: string[] = [];
      const changedBy = userId ? JSON.stringify({ id: userId }) : 'NULL';

      for (const fieldInfo of fieldsInfo) {
        const field = fields.find((f) => f.id === fieldInfo.field_id);
        if (!field) continue;

        const fieldId = escapeSqlValue(String(field.id));
        const fieldName = escapeSqlValue(field.name || '');
        const afterValue = fieldInfo.data !== null && fieldInfo.data !== undefined
          ? `'${escapeSqlValue(JSON.stringify(fieldInfo.data))}'::jsonb`
          : 'NULL';

        historyRows.push(
          `(${Number(recordId)}, '${fieldId}', '${fieldName}', NULL, ${afterValue}, 'create', ${changedBy === 'NULL' ? 'NULL' : `'${escapeSqlValue(changedBy)}'::jsonb`}, CURRENT_TIMESTAMP)`,
        );
      }

      if (historyRows.length === 0) return;

      const historyInsertQuery = `
        INSERT INTO "${schemaName}".${tableName}_history
          (record_id, field_id, field_name, before_value, after_value, action, changed_by, changed_at)
        VALUES ${historyRows.join(', ')}
      `;

      await prisma.$queryRawUnsafe(historyInsertQuery);
    } catch (error) {
      this.logger.error('Failed to log create history entries', { error });
    }
  }
}
