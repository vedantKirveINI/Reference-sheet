import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_VIEW_TYPE } from './view.constants';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import { Sort, UpdateSortPayloadDTO } from './DTO/update_sort.dto';
import { Filter, UpdateFilterPayloadDTO } from './DTO/update_filter.dto';
import { GroupBy, UpdateGroupByPayloadDTO } from './DTO/update_group_by.dto';
import { UpdateColumnOrderingDTO } from './DTO/update-columns-ordering.dto';
import { FieldInfo } from '../field/interfaces/field_info.interface';
import { GetHighestOrderColumnDTO } from './DTO/get-highest-order-column.dto';
import { LoDashStatic } from 'lodash';
import { GetViewPayloadDTO } from './DTO/get-view.dto';
import { View } from './DTO/view.dto';
import { UpdateColumnMetaDTO } from './DTO/update-columnMeta.dto';
import { UpdateViewPayloadDTO } from './DTO/update_view.dto';
import { DeleteViewPayloadDTO } from './DTO/delete_view.dto';

@Injectable()
export class ViewService {
  private readonly logger: Logger;

  constructor(
    private emitter: EventEmitterService,
    @Inject('Lodash') private readonly lodash: LoDashStatic,
    private winstonLoggerService: WinstonLoggerService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = this.winstonLoggerService.logger;
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'view.getFieldOrder', handler: this.getFieldOrder },
      { name: 'view.getView', handler: this.getView },
      { name: 'view.createView', handler: this.createView },
      { name: 'view.updateFilters', handler: this.updateFilters },
      { name: 'view.getViewById', handler: this.getViewById },
      {
        name: 'view.getHighestOrderOfColumn',
        handler: this.getHighestOrderOfColumn,
      },
      {
        name: 'view.setFieldOrder',
        handler: this.setFieldOrder,
      },
      {
        name: 'view.updateColumnOrdering',
        handler: this.updateColumnOrdering,
      },
      {
        name: 'view.getViews',
        handler: this.getViews,
      },
      {
        name: 'view.updateSort',
        handler: this.updateSort,
      },
      {
        name: 'view.updateGroupBy',
        handler: this.updateGroupBy,
      },
      {
        name: 'view.createDuplicateView',
        handler: this.createDuplicateView,
      },
      {
        name: 'view.updateColumnMeta',
        handler: this.updateColumnMeta,
      },
      {
        name: 'view.updateView',
        handler: this.updateView,
      },
      {
        name: 'view.deleteView',
        handler: this.deleteView,
      },
      {
        name: 'view.getDefaultViewId',
        handler: this.getDefaultViewId,
      },
      {
        name: 'view.getViewIdsByTableId',
        handler: this.getViewIdsByTableId,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async getFieldOrder(viewId: string, prisma: Prisma.TransactionClient) {
    try {
      const view = await prisma.view.findFirst({
        where: {
          id: viewId,
        },
      });
      return view?.columnMeta;
    } catch (e) {
      throw new BadRequestException(`No View with ID ${viewId}`);
    }
  }

  /**
   * Returns all view IDs for a table. Used when adding a new field to all views.
   */
  async getViewIdsByTableId(
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<string[]> {
    const views = await prisma.view.findMany({
      where: { tableId, status: 'active' },
      select: { id: true },
    });
    return views.map((v) => v.id);
  }

  async getView(tableId: string, prisma: Prisma.TransactionClient) {
    try {
      const view = await prisma.view.findFirst({
        where: {
          tableId: tableId,
        },
      });

      return view;
    } catch (error) {
      throw new BadRequestException('Could not find view');
    }
  }

  /**
   * Returns the view id of the default (editing) view for the table.
   * Uses DEFAULT_VIEW_TYPE first; falls back to first view by order for existing tables.
   */
  async getDefaultViewId(
    tableId: string,
    baseId: string,
  ): Promise<string | null> {
    const table = await this.prisma.prismaClient.tableMeta.findFirst({
      where: { id: tableId, baseId },
      include: {
        views: {
          where: { status: 'active' },
          orderBy: [{ order: 'asc' }, { createdTime: 'asc' }],
        },
      },
    });
    if (!table?.views?.length) return null;
    const defaultView = table.views.find((v) => v.type === DEFAULT_VIEW_TYPE);
    return defaultView?.id ?? table.views[0]?.id ?? null;
  }

  async createView(createViewPayload: any, prisma: Prisma.TransactionClient) {
    const {
      table_id,
      baseId,
      name = 'Default View',
      type: typeFromPayload = 'users view',
      version = 1,
      columnMeta: providedColumnMeta, // Rename to distinguish from reference
      order = 1,
      createdBy = 'anonymous', // typo fix
      source_id,
      filter,
      sort,
      options,
    } = createViewPayload;

    const existingViews = await prisma.view.findMany({
      where: { tableId: table_id, status: 'active' },
    });
    const isFirstView = existingViews.length === 0;
    const alreadyHasDefault = existingViews.some(
      (v) => v.type === DEFAULT_VIEW_TYPE,
    );
    let type: string;
    if (isFirstView) {
      type = DEFAULT_VIEW_TYPE;
    } else if (typeFromPayload === DEFAULT_VIEW_TYPE && alreadyHasDefault) {
      type = 'grid';
    } else {
      type = typeFromPayload || 'users view';
    }

    // Merge columnMeta: reference view as base, provided columnMeta as override
    let finalColumnMeta: string = '{}';

    // Get reference view's columnMeta (if available)
    const referenceView = await this.getReferenceViewForColumnMeta(
      null, // View not created yet
      table_id,
      baseId,
      source_id,
      prisma,
    );

    // Parse reference columnMeta (if exists)
    let referenceColumnMeta: Record<string, any> = {};
    if (
      referenceView &&
      referenceView.columnMeta &&
      referenceView.columnMeta !== '{}'
    ) {
      try {
        referenceColumnMeta = JSON.parse(referenceView.columnMeta);
      } catch (error) {
        // Invalid JSON in reference view - use empty object as base
        this.logger.warn(
          `Invalid columnMeta JSON in reference view, using empty object as base`,
          { error },
        );
        referenceColumnMeta = {};
      }
    }

    // Parse provided columnMeta (if provided)
    let providedColumnMetaObj: Record<string, any> = {};
    if (providedColumnMeta && providedColumnMeta !== '{}') {
      try {
        providedColumnMetaObj = JSON.parse(providedColumnMeta);
      } catch (error) {
        // Invalid JSON in provided columnMeta - use empty object as override
        this.logger.warn(
          `Invalid columnMeta JSON in payload, ignoring provided columnMeta`,
          { error },
        );
        providedColumnMetaObj = {};
      }
    }

    // Merge: reference as base, provided as override
    const mergedColumnMeta = {
      ...referenceColumnMeta,
      ...providedColumnMetaObj,
    };
    finalColumnMeta = JSON.stringify(mergedColumnMeta);

    let view: any;

    const create_view_payload = {
      name,
      type,
      version,
      columnMeta: finalColumnMeta, // Use merged columnMeta
      order,

      createdBy,
      source_id,
      filter,
      sort,
      table: {
        connect: { id: table_id },
      },
      options,
    };

    try {
      view = await prisma.view.create({
        data: create_view_payload,
      });

      const create_record_column_payload = {
        tableId: table_id,
        baseId: baseId,
        data_type: 'float8',
        column_name: `_row_view${view.id}`,
      };

      await this.emitter.emitAsync(
        'record.create_record_column',
        create_record_column_payload,
        prisma,
      );
    } catch (error) {
      throw new BadRequestException(`Could not create view`);
    }

    const dynamic_column_name = `_row_view${view.id}`;
    const sequence_name = dynamic_column_name;
    const schema_name = baseId; // Just schema, not `"schema".table` combo

    const create_sequence_query = `
      CREATE SEQUENCE IF NOT EXISTS "${schema_name}"."${sequence_name}"
      START WITH 1
      INCREMENT BY 1
      NO CYCLE;
    `;

    try {
      await prisma.$executeRawUnsafe(create_sequence_query);

      const alter_column_default_query = `
        ALTER TABLE "${baseId}".${table_id}
        ALTER COLUMN "${dynamic_column_name}"
        SET DEFAULT nextval('"${baseId}"."${dynamic_column_name}"');
      `;

      await prisma.$executeRawUnsafe(alter_column_default_query);
    } catch (e) {
      throw new BadRequestException('Could not create the sequence');
    }

    // Backfill order values for existing records
    await this.backfillViewOrderValues(
      view.id,
      table_id,
      baseId,
      dynamic_column_name,
      sequence_name,
      source_id,
      prisma,
    );

    return view;
  }

  /**
   * Backfills order values for existing records in a newly created view.
   * Uses source_id if provided, otherwise finds the first created view as reference.
   * Falls back to __id if no reference view is available.
   */
  private async backfillViewOrderValues(
    viewId: string,
    tableId: string,
    baseId: string,
    orderColumnName: string,
    sequenceName: string,
    sourceId: string | undefined,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const referenceView = await this.findReferenceView(
        viewId,
        tableId,
        baseId,
        sourceId,
        prisma,
      );

      // Only backfill if we found a reference view
      if (referenceView) {
        await this.backfillFromReferenceView(
          tableId,
          baseId,
          orderColumnName,
          referenceView.id,
          referenceView.orderColumn,
          sourceId !== undefined,
          prisma,
        );
      }
      // If no reference view found, skip backfilling (don't use __id fallback)

      // Always sync sequence (even if no backfill happened)
      await this.syncSequence(
        baseId,
        sequenceName,
        tableId,
        orderColumnName,
        prisma,
      );

      const source = referenceView
        ? `reference view ${referenceView.id}`
        : 'no reference view found (skipped backfill)';
      this.logger.info(
        `Backfilled order values for existing records in view ${viewId} from ${source}`,
        {},
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // For database errors, we should fail view creation
      // because the view won't be properly set up
      this.logger.error(
        `Failed to backfill order values for view ${viewId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error,
      );
      throw new BadRequestException(
        `Failed to backfill order values for view: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Finds the reference view to use for backfilling.
   * Returns null if no reference view is available.
   */
  private async findReferenceView(
    currentViewId: string,
    tableId: string,
    baseId: string,
    sourceId: string | undefined,
    prisma: Prisma.TransactionClient,
  ): Promise<{ id: string; orderColumn: string } | null> {
    if (sourceId) {
      return this.validateAndGetSourceView(sourceId, tableId, baseId, prisma);
    }

    return this.findFirstCreatedView(currentViewId, tableId, baseId, prisma);
  }

  /**
   * Validates and returns the source view if source_id is provided.
   */
  private async validateAndGetSourceView(
    sourceId: string,
    tableId: string,
    baseId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<{ id: string; orderColumn: string }> {
    const sourceViews = await this.getViews({ id: sourceId, baseId }, prisma);

    if (!sourceViews || sourceViews.length === 0) {
      throw new BadRequestException(
        `Source view with ID ${sourceId} does not exist`,
      );
    }

    const sourceView = sourceViews[0];

    if (sourceView.tableId !== tableId) {
      throw new BadRequestException(
        `Source view ${sourceId} does not belong to table ${tableId}. Source view belongs to table ${sourceView.tableId}`,
      );
    }

    return {
      id: sourceId,
      orderColumn: `_row_view${sourceId}`,
    };
  }

  /**
   * Finds the first created view (oldest) to use as reference.
   * Returns null if no other views exist.
   */
  private async findFirstCreatedView(
    currentViewId: string,
    tableId: string,
    baseId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<{ id: string; orderColumn: string } | null> {
    const allViews = await this.getViews({ tableId, baseId }, prisma);

    const otherViews = allViews
      .filter((v) => v.id !== currentViewId)
      .sort((a, b) => {
        const aTime = new Date(a.createdTime || 0).getTime();
        const bTime = new Date(b.createdTime || 0).getTime();
        return aTime - bTime;
      });

    if (otherViews.length === 0) {
      return null;
    }

    const firstView = otherViews[0];
    return {
      id: firstView.id,
      orderColumn: `_row_view${firstView.id}`,
    };
  }

  /**
   * Gets the reference view to copy columnMeta from.
   * Returns the view object with columnMeta, or null if no reference view exists.
   */
  private async getReferenceViewForColumnMeta(
    currentViewId: string | null, // null if view not created yet
    tableId: string,
    baseId: string,
    sourceId: string | undefined,
    prisma: Prisma.TransactionClient,
  ): Promise<{ columnMeta: string } | null> {
    if (sourceId) {
      // Case 1: source_id provided - get source view's columnMeta
      const sourceViews = await this.getViews({ id: sourceId, baseId }, prisma);
      if (!sourceViews || sourceViews.length === 0) {
        return null; // Source view doesn't exist, fallback to default
      }
      const sourceView = sourceViews[0];
      if (sourceView.tableId !== tableId) {
        return null; // Source view belongs to different table, fallback to default
      }
      return { columnMeta: sourceView.columnMeta || '{}' };
    }

    // Case 2: source_id NOT provided - get first created view's columnMeta
    const allViews = await this.getViews({ tableId, baseId }, prisma);
    const otherViews = allViews
      .filter((v) => !currentViewId || v.id !== currentViewId) // Exclude current view if it exists
      .sort((a, b) => {
        const aTime = new Date(a.createdTime || 0).getTime();
        const bTime = new Date(b.createdTime || 0).getTime();
        return aTime - bTime; // ASC order (oldest first)
      });

    if (otherViews.length === 0) {
      return null; // No other views exist, fallback to default
    }

    const firstView = otherViews[0];
    return { columnMeta: firstView.columnMeta || '{}' };
  }

  /**
   * Validates that the reference order column exists in the table.
   */
  private async validateOrderColumnExists(
    baseId: string,
    tableId: string,
    orderColumn: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const columnCheckQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = '${baseId}'
        AND table_name = '${tableId}'
        AND column_name = '${orderColumn}';
    `;

    const columnExists: any[] = await prisma.$queryRawUnsafe(columnCheckQuery);

    if (!columnExists || columnExists.length === 0) {
      throw new BadRequestException(
        `Reference view order column ${orderColumn} does not exist in table`,
      );
    }
  }

  /**
   * Backfills order values from a reference view's order column.
   */
  private async backfillFromReferenceView(
    tableId: string,
    baseId: string,
    targetColumn: string,
    referenceViewId: string,
    referenceOrderColumn: string,
    useCoalesce: boolean,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    await this.validateOrderColumnExists(
      baseId,
      tableId,
      referenceOrderColumn,
      prisma,
    );

    const updateClause = useCoalesce
      ? `COALESCE("${referenceOrderColumn}"::double precision, "${targetColumn}")`
      : `"${referenceOrderColumn}"::double precision`;

    const backfillQuery = `
      UPDATE "${baseId}".${tableId}
      SET "${targetColumn}" = ${updateClause}
      WHERE __status = 'active'
        AND "${referenceOrderColumn}" IS NOT NULL
        AND "${targetColumn}" IS NULL;
    `;

    await prisma.$executeRawUnsafe(backfillQuery);
  }

  /**
   * Backfills order values using __id as fallback.
   */
  private async backfillFromId(
    tableId: string,
    baseId: string,
    targetColumn: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const backfillQuery = `
      UPDATE "${baseId}".${tableId}
      SET "${targetColumn}" = __id::double precision
      WHERE __status = 'active'
        AND "${targetColumn}" IS NULL;
    `;

    await prisma.$executeRawUnsafe(backfillQuery);
  }

  /**
   * Syncs the sequence current value to the maximum order value.
   */
  private async syncSequence(
    baseId: string,
    sequenceName: string,
    tableId: string,
    orderColumn: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const syncSequenceQuery = `
      SELECT setval(
        '"${baseId}"."${sequenceName}"'::regclass,
        GREATEST(COALESCE((SELECT MAX("${orderColumn}")::bigint FROM "${baseId}".${tableId}), 0)::bigint, 1),
        true
      );
    `;

    try {
      await prisma.$executeRawUnsafe(syncSequenceQuery);
    } catch (e) {
      throw new BadRequestException(`Could not sync sequence`);
    }
  }

  async updateFilters(
    updateFilterPayload: UpdateFilterPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, filter, tableId, baseId, should_stringify } =
      updateFilterPayload;

    let updated_view: any = {};
    try {
      updated_view = await prisma.view.update({
        where: {
          id: id,
        },
        data: {
          filter: filter,
        },
      });
    } catch (e) {
      throw new BadRequestException(
        `Could not update the filters with given ${id}`,
      );
    }

    const get_records_payload = {
      tableId,
      baseId,
      viewId: id,
      should_stringify,
    };

    const get_records_array = await this.emitter.emitAsync(
      'getRecords',
      get_records_payload,
      prisma,
    );

    await this.emitter.emitAsync(
      'emit_get_records',
      get_records_array[0],
      id, // Emit to viewId room instead of tableId
    );

    await this.emitter.emitAsync('emit_filter_updated', updated_view, tableId);

    return updated_view; // Optionally return the updated view
  }

  async updateSort(
    updateSortPayload: UpdateSortPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, sort, tableId, baseId, should_stringify } = updateSortPayload;

    try {
      const updated_view = await prisma.view.update({
        where: {
          id: id,
        },
        data: {
          sort: sort,
        },
      });

      const get_records_payload = {
        tableId,
        baseId,
        viewId: id,
        should_stringify,
      };

      // Do a socket emit of getRecord to this particular View
      const get_records_array = await this.emitter.emitAsync(
        'getRecords',
        get_records_payload,
        prisma,
      );

      this.emitter.emit('emit_get_records', get_records_array[0], id); // Emit to viewId room instead of tableId
      this.emitter.emit('emit_sort_updated', updated_view, id); // Emit to viewId room instead of tableId

      return updated_view; // Optionally return the updated view
    } catch (e) {
      throw new BadRequestException(`Could not  sort with given ${id}`);
    }
  }

  async updateGroupBy(
    updateGroupByPayload: UpdateGroupByPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, groupBy, tableId, baseId, should_stringify } =
      updateGroupByPayload;

    try {
      // First, verify the view exists and belongs to the correct table
      const existingView = await prisma.view.findFirst({
        where: {
          id: id,
          tableId: tableId,
        },
      });

      if (!existingView) {
        throw new BadRequestException(
          `View with id ${id} not found or does not belong to table ${tableId}`,
        );
      }

      // Handle empty groupBy: set to null when groupObjs is empty array
      const groupByData =
        !groupBy.groupObjs || groupBy.groupObjs.length === 0
          ? Prisma.JsonNull
          : groupBy;

      const updated_view = await prisma.view.update({
        where: {
          id: id,
        },
        data: {
          group: groupByData as any,
        },
      });

      const get_records_payload = {
        tableId,
        baseId,
        viewId: id,
        should_stringify,
      };

      // Fetch records with correct sort order (groupBy fields first, then sort fields)
      const get_records_array = await this.emitter.emitAsync(
        'getRecords',
        get_records_payload,
        prisma,
      );

      const get_records_response = get_records_array[0];

      // Emit records first, then group_by_updated event (similar to updateSort)
      this.emitter.emit('emit_get_records', get_records_response, id); // Emit to viewId room instead of tableId
      this.emitter.emit('emit_group_by_updated', updated_view, id); // Emit to viewId room instead of tableId

      return updated_view; // Optionally return the updated view
    } catch (e) {
      // Log the actual error for debugging
      console.error('Error updating groupBy:', e);

      // If it's already a BadRequestException, re-throw it
      if (e instanceof BadRequestException) {
        throw e;
      }

      // Otherwise, throw a more descriptive error
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(
        `Could not update groupBy with given ${id}: ${errorMessage}`,
      );
    }
  }

  async getViewById(
    id: string,
    prisma: Prisma.TransactionClient,
  ): Promise<View> {
    try {
      const view = await prisma.view.findFirst({
        where: { id },
      });

      if (!view) {
        throw new BadRequestException('Could not find view');
      }

      return view;
    } catch (error) {
      throw new BadRequestException('Could not find view');
    }
  }

  async getHighestOrderOfColumn(
    payload: GetHighestOrderColumnDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { viewId } = payload;
    let highest_order = Number.NEGATIVE_INFINITY;

    const view = await this.getViewById(viewId, prisma);

    if (
      this.lodash.isEmpty(view.columnMeta) ||
      this.lodash.isEmpty(JSON.parse(view.columnMeta || '{}'))
    ) {
      return 0;
    }

    try {
      const column_meta = JSON.parse(view.columnMeta || '{}');

      for (const key in column_meta) {
        if (column_meta.hasOwnProperty(key)) {
          if (column_meta[key].order > highest_order) {
            highest_order = column_meta[key].order;
          }
        }
      }

      return highest_order;
    } catch (e) {
      throw new BadRequestException('Could not get Highest Order of Column');
    }
  }

  async updateColumnOrdering(
    payload: UpdateColumnOrderingDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { viewId, fields } = payload;

    const ids: number[] = [];
    const field_info: FieldInfo[] = [];

    fields.forEach((field) => {
      const { field_id, order } = field;

      ids.push(field_id);

      field_info.push({
        field_id,
        order,
      });
    });

    await this.emitter.emitAsync(
      'field.getFieldsById',
      {
        ids: ids,
      },
      prisma,
    );

    await this.setFieldOrder(viewId, field_info, prisma);

    return payload;
  }

  async setFieldOrder(
    viewId: string,
    field_info: FieldInfo[],
    prisma: Prisma.TransactionClient,
  ) {
    const field_order = await this.getFieldOrder(viewId, prisma);

    let parsedFieldOrder = {};

    if (field_order) {
      parsedFieldOrder = JSON.parse(field_order);
    }

    field_info.forEach((element: any) => {
      const fieldData: any = {
        ...parsedFieldOrder[element.field_id],
        order: element.order,
      };

      if (element.width !== undefined) {
        fieldData.width = element.width;
      }

      if (element.text_wrap !== undefined) {
        fieldData.text_wrap = element.text_wrap;
      }

      const newField = {
        [element.field_id]: fieldData,
      };

      parsedFieldOrder = { ...parsedFieldOrder, ...newField };
    });

    try {
      const updated_view = await prisma.view.update({
        where: { id: viewId },
        data: {
          columnMeta: JSON.stringify(parsedFieldOrder),
        },
      });

      return updated_view;
    } catch (e) {
      throw new BadRequestException('Could Not Update the View');
    }
  }

  async getViews(
    getViewsPayload: GetViewPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { baseId, is_field_required = false } = getViewsPayload;

    const where_clause: any = {};

    // List of keys to exclude from the where_clause
    const excluded_keys = ['baseId', 'is_field_required', 'user_id'];

    // Dynamically build the where_clause, excluding undefined, null values and excluded keys
    Object.entries(getViewsPayload).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        !excluded_keys.includes(key)
      ) {
        if (key === 'id' && Array.isArray(value)) {
          where_clause[key] = { in: value }; // Use Prisma's `in` operator for arrays
        } else {
          where_clause[key] = value;
        }
      }
    });

    const views = await prisma.view.findMany({
      where: where_clause,
      orderBy: { createdTime: 'desc' },
    });

    // If 'is_field_required' is true, extract field IDs from column_meta of each view
    let field_ids: number[] = [];
    const view_field_map: { [key: string]: number[] } = {};

    if (is_field_required) {
      views.forEach((view: any) => {
        // Parse columnMeta only if it's a valid JSON object, otherwise initialize it as an empty object
        let columnMeta: { [key: string]: any } = {};
        try {
          columnMeta = JSON.parse(view.columnMeta ?? '{}'); // If columnMeta is empty or invalid, it will default to an empty object
        } catch (error) {
          console.error('Error parsing columnMeta:', error);
          columnMeta = {}; // Fallback to an empty object if JSON.parse fails
        }

        if (
          columnMeta &&
          typeof columnMeta === 'object' &&
          Object.keys(columnMeta).length > 0
        ) {
          // Extract all field IDs from columnMeta and convert them to numbers
          const field_ids_in_view: number[] = Object.keys(columnMeta).map(
            (key) => parseInt(key, 10),
          ); // Convert string keys to numbers
          field_ids = [...field_ids, ...field_ids_in_view];
          view_field_map[view.id] = field_ids_in_view;
        }
      });
    }

    const payload = {
      ids: field_ids,
    };

    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      payload,
      prisma,
    );

    if (is_field_required) {
      const views_with_fields = views.map((view: any) => {
        const related_field_ids = view_field_map[view.id] || [];

        // Filter the fields related to this view by matching the field IDs
        const related_fields = fields.filter((field: any) =>
          related_field_ids.includes(field.id),
        );

        // Return the view with the associated fields
        return {
          ...view,
          fields: related_fields,
        };
      });

      return views_with_fields;
    }

    return views;
  }

  async createDuplicateView(payload: any, prisma: Prisma.TransactionClient) {
    const { viewId, tableId, user_id, baseId } = payload;

    const views: View[] = await this.getViews(
      {
        id: viewId,
        baseId,
      },
      prisma,
    );

    const view = views[0];

    if (!view) {
      throw new BadRequestException('Could not find view');
    }
    // take column Meta of view
    // braing new fields with this tableId
    const [fields] = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    const field_id_mapping = fields.reduce((acc, field) => {
      acc[field.source_id] = field.id; //old_field_id against new_field_id
      return acc;
    }, {});

    // Destructure sort, columnMeta, and filter from the original view
    const { sort, columnMeta, filter } = view;

    // Initialize variables to store new values
    let new_sort;
    let new_columnMeta;
    let new_filter;

    // Transform the sort if it exists and is not empty
    if (sort && !this.lodash.isEmpty(sort)) {
      new_sort = this.createNewSort(field_id_mapping, sort);
    }

    // Transform the columnMeta if it exists and is not empty
    if (columnMeta && !this.lodash.isEmpty(columnMeta)) {
      const column_meta = JSON.parse(columnMeta);
      new_columnMeta = JSON.stringify(
        this.createNewColumnMeta(field_id_mapping, column_meta),
      );
    }

    // Transform the filter if it exists and is not empty
    if (filter && !this.lodash.isEmpty(filter)) {
      new_filter = this.createNewFilter(field_id_mapping, filter);
    }

    const create_new_payload = {
      baseId: baseId,
      table_id: tableId,
      name: `${view.name} (Copy)`,
      createdBy: user_id,
      source_id: view.id,
      columnMeta: new_columnMeta,
      sort: new_sort,
      filter: new_filter,
    };

    const created_vioew = await this.createView(create_new_payload, prisma);

    return created_vioew;
  }

  createNewColumnMeta(field_id_mapping: Record<string, number>, column_meta) {
    return Object.entries(column_meta)
      .filter(([key]) => field_id_mapping.hasOwnProperty(key))
      .reduce((acc, [key, value]) => {
        acc[field_id_mapping[key]] = value;
        return acc;
      }, {});
  }

  createNewSort(field_id_mapping: Record<string, number>, sort: Sort): Sort {
    const { sortObjs, manualSort } = sort;

    // Return a new sort object with updated fieldIds
    const new_SortObjs = sortObjs.map((sortObj) => {
      const field_id = sortObj.fieldId.toString(); // Ensure the key is a string for mapping
      if (field_id in field_id_mapping) {
        return { ...sortObj, fieldId: field_id_mapping[field_id] };
      }
      return sortObj; // Return unchanged if no mapping is found
    });

    return { sortObjs: new_SortObjs, manualSort };
  }

  createNewFilter(
    field_id_mapping: Record<string, number>,
    filter: Filter,
  ): Filter {
    const transformNode = (node: any): any => {
      if (node.field && field_id_mapping[node.field]) {
        // For LeafNodeSchema, replace the field if it's mapped
        node.field = field_id_mapping[node.field];
      }

      if (node.childs) {
        // For GroupNodeSchema, recursively transform each child
        node.childs = node.childs.map(transformNode);
      }

      return node;
    };

    return transformNode(filter);
  }

  async updateColumnMeta(
    payload: UpdateColumnMetaDTO,
    prisma: Prisma.TransactionClient,
    is_http = false,
  ): Promise<UpdateColumnMetaDTO> {
    const { baseId, columnMeta, viewId } = payload;

    // Step 2: Fetch the existing columnMeta from the view
    let view: any;
    try {
      view = await prisma.view.findUniqueOrThrow({
        where: {
          id: viewId,
        },
        select: {
          columnMeta: true,
        },
      });
    } catch (e) {
      throw new BadRequestException(`Error fetching view with ID ${viewId}`);
    }

    // Step 3: Parse the existing columnMeta
    let parsed_column_meta: Record<string, any>;
    try {
      parsed_column_meta = view.columnMeta ? JSON.parse(view.columnMeta) : {};
    } catch (e) {
      throw new BadRequestException(
        `Error parsing column metadata for view ID ${viewId}`,
      );
    }

    // Step 4: Update the parsed columnMeta with new values
    for (const column_meta of columnMeta) {
      const { id, width, text_wrap, is_hidden, color } = column_meta;
      if (!id) {
        throw new BadRequestException(
          'Column metadata entry is missing the "id" property.',
        );
      }

      // Ensure the column meta object is updated correctly
      parsed_column_meta[id] = {
        ...(parsed_column_meta[id] || {}),
        ...(width ? { width } : {}),
        ...(text_wrap ? { text_wrap } : {}),
        ...(is_hidden !== undefined ? { is_hidden } : {}),
        ...(color !== undefined ? { color } : {}),
      };
    }

    // Step 5: Stringify the updated columnMeta and update the view
    const stringified_column_meta = JSON.stringify(parsed_column_meta);

    try {
      await prisma.view.update({
        where: {
          id: viewId,
        },
        data: {
          columnMeta: stringified_column_meta,
        },
      });
    } catch (e) {
      throw new BadRequestException(
        `Could not update column metadata for view ID ${viewId}`,
      );
    }

    // Step 6: Emit socket event when called via HTTP (similar to updateSort)
    if (is_http) {
      const { tableId } = payload;
      this.emitter.emit('emit_updated_column_meta', payload, tableId);
    }

    // Step 7: Return the original payload as the response
    return payload;
  }

  async updateView(
    updateViewPayload: UpdateViewPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, name, order, tableId, baseId, options, type } =
      updateViewPayload;
    console.log('updateViewPayload ----->', updateViewPayload);

    try {
      // Validate view exists and belongs to the correct table
      const existingView = await prisma.view.findFirst({
        where: {
          id,
          tableId,
        },
      });

      if (!existingView) {
        throw new BadRequestException(
          `View with id ${id} not found or does not belong to table ${tableId}`,
        );
      }

      // Build update data object (only include fields that are provided)
      const updateData: any = {};
      if (name !== undefined) {
        updateData.name = name;
      }
      if (order !== undefined) {
        updateData.order = order;
      }
      if (options !== undefined) {
        updateData.options = options;
      }
      if (type !== undefined) {
        updateData.type = type;
      }

      const updated_view = await prisma.view.update({
        where: { id },
        data: updateData,
      });

      console.log('updated_view ----->', updated_view);

      // Emit event
      this.emitter.emit('emit_view_updated', updated_view, tableId);

      return updated_view;
    } catch (e) {
      // If it's already a BadRequestException, re-throw it
      if (e instanceof BadRequestException) {
        throw e;
      }

      // Otherwise, throw a more descriptive error
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(
        `Could not update view with given ${id}: ${errorMessage}`,
      );
    }
  }

  async deleteView(
    deleteViewPayload: DeleteViewPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, tableId, baseId } = deleteViewPayload;

    try {
      // Validate view exists and belongs to the correct table
      const existingView = await prisma.view.findFirst({
        where: {
          id,
          tableId,
        },
      });

      if (!existingView) {
        throw new BadRequestException(
          `View with id ${id} not found or does not belong to table ${tableId}`,
        );
      }

      // Check if view is already deleted
      if (existingView.status === 'inactive') {
        throw new BadRequestException(`View with id ${id} is already deleted`);
      }

      // Update view: set status to 'inactive'
      const deleted_view = await prisma.view.update({
        where: { id },
        data: {
          status: 'inactive',
        },
      });

      // Emit event
      this.emitter.emit('emit_view_deleted', deleted_view, tableId);

      return deleted_view;
    } catch (e) {
      // If it's already a BadRequestException, re-throw it
      if (e instanceof BadRequestException) {
        throw e;
      }

      // Otherwise, throw a more descriptive error
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(
        `Could not delete view with given ${id}: ${errorMessage}`,
      );
    }
  }
}
