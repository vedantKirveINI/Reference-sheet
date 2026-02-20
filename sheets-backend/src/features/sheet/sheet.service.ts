import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateMultiFieldDto } from '../field/DTO/create-multiple-fields.dto';
import { createFormSheetScehmeDTO } from './DTO/create-form-sheet.dto';
import { Prisma } from '@prisma/client';
import { updateFormSheetFieldsDTO } from './DTO/update-form-sheet-fields.dto';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { Request } from 'express';
import { AssetService } from 'src/npmAssets/asset/asset.service';
import { PermissionResult } from 'src/guards/role-permission.guard';
import { CreateAiEnrichmentSheetDTO } from './DTO/create-ai-enrichment-sheet.dto';
import { CreateSheetDTO } from './DTO/create-sheet.dto';
import { CreateEnrichmentFieldDto } from '../field/DTO/create-enrichment-field.dto';

@Injectable()
export class SheetService {
  constructor(
    private readonly emitter: EventEmitterService,
    private readonly assetsService: AssetService,
  ) {}

  async createSheet(
    createSheetPayload: CreateSheetDTO,
    prisma: Prisma.TransactionClient,
    request: Request,
    token: string,
  ) {
    const {
      workspace_id,
      user_id = '123',
      parent_id,
      enrichment,
    } = createSheetPayload;

    const create_space_payload = {
      id: workspace_id,
      createdBy: user_id,
    };

    const space_array = await this.emitter.emitAsync(
      'space.createSpace',
      create_space_payload,
      prisma,
    );

    const space = space_array[0];

    if (!space) {
      throw new BadRequestException('Could not create Space');
    }

    const create_base_payload = {
      spaceId: space?.id,
      createdBy: user_id,
      user_id: user_id,
      access_token: token,
      parent_id: parent_id,
    };

    const base_array = await this.emitter.emitAsync(
      'base.createBase',
      create_base_payload,
      prisma,
      request,
    );

    const base = base_array[0];

    if (!base) {
      throw new BadRequestException('Could not create Base');
    }

    const create_table_payload = {
      name: 'Untitled Table 1',
      baseId: base?.id,
      version: 1,
      createdBy: user_id,
    };

    const table_meta_array = await this.emitter.emitAsync(
      'table-createTable',
      create_table_payload,
      prisma,
    );

    const tabelMeta = table_meta_array[0];

    if (!tabelMeta) {
      throw new BadRequestException('Could not create Table');
    }

    const create_view_payload = {
      table_id: tabelMeta.id,
      baseId: base.id,
      name: 'Default View',
      type: 'users view',
      version: 1,
      columnMeta: '',
      order: 1,
      createdBy: user_id,
    };

    const view_array = await this.emitter.emitAsync(
      'view.createView',
      create_view_payload,
      prisma,
    );

    const view = view_array[0];

    if (enrichment) {
      // Create enrichment fields instead of default field
      const enrichmentResult = await this.createEnrichmentFieldsForSheet(
        enrichment,
        tabelMeta.id,
        base.id,
        view.id,
        prisma,
      );

      return {
        base: base,
        table: tabelMeta,
        view: view,
        enrichmentField: enrichmentResult,
      };
    } else {
      //Default Field Creation
      const create_field_payload = {
        type: 'SHORT_TEXT',
        name: 'Name',
        order: 1,
        tableId: tabelMeta.id,
        baseId: base.id,
        viewId: view.id,
      };

      const field_array = await this.emitter.emitAsync(
        'field.createField',
        create_field_payload,
        prisma,
      );

      const field = field_array[0];

      if (!field) {
        throw new BadRequestException('Could not create Default Fields');
      }

      //   TODO create 5 default records
      const payload = {
        tableId: tabelMeta.id,
        baseId: base.id,
        viewId: view.id,
        fields_info: [
          {
            data: '',
            field_id: field.id,
          },
        ],
      };

      for (let i = 0; i < 5; i++) {
        const record_payload = { ...payload, order: i + 1 };

        await this.emitter.emitAsync('createRecord', record_payload, prisma);
      }

      return {
        base: base,
        table: tabelMeta,
        view: view,
      };
    }
  }

