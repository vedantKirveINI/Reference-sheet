import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AssetService } from '../../npmAssets/asset/asset.service';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { UpdateBaseSheetNameDTO } from './DTO/update-base-sheet-name.dto';
import { UpdateBaseStatusDTO } from './DTO/update-base.dto';
import { LoDashStatic } from 'lodash';
import { CreateBaseDTO } from './DTO/create-base.dto';
import { Request } from 'express';
import { GetSummaryDTO } from './DTO/get-summary.dto';
import { CreateDuplicateBaseDTO } from './DTO/create-duplicate-base.dto';

@Injectable()
export class BaseService {
  constructor(
    private readonly assetsService: AssetService,
    private readonly emitter: EventEmitterService,
    @Inject('Lodash') private readonly lodash: LoDashStatic,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'base.createBase', handler: this.createBase },
      { name: 'base.getBases', handler: this.getBases },
      { name: 'base.getBase', handler: this.getBase },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async createBase(
    createBasePayload: CreateBaseDTO,
    prisma: Prisma.TransactionClient,
    request: Request,
  ) {
    const {
      name = 'Untitled Table',
      createdBy,
      spaceId,
      user_id,
      access_token,
      parent_id,
      source,
    } = createBasePayload;

    let assetId: string;

    if (process.env.ENV === 'development') {
      const { nanoid } = require('nanoid');
      assetId = nanoid(24);
    } else {
      const create_assest_payload = {
        name: name,
        workspace_id: spaceId,
        user_id: user_id,
        access_token: access_token,
        parent_id: parent_id,
        linked_app: source,
      };

      const sheet_asset = await this.createAssest(create_assest_payload);
      assetId = sheet_asset.result._id;
    }

    const metadata = request.headers?.metadata
      ? { ...(request.headers.metadata as Record<string, any>) }
      : {};

    metadata.assetId = assetId;

    request.headers['metadata'] = metadata as any;

    let base: any;

    try {
      base = await prisma.base.create({
        data: {
          id: assetId,
          name: name,
          spaceId: spaceId,
          order: 1,
          createdBy: createdBy,
          source: source,
        },
      });
    } catch (err) {
      console.log('err', err);
      throw new BadRequestException(`Base was not created`);
    }

    const schema_name = `${base.id}`;

    const schema_query = `
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name = '${schema_name}'`;

    const is_schema_existing: [] = await prisma.$queryRawUnsafe(schema_query);

    if (is_schema_existing.length > 0) {
      throw new BadRequestException('Schema already exists');
    }
    // Define schema and table names

    // Create schema query
    const schemaQuery = `CREATE SCHEMA "${schema_name}"`;

    const schemaCreated = await prisma.$queryRawUnsafe(schemaQuery);

    // Check if schema creation was successful
    if (!schemaCreated) {
      throw new BadRequestException('Could not create schema');
    }

    return base;
  }

  async createAssest(create_assest_payload: any) {
    const {
      workspace_id,
      name = 'Untitled Table',
      access_token,
      parent_id,
      linked_app,
    } = create_assest_payload;

    const assetInstancePayload = {
      access_token: access_token,
    };

    const asset_instance =
      this.assetsService.getAssetInstance(assetInstancePayload);

    const body: Record<string, any> = {
      name: name,
      parent_id: parent_id,
      // parent_id: "xyz" if available else wont send this
      type: 'FILE',
      annotation: 'SHEET',
      workspace_id: workspace_id,
      meta: {
        test: 1,
      },
      ...(linked_app !== 'DUPLICATE' && { linked_app }),
    };

    let sheet_assest: any;
    try {
      sheet_assest = await asset_instance.save(body);
    } catch (error: any) {
      const errorMessage = error;

      throw new BadRequestException(errorMessage?.result);
    }

    return sheet_assest;
  }

  async getBases(spaceId: string, prisma: Prisma.TransactionClient) {
    const sheet_bases: any[] = await prisma.base.findMany({
      where: {
        spaceId: spaceId,
        status: 'active',
      },
    });

    if (sheet_bases.length === 0) {
      throw new BadRequestException(
        `No Sheet Exists with give organization id ${spaceId}`,
      );
    }

    return sheet_bases;
  }

  async getBase(
    payload: any,
    prisma: Prisma.TransactionClient,
    token: string,
    should_authenticate: boolean = true,
  ) {
    const { baseId, include_tables, include_views } = payload;

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

    const sheet_base = await prisma.base.findUnique({
      where: {
        id: baseId,
        status: 'active',
      },
      include: {
        tables: include_tables
          ? {
              orderBy: {
                createdTime: 'asc',
              },
              where: {
                status: 'active',
              },
              include: {
                views: include_views
                  ? {
                      orderBy: {
                        createdTime: 'asc',
                      },
                    }
                  : false,
              },
            }
          : false,
      },
    });

    if (!sheet_base) {
      throw new BadRequestException(
        `No Sheet Exists with given sheet id ${baseId}`,
      );
    }

    return sheet_base;
  }

