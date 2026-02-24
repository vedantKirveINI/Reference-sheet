import { UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  WsException,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';
import { SocketAuthMiddleware } from 'src/middleware/ws.middleware';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import { GetRecordsPayloadSchema } from 'src/features/record/DTO/get-records.dto';
import { UpdateRecordStatusDTO } from 'src/features/record/DTO/update-reocrds-status.dto';
import { updateRowOrderDTO } from 'src/features/record/DTO/update-row-order.dto';
import { UpdateColumnOrderingDTO } from 'src/features/view/DTO/update-columns-ordering.dto';
import {
  CreateRecordDTO,
  CreateRecordSchema,
} from 'src/features/record/DTO/create-record.dto';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import {
  UpdateRecordsDTO,
  UpdateRecordsSchema,
} from 'src/features/record/DTO/update-records.dto';
import { UpdateColumnMetaDTO } from 'src/features/view/DTO/update-columnMeta.dto';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { OperationType } from 'src/common/enums/operation-type.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;
  socket!: Socket;
  clientSocket!: Socket;
  socket_id!: string;
  private readonly logger: Logger;

  constructor(
    private readonly emitter: EventEmitterService,
    private readonly prisma: PrismaService,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {
    this.logger = winstonLoggerService.logger;

    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'emit-createdField', handler: this.emitCreateField },
      { name: 'emit_updated_field', handler: this.emitUpdatedField },
      { name: 'emit_get_records', handler: this.emitGetRecords },
      { name: 'emit_deleted_records', handler: this.emitDeletedRecords },
      { name: 'emit_deleted_fields', handler: this.emitDeletedFields },
      { name: 'emit_filter_updated', handler: this.emitFilterUpdated },
      { name: 'emit_sort_updated', handler: this.emitSortUpdated },
      { name: 'emit_group_by_updated', handler: this.emitGroupByUpdated },
      { name: 'emit_updated_column_meta', handler: this.emitUpdatedColumnMeta },
      { name: 'emit_created_rows', handler: this.emitCreatedRows },
      { name: 'emitCreatedRow', handler: this.emitCreatedRow },
      { name: 'emitUpdatedRecord', handler: this.emitUpdatedRecord },
      { name: 'emitFormulaFieldErrors', handler: this.emitFormulaFieldErrors },
      { name: 'emitCreatedFields', handler: this.emitCreatedFields },
      {
        name: 'emitEnrichmentRequestSent',
        handler: this.emitEnrichmentRequestSent,
      },
      {
        name: 'recalc.broadcastChanges',
        handler: this.emitComputedFieldUpdate,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
    server.use(SocketAuthMiddleware());
  }

  handleConnection(client: Socket) {
    this.logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`);

    // Optional: leave all rooms (if needed)
    const rooms = Array.from(client.rooms).filter((room) => room !== client.id);

    for (const room of rooms) {
      client.leave(room);
      this.logger.debug(`Client ${client.id} left room ${room}`);
    }
  }

  @SubscribeMessage('getRecord')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecord(clientSocket: Socket, payload: any) {
    this.clientSocket = clientSocket;

    const updated_payload = this.mergeClientDataIntoPayload(
      clientSocket.data,
      payload,
    );

    this.validatePayload({
      payload: updated_payload,
      schema: GetRecordsPayloadSchema,
    });

    const { viewId } = updated_payload;

    let get_records: any[] = [];

    const executeGetRecords = async () => {
      await this.prisma.prismaClient.$transaction(async (prisma) => {
        const get_records_array: any[] = await this.emitter.emitAsync(
          'getRecords',
          updated_payload,
          prisma,
        );

        if (get_records_array.length === 0) {
          return;
        }

        get_records = get_records_array[0];
      });
    };

    try {
      await executeGetRecords();
    } catch (err: any) {
      if (err?.isCachedPlanError) {
        this.logger.warn('Retrying getRecords after connection pool reset (cached plan invalidated)');
        try {
          await this.prisma.prismaClient.$disconnect();
          await this.prisma.prismaClient.$connect();
        } catch (reconnectErr) {
          this.logger.warn('Connection pool reset failed', { error: reconnectErr });
        }
        await executeGetRecords();
      } else {
        throw err;
      }
    }

    if (get_records && viewId) {
      this.server.to(viewId).emit('recordsFetched', get_records);
      if (!clientSocket.rooms.has(viewId)) {
        clientSocket.emit('recordsFetched', get_records);
      }
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.logger.info(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('row_update')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateRow(clientSocket: Socket, payload: UpdateRecordsDTO) {
    this.validatePayload({
      payload: payload,
      schema: UpdateRecordsSchema,
    });

    this.clientSocket = clientSocket;

    const updated_payload = this.mergeClientDataIntoPayload(
      clientSocket.data,
      payload,
    );

    const { tableId, baseId } = updated_payload;

    let updated_records: any[] = [];

    try {
      await this.prisma.prismaClient.$transaction(async (prisma) => {
        const updated_records_array = await this.emitter.emitAsync(
          'updateRecord',
          updated_payload,
          prisma,
        );

        if (updated_records_array.length === 0) {
          return;
        }
        updated_records = updated_records_array[0];
      });

      const response = updated_records.map((result) => {
        return {
          ...result,
          socket_id: clientSocket.id,
        };
      });

      if (baseId) {
        const [defaultViewId = null] =
          (await this.emitter.emitAsync(
            'view.getDefaultViewId',
            tableId,
            baseId,
          )) ?? [];
        if (defaultViewId) {
          this.server.to(defaultViewId).emit('updated_row', response);
        }
      } else {
        this.server.to(tableId).emit('updated_row', response);
      }
      this.server.to(tableId).emit('records_changed', { tableId });
      return;
    } catch (e: any) {
      console.log('Inside Gateway', e);

      const errorMessage = e?.message || 'Unknown error occurred';
      throw new WsException(errorMessage);
    }
  }

  async emitUpdatedRecord(
    updated_records: any[],
    tableId: string,
    baseId?: string,
  ) {
    const response = updated_records.map((result) => {
      return {
        ...result,
        socket_id: this.clientSocket?.id,
      };
    });

    if (baseId) {
      const [defaultViewId = null] =
        (await this.emitter.emitAsync(
          'view.getDefaultViewId',
          tableId,
          baseId,
        )) ?? [];
      if (defaultViewId) {
        this.server.to(defaultViewId).emit('updated_row', response);
      }
    } else {
      this.server.to(tableId).emit('updated_row', response);
    }
    this.server.to(tableId).emit('records_changed', { tableId });
  }

  @SubscribeMessage('row_create')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createRow(clientSocket: Socket, payload: CreateRecordDTO) {
    this.clientSocket = clientSocket;

    this.validatePayload({ payload, schema: CreateRecordSchema });
    const { tableId, baseId } = payload;

    const payloadWithUser = {
      ...payload,
      user_id: clientSocket.data?.user_id,
    };

    let results: any[] = [];

    try {
      await this.prisma.prismaClient.$transaction(async (prisma) => {
        const created_records_arrays: any[] = await this.emitter.emitAsync(
          'createRecord',
          payloadWithUser,
          prisma,
        );

        if (created_records_arrays.length === 0) {
          return;
        }

        results = created_records_arrays[0];
      });

      const response = results.map((result) => {
        return {
          ...result,
          socket_id: clientSocket.id,
        };
      });

      if (baseId) {
        const [defaultViewId = null] =
          (await this.emitter.emitAsync(
            'view.getDefaultViewId',
            tableId,
            baseId,
          )) ?? [];
        if (defaultViewId) {
          this.server.to(defaultViewId).emit('created_row', response);
        }
      } else {
        this.server.to(tableId).emit('created_row', response);
      }
      this.server.to(tableId).emit('records_changed', { tableId });
    } catch (e: any) {
      console.log('Inside Gateway row_create', e);

      const errorMessage = e?.message || 'Unknown error occurred';
      throw new WsException(errorMessage);
    }
  }

  @SubscribeMessage('update_record_orders')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateRowOrders(clientSocket: Socket, payload: updateRowOrderDTO) {
    this.clientSocket = clientSocket;

    let updated_row_orders_array: any[] = [];

    const { tableId, baseId } = payload;

    await this.prisma.prismaClient.$transaction(async (prisma) => {
      updated_row_orders_array = await this.emitter.emitAsync(
        'record.updateRecordOrders',
        payload,
        prisma,
      );
    });

    const response = updated_row_orders_array[0];

    if (baseId) {
      const [defaultViewId = null] =
        (await this.emitter.emitAsync(
          'view.getDefaultViewId',
          tableId,
          baseId,
        )) ?? [];
      if (defaultViewId) {
        this.server.to(defaultViewId).emit('updated_record_orders', response);
      }
    } else {
      this.server.to(tableId).emit('updated_record_orders', response);
    }
    this.server.to(tableId).emit('records_changed', { tableId });
  }

  @SubscribeMessage('update_field_order')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateFieldOrder(
    clientSocket: Socket,
    payload: UpdateColumnOrderingDTO,
  ) {
    const { tableId, viewId, baseId } = payload;
    let get_records: any[] = [];

    await this.prisma.prismaClient.$transaction(async (prisma) => {
      await this.emitter.emitAsync(
        'view.updateColumnOrdering',
        payload,
        prisma,
      );

      const get_records_payload = {
        tableId: tableId,
        viewId: viewId,
        baseId: baseId,
        should_stringify: true,
      };

      const get_records_array: any[] = await this.emitter.emitAsync(
        'getRecords',
        get_records_payload,
        prisma,
      );

      get_records = get_records_array[0];
    });

    if (get_records) {
      this.server.to(tableId).emit('recordsFetched', get_records);
    }
  }

  async emitCreateField(created_field: any, viewId: string, tableId?: string) {
    this.server.to(viewId).emit('created_field', created_field);
    // Also emit to tableId room to notify non-default views
    const targetTableId =
      tableId || created_field?.tableMetaId || created_field?.tableId;
    if (targetTableId) {
      this.server
        .to(targetTableId)
        .emit('fields_changed', { tableId: targetTableId });
    }
  }

  async emitUpdatedField(updated_field: any, viewId: string, tableId?: string) {
    this.server.to(viewId).emit('updated_field', updated_field);
    // Also emit to tableId room to notify non-default views
    const targetTableId =
      tableId ||
      updated_field?.updatedFields?.[0]?.tableMetaId ||
      updated_field?.tableId;
    if (targetTableId) {
      this.server
        .to(targetTableId)
        .emit('fields_changed', { tableId: targetTableId });
    }
  }

  async emitDeletedRecords(
    deleted_records: UpdateRecordStatusDTO[],
    tableId: string,
    baseId?: string,
  ) {
    if (baseId) {
      const [defaultViewId = null] =
        (await this.emitter.emitAsync(
          'view.getDefaultViewId',
          tableId,
          baseId,
        )) ?? [];
      if (defaultViewId) {
        this.server.to(defaultViewId).emit('deleted_records', deleted_records);
      }
    } else {
      this.server.to(tableId).emit('deleted_records', deleted_records);
    }
    this.server.to(tableId).emit('records_changed', { tableId });
  }

  async emitGetRecords(getRecordResponse: any, roomId: string) {
    this.server.to(roomId).emit('recordsFetched', getRecordResponse);
  }

  async emitDeletedFields(deletedFields: any, viewId: string) {
    this.server.to(viewId).emit('deleted_fields', deletedFields);
  }

  async emitFilterUpdated(updated_view: any, tableId: string) {
    this.server.to(tableId).emit('filter_updated', updated_view);
  }

  async emitSortUpdated(updated_view: any, roomId: string) {
    this.server.to(roomId).emit('sort_updated', updated_view);
  }

  async emitGroupByUpdated(updated_view: any, roomId: string) {
    this.server.to(roomId).emit('group_by_updated', updated_view);
  }

  async emitCreatedRows(respone: any, tableId: string) {
    this.server.to(tableId).emit('created_rows', respone);
  }

  async emitCreatedRow(response: any, tableId: string, baseId?: string) {
    if (baseId) {
      const [defaultViewId = null] =
        (await this.emitter.emitAsync(
          'view.getDefaultViewId',
          tableId,
          baseId,
        )) ?? [];
      if (defaultViewId) {
        this.server.to(defaultViewId).emit('created_row', response);
      }
    } else {
      this.server.to(tableId).emit('created_row', response);
    }
    this.server.to(tableId).emit('records_changed', { tableId });
  }

  mergeClientDataIntoPayload = (clientData: any, payload: any): any => {
    return { ...payload, ...clientData };
  };

  validatePayload = ({ payload, schema }) => {
    const validation = new ZodValidationPipe(schema, true);

    // Call the transform method with the payload to be validated
    validation.transform(payload, {
      type: 'body',
    });
  };

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(clientSocket: Socket, roomId: string) {
    // Make the socket leave the specified room
    clientSocket.leave(roomId);
  }

  getToken(clientSocket: Socket) {
    const token: any = clientSocket.handshake.query.token;
    return token;
  }

  @SubscribeMessage('update_column_meta')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateColumnMeta(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() payload: UpdateColumnMetaDTO,
  ) {
    await this.prisma.prismaClient.$transaction(async (prisma) => {
      const [respone] = await this.emitter.emitAsync(
        'view.updateColumnMeta',
        payload,
        prisma,
      );

      const updatedResponse = { ...respone, socket_id: clientSocket.id };

      this.emitUpdatedColumnMeta(updatedResponse, payload.tableId);
    });
  }

  async emitUpdatedColumnMeta(response: any, tableId: string) {
    this.server.to(tableId).emit('updated_column_meta', response);
  }

  async emitFormulaFieldErrors(errors: any, tableId: string) {
    this.server.to(tableId).emit('formula_field_errors', errors);
  }

  async emitCreatedFields(createFields: any, viewId: string, tableId?: string) {
    this.server.to(viewId).emit('created_fields', createFields);
    // Also emit to tableId room to notify non-default views
    const targetTableId =
      tableId || createFields?.[0]?.tableMetaId || createFields?.[0]?.tableId;
    if (targetTableId) {
      this.server
        .to(targetTableId)
        .emit('fields_changed', { tableId: targetTableId });
    }
  }

  async emitEnrichmentRequestSent(response: any, tableId: string) {
    this.server.to(tableId).emit('enrichmentRequestSent', response);
  }

  async emitComputedFieldUpdate(payload: {
    tableId: string;
    baseId: string;
    recordIds: number[];
    fieldIds: number[];
    values: { [recordId: number]: { [fieldDbName: string]: any } };
  }) {
    const { tableId, baseId, recordIds, fieldIds, values } = payload;
    const broadcastPayload = {
      type: 'computed_field_update',
      tableId,
      recordIds,
      fieldIds,
      values,
    };

    if (baseId) {
      const [defaultViewId = null] =
        (await this.emitter.emitAsync(
          'view.getDefaultViewId',
          tableId,
          baseId,
        )) ?? [];
      if (defaultViewId) {
        this.server
          .to(defaultViewId)
          .emit('computed_field_update', broadcastPayload);
      }
    }
    this.server.to(tableId).emit('computed_field_update', broadcastPayload);
    this.server.to(tableId).emit('records_changed', { tableId });
  }
}