  async createFormSheet(
    createFormSheetPayload: createFormSheetScehmeDTO,
    prisma: Prisma.TransactionClient,
    request: Request,
  ) {
    const {
      workspace_id,
      access_token,
      user_id = '123',
      parent_id,
      form_name,
      fields_payload,
    } = createFormSheetPayload;

    //TODO - getUserId from accesToken

    const create_space_payload = {
      id: workspace_id,
      createdBy: user_id,
    };

    // const space = await this.spaceService.createSpace(create_space_payload);

    // const space_array = await this.emitter.emitAsync(
    //   'space.createSpace',
    //   create_space_payload,
    //   prisma,
    // );

    const space_array = await this.emitter.emitAsync(
      'space.createSpace',
      create_space_payload,
      prisma,
    );

    if (space_array.length === 0) {
      throw new BadRequestException('Space was not created');
    }

    const space = space_array[0];

    if (!space) {
      throw new BadRequestException('Could not create Space');
    }

    const create_base_payload = {
      name: form_name,
      spaceId: space?.id,
      createdBy: user_id,
      user_id: user_id,
      access_token: access_token,
      parent_id: parent_id,
      source: 'FC',
    };

    // const base = await this.baseService.createBase(create_base_payload);

    const base_array = await this.emitter.emitAsync(
      'base.createBase',
      create_base_payload,
      prisma,
      request,
    );

    const base = base_array[0];

    if (!base) {
      throw new BadRequestException('Could not create Base');
    }

    const create_table_payload = {
      name: 'Response',
      baseId: base?.id,
      version: 1,
      createdBy: user_id,
    };

    // const tabelMeta = await this.tableService.createTable(create_table_payload);

    const table_meta_array = await this.emitter.emitAsync(
      'table-createTable',
      create_table_payload,
      prisma,
    );

    const tabelMeta = table_meta_array[0];

    if (!tabelMeta) {
      throw new BadRequestException('Could not create Table');
    }

    const create_view_payload = {
      baseId: base.id,
      table_id: tabelMeta.id,
      name: 'Default View',
      type: 'users view',
      version: 1,
      columnMeta: '{}',
      order: 1,
      createdBy: user_id,
    };

    // create a view first
    // const view = await this.viewService.createView(create_view_payload);

    const view_array = await this.emitter.emitAsync(
      'view.createView',
      create_view_payload,
      prisma,
    );

    const view = view_array[0];

    // const create_record_column_payload = {
    //   tableId: tabelMeta.id,
    //   baseId: base.id,
    //   data_type: 'float8',
    //   column_name: `_row_view${view.id}`,
    // };

    // const record = await this.recordService.createRecordColumn(
    //   create_record_column_payload,
    // );

    // const record = await this.emitter.emitAsync(
    //   'record.create_record_column',
    //   create_record_column_payload,
    //   prisma,
    //   token,
    //   false,
    // );

    // const record = record_array[0];

    const create_multiple_fields_payload: CreateMultiFieldDto = {
      viewId: view.id,
      tableId: tabelMeta.id,
      baseId: base.id,
      fields_payload: fields_payload,
    };

    const fields_array = await this.emitter.emitAsync(
      'field.createMultipleFields',
      create_multiple_fields_payload,
      prisma,
    );

    if (fields_array[0] === undefined) {
      throw new BadRequestException('Could not create Fields');
    }

    const fields = fields_array[0];

    const [updated_view] = await this.emitter.emitAsync(
      'view.getViewById',
      view.id,
      prisma,
    );

    const respone = {
      fields: fields,
      table: tabelMeta,
      view: updated_view,
      base: base,
      space: space,
    };

    return respone;
  }