  async updateBaseSheetName(
    updateSheetPayload: UpdateBaseSheetNameDTO,
    prisma: Prisma.TransactionClient,
    token: string,
  ) {
    const { id, name, should_update_asset } = updateSheetPayload;

    try {
      const updatedSheet = await prisma.base.update({
        where: { id: id },
        data: { name: name },
      });

      if (should_update_asset) {
        const assetInstancePayload = {
          access_token: token,
        };

        const asset_instance =
          this.assetsService.getAssetInstance(assetInstancePayload);
        await asset_instance.rename(id, name);
      }

      return updatedSheet;
    } catch (error) {
      throw new BadRequestException(
        `Could not update sheet name with given id ${id}`,
      );
    }
  }

  async updateMultipleBase(
    updateBaseStatusPayload: UpdateBaseStatusDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { whereObj, ...rest } = updateBaseStatusPayload;
    const data = rest;

    if (this.lodash.isEmpty(whereObj) || this.lodash.isEmpty(data)) {
      throw new Error('Atleast provide one where clause');
    }

    const where_clause = {};
    Object.keys(whereObj).map((key) => {
      where_clause[key] = { in: whereObj[key] };
    });

    let bases: any[];
    try {
      bases = await prisma.base.findMany({
        where: {
          ...where_clause,
        },
      });
    } catch (e) {
      throw new Error('Could not find Sheet');
    }

    if (bases.length === 0) {
      throw new Error('No Sheet Found');
    }

    const update_base_ids = bases.map((base) => base.id);

    try {
      await prisma.base.updateMany({
        where: { id: { in: update_base_ids } },
        data: data,
      });
    } catch (e) {
      throw new Error('Could not Update Sheet');
    }

    try {
      await this.emitter.emitAsync(
        'table.updateMultipleTables',
        {
          whereObj: {
            baseId: update_base_ids,
          },
          status: 'inactive',
        },
        prisma,
        '',
        false,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'An error occurred');
      }
      throw new Error('Could not update table');
    }

    const updated_bases = await prisma.base.findMany({
      where: { id: { in: update_base_ids } },
    });

    return updated_bases;
  }

  async createDuplicateBase(
    payload: CreateDuplicateBaseDTO,
    request: Request,
    prisma: Prisma.TransactionClient,
    token: string,
    should_authenticate: boolean,
  ) {
    const { asset_id, parent_id, name, workspace_id, user_id } = payload;

    const [space] = await this.emitter.emitAsync(
      'space.createSpace',
      {
        id: workspace_id,
        createdBy: user_id,
      },
      prisma,
    );

    let base;
    try {
      base = await prisma.base.findFirstOrThrow({
        where: {
          id: asset_id,
          status: 'active',
        },
      });
    } catch (e) {
      throw new BadRequestException('Base Not Found');
    }

    const new_base_payload: CreateBaseDTO = {
      name: name || `${base.name} (Copy)`, // Add a distinct name for the duplicated base
      spaceId: workspace_id,
      createdBy: base.createdBy,
      access_token: token,
      parent_id: parent_id || '',
      source: 'DUPLICATE',
    };

    //   with previous baseId it can have multiple tables

    const new_base = await this.createBase(new_base_payload, prisma, request);

    const [old_tables]: any[] = await this.emitter.emitAsync(
      'table.getTables',
      { baseId: asset_id },
      prisma,
      token,
      false,
    );

    const new_tables: any[] = [];

    for (const old_table of old_tables) {
      const new_table_payload = {
        baseId: new_base.id,
        tableId: old_table.id,
      };

      const [new_table] = await this.emitter.emitAsync(
        'table.createDuplicateTable',
        new_table_payload,
        prisma,
        token,
        false,
      );
      new_tables.push(new_table);
    }

    const respone = {
      ...new_base,
      tables: new_tables,
    };

    return respone;
  }

  async getSheetSummary(
    payload: GetSummaryDTO,
    prisma: Prisma.TransactionClient,
    token: string,
    should_authenticate = true,
  ) {
    const { baseId } = payload;

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

    let sheet_summary;

    try {
      sheet_summary = await prisma.base.findUniqueOrThrow({
        where: {
          id: baseId,
          status: 'active',
        },
      });
    } catch (e) {
      throw new BadRequestException('Sheet not found or inactive');
    }

    try {
      const [tables_summary] = await this.emitter.emitAsync(
        'table.getTableSummary',
        payload,
        prisma,
        token,
        false,
      );

      const response = {
        id: sheet_summary.id,
        name: sheet_summary.name,
        tables: tables_summary,
      };

      return response;
    } catch (e) {
      throw new BadRequestException('Could not get Sheet Summary');
    }
  }
}
