import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateFieldDto } from './DTO/create-field.dto';
import { CreateRecordColumn } from '../record/DTO/create-record-column.dto';
import { createFieldPayloadDTO } from './DTO/create-field-payload-dto';
import {
  CreateField,
  CreateMultiFieldDto,
} from './DTO/create-multiple-fields.dto';
import { UpdateFieldsDTO, UpdateSingleFieldDTo } from './DTO/update-fields.dto';
import { field, Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { FieldInfo } from './interfaces/field_info.interface';
import { UpdateFieldsStatusDTO } from './DTO/update-fields-status.dto';
import { ClearFieldsDatasDTO } from './DTO/clear-fields-data.dto';
import { getFieldsByIdsDTO } from './DTO/get-fields-by-ids.dto';
import {
  QUESTION_TYPE,
  TYPE_MAPPING,
  SYSTEM_FIELD_MAPPING,
} from './DTO/mappings.dto';
import { RenameColumnDto } from '../record/DTO/rename-column.dto';
import { LoDashStatic } from 'lodash';
import { FieldUtils } from './field.utils';
import { Sort, UpdateSortPayloadDTO } from '../view/DTO/update_sort.dto';
import { Filter, UpdateFilterPayloadDTO } from '../view/DTO/update_filter.dto';
import { ComputedFieldMetaDTO } from './DTO/computed-field-meta.dto';
import { extractDependenciesFromExpression } from './utils/extractDependenciesFromExpression';
import { validate } from 'oute-services-fx-validator-sdk';
import { isFormulaExpressionReferencesValid } from './utils/isFormulaExpressionReferencesValid';
import { getEnrichmentConfig } from './utils/getEnrichmentConfig';
import { hasIdentifierChanged } from './utils/hasIndentifierChanged';
import { getNewEnabledFields } from './utils/getNewEnabledFields';
import { CreateEnrichmentFieldDto } from './DTO/create-enrichment-field.dto';
import { UpdateEnrichmentFieldDto } from './DTO/update-enrichment-field.dto';
import { DATA_TYPE_FORMATS } from './DTO/data-type-formats.dto';

@Injectable()
export class FieldService {
  constructor(
    private readonly emitter: EventEmitterService,
    @Inject('ShortUUID') private shortUUID: any,

    @Inject('Lodash') private readonly lodash: LoDashStatic,
    private readonly filedUtils: FieldUtils,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'field.createField', handler: this.createField },
      { name: 'field.getFields', handler: this.getFields },
      {
        name: 'field.sortFieldsByOrder',
        handler: this.sortFieldsByOrder,
      },
      {
        name: 'field.createMultipleFields',
        handler: this.createMultipleFields,
      },
      {
        name: 'field.updateFields',
        handler: this.updateFields,
      },
      {
        name: 'field.getFieldsById',
        handler: this.getFieldsById,
      },
      {
        name: 'field.updateField',
        handler: this.updateField,
      },
      {
        name: 'field.updateFieldsStatus',
        handler: this.updateFieldsStatus,
      },
      {
        name: 'field.createDuplicateFields',
        handler: this.createDuplicateFields,
      },
      {
        name: 'field.updateComputedFieldMeta',
        handler: this.updateComputedFieldMeta,
      },
      {
        name: 'field.getAllFormulaFields',
        handler: this.getAllFormulaFields,
      },
      {
        name: 'field.createEnrichmentField',
        handler: this.createEnrichmentField,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async createField(
    createFieldPayload: createFieldPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      order,
      name,
      type,
      options,
      viewId,
      tableId,
      baseId,
      description,
      expression,
    } = createFieldPayload;

    // TODO - if order null logic needs to be written
    if (!order) {
    }

    // check if field already exists throw that error
    const existing_field = await prisma.field.findFirst({
      where: {
        tableMetaId: tableId,
        name: name,
        status: 'active',
      },
    });

    if (existing_field) {
      throw new BadRequestException(
        `Cannot create column with same title ${name}. Please provide a unique title`,
      );
    }

    // Handle system fields using the mapping configuration
    let dbFieldName: string;
    if (SYSTEM_FIELD_MAPPING[type]) {
      // Check if a system field of this type already exists for this table
      const existing_system_field = await prisma.field.findFirst({
        where: {
          tableMetaId: tableId,
          type: type,
          status: 'active',
        },
      });

      if (existing_system_field) {
        throw new BadRequestException(
          `Only one ${type} field can exist per table`,
        );
      }
      dbFieldName = SYSTEM_FIELD_MAPPING[type];
    } else {
      // For other field types, generate a new dbFieldName
      const uuid = this.shortUUID.generate();
      dbFieldName = this.filedUtils.getDBFieldName(name, uuid);
    }

    const dbFieldType = this.getDbFieldType(type);

    if (!dbFieldType) {
      throw new BadRequestException('Please provide proper type');
    }

    let existing_options = options;

    // validate the formula once satu's package support it
    if (type === 'FORMULA' && expression) {
      try {
        const { return_type: returnType } = validate(expression?.blocks);

        existing_options = {
          ...existing_options,
          returnType,
        };
      } catch (error) {
        throw new BadRequestException(error);
      }
    }

    // before creating formula field check if  dependecies expressions are not in error state
    if (type === 'FORMULA' && expression) {
      const allFields = await this.getFields(tableId, prisma);

      const isValid = isFormulaExpressionReferencesValid(expression, allFields);

      if (!isValid) {
        throw new BadRequestException('Formula expression has error');
      }
    }

    // Get the format configuration for this field type
    const fieldFormat =
      DATA_TYPE_FORMATS[type as keyof typeof DATA_TYPE_FORMATS];

    const create_field_payload: CreateFieldDto = {
      name,
      type,
      options: existing_options,
      dbFieldName,
      dbFieldType,
      description,
      cellValueType: 'string',
      tableMetaId: tableId,
      fieldFormat, // Add this line
      ...(type === 'FORMULA' &&
        expression && {
          computedFieldMeta: {
            expression: expression,
            hasError: false,
          },
        }),
    };

    let field: Record<any, any>;

    try {
      field = await prisma.field.create({
        data: create_field_payload,
      });
    } catch (error) {
      throw new BadRequestException('Could not create field');
    }

    // Update computedConfig for ALL fields (both base and formula fields)
    try {
      let dependencies: string[] = [];

      if (type === 'FORMULA' && expression) {
        // Extract dependencies from the expression for formula fields
        dependencies = extractDependenciesFromExpression(expression as any);

        await this.emitter.emitAsync('bullMq.enqueueJob', {
          jobName: 'formula_calculation',
          data: {
            baseId,
            tableId,
            viewId,
            field_id: field.id,
          },
          options: {
            delay: 3000,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        });
      } else {
        // Base fields have no dependencies
        dependencies = [];
      }

      // Update the computedConfig with the new field (formula or base)
      await this.emitter.emitAsync(
        'table.updateFormulaFieldConfig',
        {
          tableId: tableId,
          columnName: field.dbFieldName,
          dependencies: dependencies,
        },
        prisma,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }

    // Skip database column creation for system fields since the column already exists
    if (!SYSTEM_FIELD_MAPPING[type]) {
      if (type === 'LINK') {
        try {
          const [linkResult] = await this.emitter.emitAsync(
            'link.createLinkField',
            {
              fieldId: field.id,
              tableId,
              baseId,
              viewId,
              options: existing_options || {},
            },
            prisma,
          );
          if (linkResult?.updatedOptions) {
            field = await prisma.field.update({
              where: { id: field.id },
              data: { options: linkResult.updatedOptions },
            });
          }
        } catch (error) {
          await prisma.field.delete({ where: { id: field.id } });
          throw new BadRequestException(
            `Could not create link field: ${error}`,
          );
        }
      } else {
        const create_record_payload: CreateRecordColumn = {
          tableId: tableId,
          baseId: baseId,
          column_name: field?.dbFieldName,
          data_type: field?.dbFieldType,
        };

        const respone = await this.emitter.emitAsync(
          'record.create_record_column',
          create_record_payload,
          prisma,
        );

        if (!respone) {
          throw new BadRequestException('Could not create column');
        }
      }
    }

    const field_info = [
      {
        field_id: field.id,
        order: order,
      },
    ];

    const response = {
      ...field,
      order: order,
    };

    await this.emitter.emitAsync(
      'view.setFieldOrder',
      viewId,
      field_info,
      prisma,
    );

    // Add the new field to all other views (V2, V3, ... Vn) at the end
    const viewIds = await this.emitter.emitAsync(
      'view.getViewIdsByTableId',
      tableId,
      prisma,
    );
    const allViewIds: string[] = Array.isArray(viewIds?.[0]) ? viewIds[0] : [];
    const otherViewIds = allViewIds.filter((id: string) => id !== viewId);
    for (const otherViewId of otherViewIds) {
      const [highestOrder] =
        (await this.emitter.emitAsync(
          'view.getHighestOrderOfColumn',
          { viewId: otherViewId },
          prisma,
        )) ?? [];
      const nextOrder = typeof highestOrder === 'number' ? highestOrder + 1 : 0;
      await this.emitter.emitAsync(
        'view.setFieldOrder',
        otherViewId,
        [{ field_id: field.id, order: nextOrder }],
        prisma,
      );
    }

    const depFieldIds = this.getFieldReferenceIds(field, []);
    if (depFieldIds.length > 0) {
      await this.emitter.emitAsync('dependency.createReferences', { fieldId: field.id, dependsOnFieldIds: depFieldIds }, prisma);
    }

    this.emitter.emit('emit-createdField', response, viewId, tableId);

    return response;
  }

  async updateField(
    updateFieldPayload: UpdateSingleFieldDTo,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      id,
      name,
      description,
      options,
      tableId,
      baseId,
      viewId,
      type,
      status,
      order,
      computedFieldMeta,
    } = updateFieldPayload;

    const { expression } = computedFieldMeta || {};

    let existing_options = options;

    const [table] = await this.emitter.emitAsync(
      'table.getTable',
      { tableId },
      prisma,
    );

    // Step 1: Check if field with same name exists (excluding current field)
    if (name) {
      const existing_field_with_same_name = await prisma.field.findFirst({
        where: {
          tableMetaId: tableId,
          name: name,
          NOT: { id: id },
          status: 'active',
        },
      });

      if (existing_field_with_same_name) {
        throw new BadRequestException(
          `Field with name "${name}" already exists`,
        );
      }
    }

    // Step 2: Get the existing field by ID
    let existing_field: field | null;
    try {
      existing_field = await prisma.field.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (error) {
      throw new BadRequestException(`Error while finding field with id: ${id}`);
    }

    // Step 3: Initialize response structure
    const response: {
      isExpressionUpdate: boolean;
      updatedFields: any[];
    } = {
      isExpressionUpdate: false,
      updatedFields: [],
    };

    // Step 4: Handle field name changes
    if (name && name !== existing_field.name) {
      // Update dependent formula field expressions
      const updatedFields = await this.updateDependentFormulaFieldExpressions(
        tableId,
        existing_field.dbFieldName,
        name,
        prisma,
      );

      if (updatedFields && updatedFields.length > 0) {
        response.updatedFields.push(...updatedFields);
      }
    }

    // Step 5: Handle type changes
    let dbFieldType: string = existing_field.dbFieldType;
    const records_payload: any[] = [];

    if (type && existing_field.type !== type) {
      dbFieldType = this.getDbFieldType(type);
      records_payload.push({
        column_name: existing_field.dbFieldName,
        data_type: dbFieldType,
      });
    }

    // Step 6: Validate formula expression
    if (type === 'FORMULA') {
      if (!expression) {
        throw new BadRequestException(
          'Formula expression is required for FORMULA type fields',
        );
      }

      try {
        const { return_type: returnType } = validate(expression?.blocks);
        existing_options = {
          ...existing_options,
          returnType,
        };
      } catch (error) {
        throw new BadRequestException(error);
      }
    }

    const updatedComputedFieldMeta = { ...computedFieldMeta };

    // Update all dependent fields with their hasError values
    const updatedDependentFields: field[] = [];

    if (type === 'FORMULA' && !this.lodash.isEmpty(computedFieldMeta)) {
      const allFields = await this.getFields(tableId, prisma);

      const isValid: boolean = isFormulaExpressionReferencesValid(
        expression,
        allFields,
      );

      if (!isValid) {
        throw new BadRequestException('Formula expression has error');
      }

      updatedComputedFieldMeta.hasError = !isValid;

      const allFieldsDbFieldname = allFields.map((field) => field.dbFieldName);

      const { dependencyGraph = {} } = table.computedConfig || {};
      const updatedField = existing_field.dbFieldName;

      const response: { dbFieldName: string; hasError: boolean }[] = [];
      const visited = new Set();
      const statusMemo = {}; // Cache for validity status

      // 1. Build reverse dependency graph
      const reverseDependencyGraph = {};
      for (const [field, dependencies] of Object.entries(dependencyGraph)) {
        for (const dep of dependencies as string[]) {
          if (!reverseDependencyGraph[dep]) reverseDependencyGraph[dep] = [];
          reverseDependencyGraph[dep].push(field);
        }
      }

      // 2. Check if a field is valid
      function isFieldValid(field) {
        const dependencies = dependencyGraph[field] || [];

        for (const dep of dependencies) {
          if (!allFieldsDbFieldname.includes(dep)) {
            return false;
          }

          if (!(dep in statusMemo)) {
            const depStatus = isFieldValid(dep);
            statusMemo[dep] = depStatus;
          }

          if (!statusMemo[dep]) {
            return false;
          }
        }

        return true;
      }

      // 3. Recursively propagate downstream from a fixed field
      function propagate(field) {
        const dependents = reverseDependencyGraph[field] || [];

        for (const dependent of dependents) {
          if (visited.has(dependent)) continue;
          visited.add(dependent);

          const valid = isFieldValid(dependent);
          statusMemo[dependent] = valid;
          response.push({ dbFieldName: dependent, hasError: !valid });

          // Go deeper into its dependents
          propagate(dependent);
        }
      }

      // Start the flow
      statusMemo[updatedField] = true;
      visited.add(updatedField);
      response.push({ dbFieldName: updatedField, hasError: false });

      propagate(updatedField);

      for (const fieldErrorInfo of response) {
        try {
          // Find the field by dbFieldName
          const fieldToUpdate = allFields.find(
            (field) => field.dbFieldName === fieldErrorInfo.dbFieldName,
          );

          if (fieldToUpdate) {
            // Get current computedFieldMeta
            const currentComputedFieldMeta =
              fieldToUpdate.computedFieldMeta as any;

            // Update hasError value
            const updatedComputedFieldMeta = {
              ...currentComputedFieldMeta,
              hasError: fieldErrorInfo.hasError,
            };

            // Update the field in database
            const updatedField = await prisma.field.update({
              where: { id: fieldToUpdate.id },
              data: {
                computedFieldMeta: updatedComputedFieldMeta,
              },
            });

            updatedDependentFields.push(updatedField);
          }
        } catch (error) {
          throw new BadRequestException('Could not update field');
          // Continue with other fields even if one fails
        }
      }
    }

    // Add updated dependent fields to response
    if (updatedDependentFields.length > 0) {
      response.updatedFields.push(...updatedDependentFields);
    }

    // Step 7: Prepare update payload
    const update_field_payload = {
      name,
      description,
      options: existing_options,
      type,
      dbFieldType,
      status,
      ...(type === 'FORMULA' &&
        !this.lodash.isEmpty(computedFieldMeta) && {
          computedFieldMeta: updatedComputedFieldMeta,
        }),
    };

    // Step 8: Update the field
    const updated_field = await prisma.field.update({
      where: { id: id },
      data: update_field_payload,
    });

    // Add the main updated field to response
    response.updatedFields.push(updated_field);

    // Step 9: Handle order updates
    if (order) {
      const field_info: FieldInfo[] = [
        {
          field_id: id,
          order: order,
        },
      ];
      await this.emitter.emitAsync(
        'view.setFieldOrder',
        viewId,
        field_info,
        prisma,
      );
    }

    // Step 10: Handle formula field expression update for current field
    let expressionChanged = false;
    if (
      type === 'FORMULA' &&
      expression &&
      existing_field.type === 'FORMULA' &&
      existing_field.computedFieldMeta
    ) {
      const computedFieldMeta: any = existing_field.computedFieldMeta;
      const oldExpression = computedFieldMeta?.expression;

      // Compare stringified expressions for accurate change detection
      const oldExpressionStr = JSON.stringify(oldExpression);
      const newExpressionStr = JSON.stringify(expression);

      if (oldExpressionStr !== newExpressionStr) {
        expressionChanged = true;
        response.isExpressionUpdate = expressionChanged;

        // get the dependencies from the expression
        const dependencies = extractDependenciesFromExpression(expression);

        // Queue formula recalculation
        await this.emitter.emitAsync('bullMq.enqueueJob', {
          jobName: 'formula_calculation',
          data: {
            baseId,
            tableId,
            viewId,
            field_id: existing_field.id,
          },
          options: {
            delay: 3000,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        });

        // Update formula field config with new dependencies
        await this.emitter.emitAsync(
          'table.updateFormulaFieldConfig',
          {
            tableId: tableId,
            columnName: existing_field.dbFieldName,
            dependencies: dependencies,
            prisma: prisma,
          },
          prisma,
        );
      } else {
        console.log('Formula expression unchanged, skipping recalculation');
      }
    }

    // Step 10: Update record columns if needed
    if (records_payload.length > 0) {
      const update_records_columns_payload = {
        tableId,
        baseId,
        records_payload,
      };
      await this.emitter.emitAsync(
        'record.updateRecordColumns',
        update_records_columns_payload,
        prisma,
      );
    }

    // Step 11: Emit updated fields to frontend with new structure
    await this.emitter.emitAsync('emit_updated_field', response, viewId, tableId);

    return updated_field;
  }

  async getFields(
    tableId: string,
    prisma: Prisma.TransactionClient,
    type?: string,
  ): Promise<field[]> {
    try {
      const whereClause: any = {
        tableMetaId: tableId,
        status: 'active',
      };

      if (type) {
        whereClause.type = type;
      }

      const fields = await prisma.field.findMany({
        where: whereClause,
      });

      return fields;
    } catch (e) {
      throw new BadRequestException('Could not get fields');
    }
  }

  sortFieldsByOrder(fields: any[], field_order: Record<string, any>) {
    const order_added_fields = fields.map((field) => {
      const { id } = field;

      return {
        ...field,
        order: field_order[id]?.order,
      };
    });

    order_added_fields.sort((a, b) => a.order - b.order);

    return order_added_fields;
  }

  getFieldReferenceIds(field: any, allFields: any[]): number[] {
    const deps: number[] = [];

    switch (field.type) {
      case 'LINK': {
        const lookupFieldId = field.options?.lookupFieldId;
        if (lookupFieldId) {
          const id = parseInt(lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'LOOKUP': {
        const lookupOpts = field.lookupOptions || field.options;
        if (lookupOpts?.linkFieldId) {
          const id = parseInt(lookupOpts.linkFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        if (lookupOpts?.lookupFieldId) {
          const id = parseInt(lookupOpts.lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'ROLLUP': {
        const rollupOpts = field.lookupOptions || field.options;
        if (rollupOpts?.linkFieldId) {
          const id = parseInt(rollupOpts.linkFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        if (rollupOpts?.lookupFieldId) {
          const id = parseInt(rollupOpts.lookupFieldId);
          if (!isNaN(id)) deps.push(id);
        }
        break;
      }
      case 'FORMULA': {
        const computedMeta = field.computedFieldMeta as any;
        const expression = computedMeta?.expression;
        if (expression?.blocks && Array.isArray(expression.blocks)) {
          for (const block of expression.blocks) {
            if (block.type === 'FIELDS' && block.tableData?.fieldId) {
              const id = parseInt(block.tableData.fieldId);
              if (!isNaN(id)) deps.push(id);
            } else if (block.type === 'FIELDS' && block.tableData?.dbFieldName) {
              const matchedField = allFields.find(
                (f: any) => f.dbFieldName === block.tableData.dbFieldName,
              );
              if (matchedField) deps.push(matchedField.id);
            }
          }
        }
        break;
      }
      default:
        break;
    }

    return [...new Set(deps)];
  }

  getDbFieldType(type: string) {
    // const data_type = type.toLowerCase();

    if (TYPE_MAPPING[type]) {
      return TYPE_MAPPING[type];
    } else {
      return TYPE_MAPPING['UNKNOWN'];
    }
  }

  async createMultipleFields(
    createMultipleFieldsPayload: CreateMultiFieldDto,
    prisma: Prisma.TransactionClient,
  ) {
    const fields_info: {
      field_id: number;
      order: number;
      text_wrap?: string;
      width?: number;
    }[] = [];

    const created_fields: any[] = [];

    const create_field_payload: any[] = [];

    const {
      viewId,
      tableId,
      baseId,
      fields_payload,
      should_update_order_in_view = true,
    } = createMultipleFieldsPayload;

    const create_many_fields_payload: any[] = fields_payload.map(
      (field_payload) => {
        const {
          name,
          type,
          node_id,
          options,
          source_id,
          width,
          text_wrap,
          description,
        } = field_payload;

        const uuid = this.shortUUID.generate();

        const dbFieldName = this.filedUtils.getDBFieldName(name, uuid);

        const dbFieldType = this.getDbFieldType(type);

        create_field_payload.push({
          column_name: dbFieldName,
          data_type: dbFieldType,
        });

        const fieldFormat =
          DATA_TYPE_FORMATS[type as keyof typeof DATA_TYPE_FORMATS];

        // TODO - write logic to add options

        return {
          name,
          type,
          dbFieldName,
          dbFieldType,
          TableMeta: {
            connect: { id: tableId },
          },
          //   tableMetaId: tableId,
          width,
          text_wrap,
          cellValueType: '',
          nodeId: node_id,
          options: options,
          source_id,
          description,
          fieldFormat,
        };
      },
    );

    for (let i = 0; i < create_many_fields_payload.length; i++) {
      const field_payload = create_many_fields_payload[i];

      const { name = '' } = field_payload;

      const { width, text_wrap, ...rest } = field_payload;

      // check if field already exists throw that error
      const existing_field = await prisma.field.findFirst({
        where: {
          tableMetaId: tableId,
          name: name,
          status: 'active',
        },
      });

      if (existing_field) {
        throw new BadRequestException(
          `Cannot create column with same title : ${name}. Please provide a unique title`,
        );
      }

      try {
        const created__field = await prisma.field.create({
          data: rest,
        });

        created_fields.push({ ...created__field, width, text_wrap });
      } catch (e) {
        throw new BadRequestException(`Could not create field`);
      }
    }

    const create_multiple_record_columns_payload = {
      tableId,
      baseId,
      create_record_columns_payload: create_field_payload,
    };

    const [resp] = await this.emitter.emitAsync(
      'record.createMultipleRecordColumns',
      create_multiple_record_columns_payload,
      prisma,
    );

    if (!resp) {
      throw new BadRequestException('Could not create the columns');
    }

    // Update computedConfig for all created fields
    for (let i = 0; i < created_fields.length; i++) {
      const field = created_fields[i];
      const fieldPayload = fields_payload[i];

      try {
        let dependencies: string[] = [];

        if (
          fieldPayload.type === 'FORMULA' &&
          fieldPayload.computed_field_meta?.expression
        ) {
          // Extract dependencies from the expression for formula fields
          dependencies = extractDependenciesFromExpression(
            fieldPayload.computed_field_meta.expression as any,
          );
        } else {
          // Base fields have no dependencies
          dependencies = [];
        }

        // Update the computedConfig with the new field
        await this.emitter.emitAsync(
          'table.updateFormulaFieldConfig',
          {
            tableId: tableId,
            columnName: field.dbFieldName,
            dependencies: dependencies,
          },
          prisma,
        );
      } catch (error) {
        throw new BadRequestException(
          `Could not update config for field ${field.name}: ${error}`,
        );
      }
    }

    let response = created_fields;

    if (should_update_order_in_view) {
      const high_column_order_array = await this.emitter.emitAsync(
        'view.getHighestOrderOfColumn',
        { viewId },
        prisma,
      );

      response = created_fields.map((field: any, index: number) => {
        const calculatedOrder =
          fields_payload[index]?.order ||
          high_column_order_array[0] + index + 1 ||
          index + 1;

        fields_info.push({
          field_id: field.id,
          order: calculatedOrder,
          text_wrap: field.text_wrap,
          width: field.width,
        });

        return {
          ...field,
          order: calculatedOrder, // Use the same calculated order here
        };
      });

      await this.emitter.emitAsync(
        'view.setFieldOrder',
        viewId,
        fields_info,
        prisma,
      );

      // Add the new fields to all other views (V2, V3, ... Vn) at the end
      const viewIds = await this.emitter.emitAsync(
        'view.getViewIdsByTableId',
        tableId,
        prisma,
      );
      const allViewIds: string[] = Array.isArray(viewIds?.[0]) ? viewIds[0] : [];
      const otherViewIds = allViewIds.filter((id: string) => id !== viewId);
      for (const otherViewId of otherViewIds) {
        const [highestOrder] =
          (await this.emitter.emitAsync(
            'view.getHighestOrderOfColumn',
            { viewId: otherViewId },
            prisma,
          )) ?? [];
        const startOrder =
          typeof highestOrder === 'number' ? highestOrder + 1 : 0;
        const otherViewFieldsInfo = created_fields.map(
          (field: any, index: number) => ({
            field_id: field.id,
            order: startOrder + index,
            text_wrap: field.text_wrap,
            width: field.width,
          }),
        );
        await this.emitter.emitAsync(
          'view.setFieldOrder',
          otherViewId,
          otherViewFieldsInfo,
          prisma,
        );
      }
    }

    return response;
  }

  async updateFields(
    updateFieldsPayload: UpdateFieldsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, update_fields } = updateFieldsPayload;

    let updated_options: any = {};
    const updated_fields: any[] = [];
    const records_payload: any[] = [];
    const update_records_columns_payload = {
      tableId,
      baseId,
      records_payload,
    };

    const field_ids = update_fields.map((field) => field.id);

    const existing_fields: field[] = await prisma.field.findMany({
      where: {
        tableMetaId: tableId,
        status: 'active',
      },
    });

    const existingFieldIds = existing_fields.map((field) => field.id);
    const missingFields = field_ids.filter(
      (id) => !existingFieldIds.includes(id),
    );
    if (missingFields.length > 0) {
      throw new BadRequestException('Fields not found');
    }

    for (const field of update_fields) {
      const { id, name, type, options, node_id } = field;

      // Check if field type requires option merging
      if (type === QUESTION_TYPE.DROP_DOWN) {
        const existing_field = existing_fields.find(
          (field) => field.id === id,
        ) as Record<string, any>;

        if (existing_field) {
          const existing_options = existing_field?.options || {};
          const existing_option_items = existing_options?.options || [];
          const new_option_items = options?.options || [];

          updated_options = {
            ...existing_options,
            ...options,
            options: [...existing_option_items, ...new_option_items],
          };
        }
      } else {
        updated_options = options;
      }

      // check if field with same name exists
      const existing_field_with_same_name = existing_fields.find(
        (field) => field.name === name && field.id !== id,
      );

      if (existing_field_with_same_name) {
        throw new BadRequestException(
          `Cannot create column with same title : ${name}. Please provide a unique title`,
        );
      }

      const existing_field = existing_fields.find((field) => field.id === id);

      const dbFieldType = this.getDbFieldType(type);

      const updated_field = await prisma.field.update({
        where: {
          id: id,
        },
        data: {
          name,
          type,
          dbFieldType,
          options: updated_options,
          nodeId: node_id ?? undefined,
        },
      });

      if (existing_field?.type !== type) {
        const payload = {
          column_name: updated_field.dbFieldName,
          data_type: updated_field.dbFieldType,
        };

        records_payload.push(payload);
      }

      updated_fields.push(updated_field);
    }

    if (update_records_columns_payload.records_payload.length > 0) {
      await this.emitter.emitAsync(
        'record.updateRecordColumns',
        update_records_columns_payload,
        prisma,
        '',
        false,
      );
    }

    return updated_fields;
  }

  async updateFieldsStatus(
    payload: UpdateFieldsStatusDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, status, fields } = payload;

    let field_records: any[];

    if (fields && fields.length > 0) {
      const field_ids = fields.map((field) => field.id);

      // First, check if we're trying to delete all fields
      const totalActiveFieldsCount = await prisma.field.count({
        where: {
          tableMetaId: tableId,
          status: 'active',
        },
      });

      if (field_ids.length >= totalActiveFieldsCount) {
        throw new BadRequestException('Cannot delete all fields from a table');
      }

      field_records = await prisma.field.findMany({
        where: {
          id: { in: field_ids },
          tableMetaId: tableId,
          status: 'active',
        },
      });
    } else {
      field_records = await prisma.field.findMany({
        where: {
          tableMetaId: tableId,
          status: 'active',
        },
      });
    }

    if (field_records.length === 0) {
      return [];
    }

    //check if applied field is there in filter or sort if there remove it and update the view
    const views_payload = {
      baseId: baseId,
      tableId,
    };

    const [views] = await this.emitter.emitAsync(
      'view.getViews',
      views_payload,
      prisma,
    );

    const field_ids = {};
    field_records.forEach((field) => {
      field_ids[field.id] = field.id;
    });

    for (const view of views) {
      const sort: Sort = view.sort;
      const filter: Filter = view.filter;
      const group: any = view.group; // GroupBy config

      let should_update_sort = false;
      let should_update_filter = false;
      let should_update_group_by = false;

      // Handle Sort
      if (!this.lodash.isEmpty(sort?.sortObjs)) {
        const { sortObjs } = sort;

        sort.sortObjs = sortObjs.filter((sortObj) => {
          const { fieldId } = sortObj;

          const should_keep = !field_ids[fieldId]; // Determine if the object should be kept
          if (!should_keep) {
            should_update_sort = true; // Set flag to true if an object is removed
          }
          return should_keep; // Keep objects where `fieldId` is NOT in `field_ids`
        });
      }

      // Handle Filter
      if (!this.lodash.isEmpty(filter)) {
        const originalFilter = JSON.stringify(filter); // Backup original filter for comparison

        this.filedUtils.getFilterFieldIdsAndClean({
          filter,
          field_ids,
        });

        // Check if the filter has changed
        if (JSON.stringify(filter) !== originalFilter) {
          should_update_filter = true;
        }
      }

      // Handle GroupBy
      if (!this.lodash.isEmpty(group?.groupObjs)) {
        const { groupObjs } = group;
        const originalGroupObjs = JSON.stringify(groupObjs);

        group.groupObjs = groupObjs.filter((groupObj) => {
          const { fieldId } = groupObj;
          const should_keep = !field_ids[fieldId];
          if (!should_keep) {
            should_update_group_by = true;
          }
          return should_keep;
        });

        // If all fields removed, set view.group to null
        if (group.groupObjs.length === 0) {
          view.group = null;
          should_update_group_by = true;
        } else if (JSON.stringify(group.groupObjs) !== originalGroupObjs) {
          should_update_group_by = true;
        }
      }

      // Update Sort if needed
      if (should_update_sort) {
        const update_sort_payload: UpdateSortPayloadDTO = {
          id: view.id,
          tableId: tableId,
          baseId: baseId,
          sort: sort,
          should_stringify: true,
        };

        await this.emitter.emitAsync(
          'view.updateSort',
          update_sort_payload,
          prisma,
        );
      }

      // Update Filter if needed
      if (should_update_filter) {
        const update_filter_payload: UpdateFilterPayloadDTO = {
          id: view.id,
          tableId: tableId,
          baseId: baseId,
          filter: filter,
          should_stringify: true,
        };

        await this.emitter.emitAsync(
          'view.updateFilters',
          update_filter_payload,
          prisma,
        );
      }

      // Update GroupBy if needed
      if (should_update_group_by) {
        const update_group_by_payload = {
          id: view.id,
          tableId: tableId,
          baseId: baseId,
          groupBy: view.group || { groupObjs: [] },
          should_stringify: true,
        };

        await this.emitter.emitAsync(
          'view.updateGroupBy',
          update_group_by_payload,
          prisma,
        );
      }
    }

    const erroredFields: field[] = [];

    for (let i = 0; i < field_records.length; i++) {
      const field = field_records[i];

      const [result] = await this.emitter.emitAsync(
        'table.removeComputedField',
        {
          tableId: tableId,
          columnName: field.dbFieldName,
        },
        prisma,
      );

      try {
        // Handle errored columns if any exist
        if (result.erroredColumns && result.erroredColumns.length > 0) {
          // Update each errored field's computedFieldMeta
          for (const errorInfo of result.erroredColumns) {
            try {
              // Find the field by dbFieldName from the error info
              const erroredField = await prisma.field.findFirst({
                where: {
                  tableMetaId: tableId,
                  dbFieldName: errorInfo.column, // Use the column name from error info
                  //   type: { in: ['FORMULA', 'ENRICHMENT'] }, // as field type can now belong to error fields after enrichements
                  status: 'active',
                },
              });

              if (erroredField) {
                // Update computedFieldMeta to add hasError flag
                const currentComputedFieldMeta =
                  erroredField.computedFieldMeta as any;

                // Determine shouldLoad based on field type
                const shouldShowLoading = erroredField.type === 'FORMULA';

                const updatedComputedFieldMeta = {
                  ...currentComputedFieldMeta,
                  hasError: true, // Add this key to computedFieldMeta
                  shouldShowLoading: shouldShowLoading,
                };

                // Update the field with hasError flag
                const updatedErroredFields = await prisma.field.update({
                  where: { id: erroredField.id },
                  data: {
                    computedFieldMeta: updatedComputedFieldMeta,
                  },
                });

                erroredFields.push(updatedErroredFields);
              }
            } catch (error) {
              throw new BadRequestException(
                `Error updating errored field ${errorInfo.column}`,
              );
            }
          }
        }
      } catch (error) {
        throw new BadRequestException(error);
      }

      await this.emitter.emitAsync('dependency.deleteReferences', { fieldId: field.id }, prisma);

      if (field.type === 'LINK') {
        const dependentFields = await prisma.field.findMany({
          where: {
            tableMetaId: tableId,
            status: 'active',
            type: { in: ['LOOKUP', 'ROLLUP'] },
          },
        });

        const dependentOnThisLink = dependentFields.filter((df: any) => {
          const opts: any = df.lookupOptions || df.options;
          if (!opts) return false;
          const linkFieldId = opts.linkFieldId;
          return linkFieldId && (linkFieldId === field.id || Number(linkFieldId) === field.id);
        });

        if (dependentOnThisLink.length > 0) {
          const depIds = dependentOnThisLink.map((df: any) => df.id);
          await prisma.field.updateMany({
            where: { id: { in: depIds } },
            data: { hasError: true },
          });

          const updatedDeps = await prisma.field.findMany({
            where: { id: { in: depIds } },
          });
          erroredFields.push(...updatedDeps);
        }
      }

      if (erroredFields.length > 0) {
        await this.emitter.emitAsync(
          'emitFormulaFieldErrors',
          erroredFields,
          tableId,
        );

        // to migrate the formula field data to null as errored fields
        await this.emitter.emitAsync('bullMq.enqueueJob', {
          jobName: 'formula_calculation',
          data: {
            baseId,
            tableId,
            viewId: views[0].id,
          },
          options: {
            delay: 3000,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        });
      }

      // Get the new dbFieldName from the emitter
      const update_db_field_name_array: string[] = await this.emitter.emitAsync(
        'record.getDeletedFieldName',
        field.dbFieldName,
        prisma,
      );

      if (update_db_field_name_array.length === 0) {
        throw new Error('Cannot update Field name');
      }

      const update_column_name_payload: RenameColumnDto = {
        tableId: tableId,
        baseId: baseId,
        current_name: field.dbFieldName,
        future_name: update_db_field_name_array[0],
      };

      // Skip column renaming for system fields
      if (!SYSTEM_FIELD_MAPPING[field.type]) {
        if (field.type === 'LINK' && field.options) {
          try {
            await this.emitter.emitAsync(
              'link.deleteLinkField',
              {
                fieldId: field.id,
                tableId,
                baseId,
                options: field.options,
              },
              prisma,
            );
          } catch (error) {
            console.error('Failed to cleanup link field:', error);
          }
        }

        // Emit rename column event
        await this.emitter.emitAsync(
          'record.renameColumn',
          update_column_name_payload,
          prisma,
        );
      }

      try {
        await prisma.field.update({
          where: {
            id: field.id,
          },
          data: {
            status: status, // Update status to 'inactive'
            dbFieldName: update_db_field_name_array[0], // Update dbFieldName
          },
        });
      } catch (e) {
        throw new BadRequestException('Could not Delete Column');
      }
    }

    try {
      const table_meta = await prisma.tableMeta.findUnique({
        where: {
          id: tableId,
        },
      });

      if (table_meta?.status === 'active') {
        this.emitter.emit('emit_deleted_fields', field_records, tableId);
      }
    } catch (e) {
      throw new BadRequestException('No Table Found');
    }

    return field_records;
  }

  async clearFieldsData(
    payload: ClearFieldsDatasDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, baseId, fields, viewId } = payload;

    // Get field details to check types
    const fieldIds = fields.map((field) => field.id);
    const fieldDetails = await prisma.field.findMany({
      where: {
        id: { in: fieldIds },
        tableMetaId: tableId,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    // Check if any of the fields are system fields
    const systemFields = fieldDetails.filter(
      (field) => SYSTEM_FIELD_MAPPING[field.type],
    );

    if (systemFields.length > 0) {
      const fieldNames = systemFields.map((field) => field.name).join(', ');

      throw new BadRequestException(
        `Cannot clear data for system fields: ${fieldNames}. These fields contain system-generated data.`,
      );
    }

    const fields_info = fields.map((field) => {
      return {
        field_id: field.id,
        data: null,
      };
    });

    const update_record_payload = {
      tableId: tableId,
      baseId: baseId,
      viewId: viewId,
      fields_info: fields_info,
      is_upsert: false,
      is_single_update: false,
      is_delete: false,
    };

    const updated_records = await this.emitter.emitAsync(
      'record.updateRecordsByFilters',
      update_record_payload,
      prisma,
    );

    const get_records_payload = {
      tableId,
      baseId,
      viewId: viewId,
      should_stringify: true,
    };

    const get_records_array = await this.emitter.emitAsync(
      'getRecords',
      get_records_payload,
      prisma,
    );

    this.emitter.emit('emit_get_records', get_records_array[0], tableId);

    return updated_records[0];
  }

  async getFieldsById(
    payload: getFieldsByIdsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { ids } = payload;

    try {
      const fields = await prisma.field.findMany({
        where: {
          id: {
            in: ids,
          },
          status: 'active',
        },
      });

      return fields;
    } catch (error) {
      throw new BadRequestException(
        `Could not find any fields with the given IDs: ${ids.join(', ')}`,
      );
    }
  }

  async createDuplicateFields(payload: any, prisma: Prisma.TransactionClient) {
    const { baseId, old_table_id, new_table_id } = payload;

    const fields = await this.getFields(old_table_id, prisma);

    if (fields.length === 0) {
      throw new BadRequestException('Could not find any fields');
    }

    // Create payloads for duplicating fields
    const fields_payload: CreateField[] = fields.map((field: any) => ({
      type: field.type,
      name: field.name,
      node_id: field.nodeId || undefined, // Ensure node_id is a string[]
      options: field.options || undefined,
      order: 1,
      source_id: field.id,
    }));

    // Construct the payload for creating new fields
    const create_multiple_new_fields_payload: CreateMultiFieldDto = {
      tableId: new_table_id,
      baseId: baseId,
      //   viewId: new_view_id, // cant send view id
      fields_payload: fields_payload, // Assign the generated fields
      should_update_order_in_view: false,
    };

    const created_fields = await this.createMultipleFields(
      create_multiple_new_fields_payload,
      prisma,
    );

    return created_fields;
  }

  async updateComputedFieldMeta(
    fieldId: number,
    meta: ComputedFieldMetaDTO,
    prisma: Prisma.TransactionClient,
  ): Promise<field> {
    try {
      const updated_field = await prisma.field.update({
        where: { id: fieldId },
        data: {
          computedFieldMeta: meta,
        },
      });

      return updated_field;
    } catch (e) {
      throw new BadRequestException('Could not update computed field meta');
    }
  }

  /**
   * Updates formula field expressions that depend on a specific field
   * Optimized approach using dependency graph from tableMeta
   * Single Responsibility: Targeted formula field expression updates
   *
   * @param tableId - The table ID
   * @param dbFieldName - The dbFieldName that changed
   * @param newDisplayName - The new display name
   * @param prisma - Prisma transaction client
   */
  private async updateDependentFormulaFieldExpressions(
    tableId: string,
    dbFieldName: string,
    newDisplayName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<field[] | undefined> {
    try {
      // Get the table's computedConfig to access dependency graph
      const [computedConfig] = await this.emitter.emitAsync(
        'table.getFormulaFieldConfig',
        tableId,
        prisma,
      );

      // Edge case 1: No computedConfig or dependency graph
      if (!computedConfig?.dependencyGraph) {
        return;
      }

      // Find formula fields that depend on the updated field
      const dependentFormulaFields = Object.keys(
        computedConfig.dependencyGraph,
      ).filter((col) =>
        computedConfig.dependencyGraph[col].includes(dbFieldName),
      );

      const updatedFields: field[] = [];

      // Update only the dependent formula fields
      for (const dependentColumnName of dependentFormulaFields) {
        try {
          // Find the formula field by dbFieldName
          const formulaField = await prisma.field.findFirst({
            where: {
              tableMetaId: tableId,
              dbFieldName: dependentColumnName,
              type: 'FORMULA',
              status: 'active',
            },
            select: {
              id: true,
              name: true,
              computedFieldMeta: true,
            },
          });

          // Edge case 2: Field not found
          if (!formulaField) {
            throw new BadRequestException(
              `Formula field with dbFieldName ${dependentColumnName} not found`,
            );
          }

          // Edge case 3: No computedFieldMeta
          if (!formulaField.computedFieldMeta) {
            throw new BadRequestException(
              `Formula field ${formulaField.name} has no computedFieldMeta`,
            );
          }

          const computedFieldMeta = formulaField.computedFieldMeta as any;

          // Edge case 4: No expression in computedFieldMeta
          if (!computedFieldMeta.expression) {
            throw new BadRequestException(
              `Formula field ${formulaField.name} has no expression`,
            );
          }

          // Update the expression with new display name
          const updatedExpression = this.updateExpressionFieldNames(
            computedFieldMeta.expression,
            dbFieldName,
            newDisplayName,
          );

          // Update the field's computedFieldMeta
          const updatedComputedFieldMeta = {
            ...computedFieldMeta,
            expression: updatedExpression,
          };

          const updatedField: field = await prisma.field.update({
            where: { id: formulaField.id },
            data: {
              computedFieldMeta: updatedComputedFieldMeta,
            },
          });

          updatedFields.push(updatedField);
        } catch (error) {
          throw new BadRequestException(
            `Error updating formula field ${dependentColumnName}:`,
          );
        }
      }
      return updatedFields;
    } catch (error) {
      throw new BadRequestException(
        'Error updating dependent formula field expressions',
      );
    }
  }

  /**
   * Updates field names in expression blocks while preserving dbFieldName references
   * Single Responsibility: Expression field name updates only
   *
   * @param expression - The formula expression object
   * @param dbFieldName - The dbFieldName to update
   * @param newDisplayName - The new display name
   * @returns Updated expression with new display name
   */
  private updateExpressionFieldNames(
    expression: any,
    dbFieldName: string,
    newDisplayName: string,
  ): any {
    // Edge case 1: Handle null/undefined expression
    if (!expression) {
      return expression;
    }

    // Edge case 2: Handle non-object expressions
    if (typeof expression !== 'object') {
      return expression;
    }

    // Edge case 3: Handle missing or invalid blocks
    if (!expression.blocks || !Array.isArray(expression.blocks)) {
      return expression;
    }

    // Edge case 4: Handle empty blocks array
    if (expression.blocks.length === 0) {
      return expression;
    }

    // Deep clone using structuredClone (modern browsers) or JSON method as fallback
    let updatedExpression: any;
    try {
      // Try structuredClone first (more reliable for complex objects)
      updatedExpression = structuredClone(expression);
    } catch (error) {
      // Fallback to JSON method if structuredClone fails
      try {
        updatedExpression = JSON.parse(JSON.stringify(expression));
      } catch (jsonError) {
        console.error('Failed to clone expression:', jsonError);
        // Return original if cloning fails
        return expression;
      }
    }

    // Update each block in the expression
    updatedExpression.blocks = updatedExpression.blocks.map((block: any) => {
      // Edge case 5: Handle null/undefined blocks
      if (!block || typeof block !== 'object') {
        return block;
      }

      // Only process FIELD type blocks
      if (block.type === 'FIELDS' && block.tableData) {
        // Edge case 6: Handle missing or invalid tableData
        if (!block.tableData.dbFieldName) {
          return block;
        }

        // Check if this is the field we need to update
        if (block.tableData.dbFieldName === dbFieldName) {
          // Edge case 7: Handle missing tableData properties
          const updatedTableData = {
            ...block.tableData,
            name: newDisplayName,
            // Keep dbFieldName unchanged for database stability
          };

          return {
            ...block,
            displayValue: newDisplayName,
            tableData: updatedTableData,
          };
        }
      }

      // Return unchanged block for non-FIELD types or unchanged fields
      return block;
    });

    return updatedExpression;
  }

  private async getAllFormulaFields(
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<field[]> {
    try {
      const fields = await prisma.field.findMany({
        where: {
          tableMetaId: tableId,
          type: 'FORMULA',
          status: 'active',
        },
      });

      return fields;
    } catch (error) {
      throw new BadRequestException('Error getting formula fields');
    }
  }

  async createEnrichmentField(
    payload: CreateEnrichmentFieldDto,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      tableId,
      baseId,
      viewId,
      fieldsToEnrich,
      name,
      description,
      type,
      entityType,
      identifier,
      options,
    } = payload;

    if (type !== 'ENRICHMENT') {
      throw new BadRequestException('Invalid field type');
    }

    // making sure enrichment field is the FIRST field
    const fieldsToCreate = [
      {
        name: name,
        type: 'ENRICHMENT',
        description,
        options,
      },
      ...fieldsToEnrich, // spread the selected fields after enrichment field
    ];

    const createMultipleFieldsPayload: CreateMultiFieldDto = {
      tableId,
      baseId,
      viewId,
      should_update_order_in_view: true,
      fields_payload: fieldsToCreate,
    };

    const createdFields = await this.createMultipleFields(
      createMultipleFieldsPayload,
      prisma,
    );

    const enrichedField = createdFields[0]; // First field is the enrichment field

    const config = getEnrichmentConfig(
      identifier,
      fieldsToEnrich, // original selected fields (without enrichment field)
      createdFields.slice(1), // all fields except the first one (enrichment field)
    );

    await this.emitter.emitAsync(
      'table.addEnrichmentDependenciesToConfig',
      tableId,
      config.identifier,
      config.fieldsToEnrich,
      enrichedField,
      prisma,
    );

    const updatedEnrichmentField = await prisma.field.update({
      where: {
        id: enrichedField.id,
      },
      data: {
        options: {
          ...options,
          config: config,
          entityType: entityType,
        },
        computedFieldMeta: {
          hasError: false,
        },
      },
    });

    createdFields[0] = {
      ...createdFields[0],
      ...updatedEnrichmentField,
    };

    await this.emitter.emitAsync('emitCreatedFields', createdFields, viewId, tableId);

    return updatedEnrichmentField;
  }

  async updateEnrichmentField(
    payload: UpdateEnrichmentFieldDto,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, name, description, options, baseId, tableId, viewId } = payload;

    // Step 1: Get existing enrichment field
    let existingField: field;
    try {
      existingField = await prisma.field.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (error) {
      throw new BadRequestException('Field not found');
    }

    if (existingField.type !== 'ENRICHMENT') {
      throw new BadRequestException('Field is not an enrichment field');
    }

    const currentConfig = (existingField.options as any)?.config;
    const newConfig = (options as any)?.config;

    // Step 2: Check if field with same name exists (excluding current field)
    if (name && name !== existingField.name) {
      const existing_field_with_same_name = await prisma.field.findFirst({
        where: {
          tableMetaId: tableId,
          name: name,
          NOT: { id: id },
          status: 'active',
        },
      });

      if (existing_field_with_same_name) {
        throw new BadRequestException(
          `Field with name "${name}" already exists`,
        );
      }
    }

    // Step 4: Check if identifier has changed
    const identifierChanged = hasIdentifierChanged(currentConfig, newConfig);

    // Step 5: Handle new fields in fieldsToEnrich (fields without field_id)
    const newFieldsToCreate = getNewEnabledFields(
      currentConfig?.fieldsToEnrich,
      newConfig?.fieldsToEnrich,
    );

    let createdFields: any[] = [];
    if (newFieldsToCreate.length > 0) {
      const createMultipleFieldsPayload: CreateMultiFieldDto = {
        tableId,
        baseId,
        viewId,
        should_update_order_in_view: true,
        fields_payload: newFieldsToCreate,
      };

      createdFields = await this.createMultipleFields(
        createMultipleFieldsPayload,
        prisma,
      );

      const updatedConfig = getEnrichmentConfig(
        newConfig.identifier,
        newConfig.fieldsToEnrich, // original selected fields (without enrichment field)
        createdFields, // all fields created
      );

      newConfig?.fieldsToEnrich.map((newField) => {
        if (!newField.field_id) {
          updatedConfig.fieldsToEnrich.forEach((field) => {
            if (newField.key === field.key) {
              newField.field_id = field.field_id;
            }
          });
        }
      });
    }

    const updatedOptions = {
      ...(existingField?.options as any),
      ...options,
      config: newConfig,
    };

    if (identifierChanged) {
      await this.emitter.emitAsync(
        'table.addEnrichmentDependenciesToConfig',
        tableId,
        newConfig.identifier,
        newConfig.fieldsToEnrich,
        existingField,
        prisma,
      );
    }

    // Step 6: Update the enrichment field
    const updatedEnrichmentField = await prisma.field.update({
      where: { id: id },
      data: {
        name,
        description,
        options: updatedOptions,
        computedFieldMeta: {
          ...(existingField?.computedFieldMeta as any),
          hasError: identifierChanged
            ? false
            : (existingField?.computedFieldMeta as any)?.hasError,
        },
      },
    });

    const response: {
      isExpressionUpdate: boolean;
      updatedFields: any[];
    } = {
      isExpressionUpdate: identifierChanged ? true : false,
      updatedFields: [updatedEnrichmentField],
    };

    await this.emitter.emitAsync('emitCreatedFields', createdFields, viewId, tableId);
    // Step 11: Emit updated fields to frontend with new structure
    await this.emitter.emitAsync('emit_updated_field', response, viewId, tableId);

    return updatedEnrichmentField;
  }
}