  async updateFormSheetFields(
    updateFormSheetFieldPayload: updateFormSheetFieldsDTO,
    prisma: Prisma.TransactionClient,
    token: string,
    should_authenticate: boolean = true,
  ) {
    const { baseId, tableId, viewId, fields_payload } =
      updateFormSheetFieldPayload;

    if (should_authenticate) {
      const permissions_payload = { token: token, asset_id: baseId };

      const [permissions]: any = await this.emitter.emitAsync(
        'permission.getPermissions',
        permissions_payload,
      );

      if (!permissions?.result?.can_access) {
        throw new UnauthorizedException('You don’t have access');
      }
    }

    // Check for duplicate field names within the payload
    const fieldNames = new Set<string>();
    const duplicateNames: string[] = [];

    fields_payload.forEach((field: Record<string, any>) => {
      //  not trimming the name as asked by priyanka ma'am
      const fieldName = field.name;
      if (fieldName) {
        if (fieldNames.has(fieldName)) {
          duplicateNames.push(fieldName);
        } else {
          fieldNames.add(fieldName);
        }
      }
    });

    if (duplicateNames.length > 0) {
      throw new BadRequestException(
        `Cannot create field with same name. Please select a unique field name. Duplicate names found: ${duplicateNames.join(', ')}`,
      );
    }

    const highest_order_array = this.emitter.emitAsync(
      'view.getHighestOrderOfColumn',
      { viewId },
      prisma,
    );

    const highest_order = highest_order_array[0];

    const create_fields: any[] = [];
    const update_fields: any[] = [];

    const [all_fields] = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    const all_field_ids_mapping = {};

    all_fields.forEach((field) => {
      all_field_ids_mapping[field.id] = field;
    });

    fields_payload.forEach((field: Record<string, any>, index: number) => {
      // get all fields of table check if all ids exists if not then add those to create_fields
      if (field.id && all_field_ids_mapping[field.id]) {
        update_fields.push(field);
      } else {
        create_fields.push({ ...field, order: highest_order + 1 + index });
      }
    });

    let created_fields: any[] = [];
    let updated_fields: any[] = [];

    if (create_fields.length > 0) {
      const create_multiple_fields_payload: CreateMultiFieldDto = {
        viewId: viewId,
        tableId: tableId,
        baseId: baseId,
        fields_payload: create_fields,
      };

      const [createdFields] = await this.emitter.emitAsync(
        'field.createMultipleFields',
        create_multiple_fields_payload,
        prisma,
      );

      if (!createdFields) {
        throw new BadRequestException('Could not Create Fields');
      }
      created_fields = createdFields;

      await this.emitter.emitAsync('emitCreatedFields', createdFields, viewId, tableId);
    }

    if (update_fields.length > 0) {
      const update_fields_payload = {
        baseId: baseId,
        tableId: tableId,
        update_fields: update_fields,
      };

      const updated_fields_array = await this.emitter.emitAsync(
        'field.updateFields',
        update_fields_payload,
        prisma,
      );

      if (updated_fields_array[0] === undefined) {
        throw new BadRequestException('Could not update fields');
      }

      updated_fields = updated_fields_array[0];

      const response = {
        updatedFields: updated_fields,
      };

      await this.emitter.emitAsync('emit_updated_field', response, viewId, tableId);
    }

    return {
      baseId,
      tableId,
      viewId,
      fields_payload: [...created_fields, ...updated_fields],
    };
  }

  async getSheets(spaceId: string, prisma: Prisma.TransactionClient) {
    const sheets_array = await this.emitter.emitAsync(
      'base.getBases',
      spaceId,
      prisma,
    );

    const sheets = sheets_array[0] || [];

    return sheets;
  }

  async getSheet(
    payload: any,
    prisma: Prisma.TransactionClient,
    token: string,
    userPermissions: PermissionResult,
  ) {
    const { baseId } = payload;
    const { can_access, can_edit } = userPermissions;

    // This condition ignore when its a public view
    if (can_access && can_edit) {
      try {
        const assetInstancePayload = {
          access_token: token,
        };

        const asset_instance =
          this.assetsService.getAssetInstance(assetInstancePayload);

        // To save opened/updated time,
        await asset_instance.save({ _id: baseId });
      } catch (e) {
        throw new BadRequestException(e);
      }
    }

    const sheets_array = await this.emitter.emitAsync(
      'base.getBase',
      payload,
      prisma,
      token,
      false,
    );

    const sheet = sheets_array[0] || [];

    return sheet;
  }

  async createAiEnrichmentSheet(
    createAiEnrichmentSheetPayload: CreateAiEnrichmentSheetDTO,
    prisma: Prisma.TransactionClient,
    request: Request,
    token: string,
  ) {
    const {
      workspace_id,
      user_id = '123',
      parent_id,
      asset_name = 'Prospect Sheet',
      table_name = 'Prospect Table',
      fields_payload,
      records,
    } = createAiEnrichmentSheetPayload;

    // Create space (similar to createFormSheet)
    const create_space_payload = {
      id: workspace_id,
      createdBy: user_id,
    };

    const [space] = await this.emitter.emitAsync(
      'space.createSpace',
      create_space_payload,
      prisma,
    );

    if (!space) {
      throw new BadRequestException('Could not create Space');
    }

    // Create base with AI enrichment source
    const create_base_payload = {
      name: asset_name,
      spaceId: space?.id,
      createdBy: user_id,
      user_id: user_id,
      access_token: token,
      parent_id: parent_id,
    };

    const base_array = await this.emitter.emitAsync(
      'base.createBase',
      create_base_payload,
      prisma,
      request,
    );

    const base = base_array[0];

    if (!base) {
      throw new BadRequestException('Could not create Base');
    }

    // Create AI enrichment table using the table service
    const create_ai_table_payload = {
      table_name: table_name,
      baseId: base.id,
      user_id: user_id,
      fields_payload: fields_payload,
    };

    const [aiTableResult] = await this.emitter.emitAsync(
      'table.createAiEnrichmentTable',
      create_ai_table_payload,
      prisma,
    );

    const { table: tableMeta, view: updated_view, fields } = aiTableResult;

    // temporary solution asked by ankit sir for asyn
    // Process records if provided
    if (records && records.length > 0) {
      // Format the data for processWebhookProspectData
      const webhookPayload = {
        items: records, // Your records array goes here
        meta: {
          tableId: tableMeta.id,
          baseId: base.id,
          viewId: updated_view.id,
          fields: fields,
        },
      };

      // Call processWebhookProspectData directly
      await this.emitter.emitAsync(
        'table.processWebhookProspectData',
        webhookPayload,
        prisma,
      );
    }

    const response = {
      fields: fields,
      table: tableMeta,
      view: updated_view,
      base: base,
      space: space,
    };

    return response;
  }

  private async createEnrichmentFieldsForSheet(
    enrichmentConfig: any,
    tableId: string,
    baseId: string,
    viewId: string,
    prisma: Prisma.TransactionClient,
  ) {
    // 1. Create the input fields
    const inputFieldsPayload = enrichmentConfig.inputFields.map(
      (inputField, index) => ({
        name: inputField.name,
        type: 'SHORT_TEXT', // Default type for input fields
        order: index + 1,
        description: inputField.description,
      }),
    );

    const createMultipleFieldsPayload: CreateMultiFieldDto = {
      tableId,
      baseId,
      viewId,
      should_update_order_in_view: true,
      fields_payload: inputFieldsPayload,
    };

    const [createdInputFields] = await this.emitter.emitAsync(
      'field.createMultipleFields',
      createMultipleFieldsPayload,
      prisma,
    );

    // 2. Create the payload for createEnrichmentField function
    // Format identifier with dbFieldName and field_id
    const identifier = createdInputFields.map((field, index) => {
      const inputField = enrichmentConfig.inputFields[index];
      return {
        key: inputField.key,
        field_id: field.id,
        dbFieldName: field.dbFieldName,
        required: inputField.required,
      };
    });

    // fieldsToEnrich is just the output fields from frontend config
    const fieldsToEnrich = enrichmentConfig.outputFields.map((field) => ({
      key: field.key,
      name: field.name,
      type: field.type,
    }));

    // 3. Hit the createEnrichmentField function
    const createEnrichmentFieldPayload: CreateEnrichmentFieldDto = {
      tableId,
      baseId,
      viewId,
      name: enrichmentConfig.label,
      description: enrichmentConfig.description,
      type: 'ENRICHMENT',
      entityType: enrichmentConfig.key, // Use 'key' instead of 'type' for entityType
      identifier: identifier,
      fieldsToEnrich: fieldsToEnrich,
      options: {
        enrichmentType: enrichmentConfig.key, // Use 'key' instead of 'type'
        autoUpdate: false,
      },
    };

    const response = await this.emitter.emitAsync(
      'field.createEnrichmentField',
      createEnrichmentFieldPayload,
      prisma,
    );

    return response;
  }
}
