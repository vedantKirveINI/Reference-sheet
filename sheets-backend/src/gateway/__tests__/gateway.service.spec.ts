import { GatewayService } from '../gateway.service';

describe('GatewayService', () => {
  let service: GatewayService;
  let mockEmitter: any;
  let mockPrisma: any;
  let mockWinstonLogger: any;
  let mockServer: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };
    mockPrisma = {
      prismaClient: {
        $transaction: jest.fn((fn: any) => fn(mockPrisma.prismaClient)),
        $disconnect: jest.fn(),
        $connect: jest.fn(),
      },
    };
    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    };

    service = new GatewayService(mockEmitter, mockPrisma, mockWinstonLogger);

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      use: jest.fn(),
    };
    (service as any).server = mockServer;
  });

  describe('constructor and registerEvents', () => {
    it('should register all event handlers', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map(
        (call: any) => call[0],
      );
      expect(eventNames).toContain('emit-createdField');
      expect(eventNames).toContain('emit_updated_field');
      expect(eventNames).toContain('emit_get_records');
      expect(eventNames).toContain('emit_deleted_records');
      expect(eventNames).toContain('emit_deleted_fields');
      expect(eventNames).toContain('emit_filter_updated');
      expect(eventNames).toContain('emit_sort_updated');
      expect(eventNames).toContain('emit_group_by_updated');
      expect(eventNames).toContain('emit_updated_column_meta');
      expect(eventNames).toContain('emit_created_rows');
      expect(eventNames).toContain('emitCreatedRow');
      expect(eventNames).toContain('emitUpdatedRecord');
      expect(eventNames).toContain('emitFormulaFieldErrors');
      expect(eventNames).toContain('emitCreatedFields');
      expect(eventNames).toContain('emitEnrichmentRequestSent');
      expect(eventNames).toContain('recalc.broadcastChanges');
    });
  });

  describe('afterInit', () => {
    it('should apply socket auth middleware', () => {
      const mockServerArg = { use: jest.fn() };
      service.afterInit(mockServerArg as any);
      expect(mockServerArg.use).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('handleConnection', () => {
    it('should log client connected', () => {
      const client = { id: 'client-123' } as any;
      service.handleConnection(client);
      expect(mockWinstonLogger.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('client-123'),
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnected and leave rooms', () => {
      const client = {
        id: 'client-123',
        rooms: new Set(['client-123', 'room-1', 'room-2']),
        leave: jest.fn(),
      } as any;

      service.handleDisconnect(client);
      expect(mockWinstonLogger.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('client-123'),
      );
      expect(client.leave).toHaveBeenCalledWith('room-1');
      expect(client.leave).toHaveBeenCalledWith('room-2');
      expect(client.leave).not.toHaveBeenCalledWith('client-123');
    });
  });

  describe('emitCreateField', () => {
    it('should emit created_field to viewId room', async () => {
      const field = { id: 'f1', tableMetaId: 'table-1' };
      await service.emitCreateField(field, 'view-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-1');
      expect(mockServer.emit).toHaveBeenCalledWith('created_field', field);
    });

    it('should emit fields_changed to tableId room', async () => {
      const field = { id: 'f1' };
      await service.emitCreateField(field, 'view-1', 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith('fields_changed', {
        tableId: 'table-1',
      });
    });
  });

  describe('emitUpdatedField', () => {
    it('should emit updated_field to viewId room', async () => {
      const field = { updatedFields: [{ tableMetaId: 'table-1' }] };
      await service.emitUpdatedField(field, 'view-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-1');
      expect(mockServer.emit).toHaveBeenCalledWith('updated_field', field);
    });
  });

  describe('emitDeletedRecords', () => {
    it('should emit deleted_records to tableId when no baseId', async () => {
      const records = [{ id: 1 }];
      await service.emitDeletedRecords(records as any, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith('deleted_records', records);
    });

    it('should emit deleted_records to default view when baseId provided', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['view-default']);
      const records = [{ id: 1 }];
      await service.emitDeletedRecords(records as any, 'table-1', 'base-1');

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'view.getDefaultViewId',
        'table-1',
        'base-1',
      );
      expect(mockServer.to).toHaveBeenCalledWith('view-default');
    });
  });

  describe('emitGetRecords', () => {
    it('should emit recordsFetched to room', async () => {
      const data = [{ id: 1 }];
      await service.emitGetRecords(data, 'room-1');

      expect(mockServer.to).toHaveBeenCalledWith('room-1');
      expect(mockServer.emit).toHaveBeenCalledWith('recordsFetched', data);
    });
  });

  describe('emitDeletedFields', () => {
    it('should emit deleted_fields to viewId', async () => {
      const fields = [{ id: 'f1' }];
      await service.emitDeletedFields(fields, 'view-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-1');
      expect(mockServer.emit).toHaveBeenCalledWith('deleted_fields', fields);
    });
  });

  describe('emitFilterUpdated', () => {
    it('should emit filter_updated to tableId', async () => {
      const view = { filter: {} };
      await service.emitFilterUpdated(view, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith('filter_updated', view);
    });
  });

  describe('emitSortUpdated', () => {
    it('should emit sort_updated to roomId', async () => {
      const view = { sort: {} };
      await service.emitSortUpdated(view, 'room-1');

      expect(mockServer.to).toHaveBeenCalledWith('room-1');
      expect(mockServer.emit).toHaveBeenCalledWith('sort_updated', view);
    });
  });

  describe('emitGroupByUpdated', () => {
    it('should emit group_by_updated to roomId', async () => {
      const view = { group: {} };
      await service.emitGroupByUpdated(view, 'room-1');

      expect(mockServer.to).toHaveBeenCalledWith('room-1');
      expect(mockServer.emit).toHaveBeenCalledWith('group_by_updated', view);
    });
  });

  describe('emitCreatedRows', () => {
    it('should emit created_rows to tableId', async () => {
      const rows = [{ id: 1 }];
      await service.emitCreatedRows(rows, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith('created_rows', rows);
    });
  });

  describe('emitCreatedRow', () => {
    it('should emit created_row to tableId when no baseId', async () => {
      const row = { id: 1 };
      await service.emitCreatedRow(row, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith('created_row', row);
    });

    it('should emit created_row to default view when baseId provided', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['view-default']);
      const row = { id: 1 };
      await service.emitCreatedRow(row, 'table-1', 'base-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-default');
    });
  });

  describe('emitUpdatedRecord', () => {
    it('should emit updated_row to tableId when no baseId', async () => {
      const records = [{ id: 1, field: 'value' }];
      (service as any).clientSocket = { id: 'socket-1' };
      await service.emitUpdatedRecord(records, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'updated_row',
        expect.arrayContaining([
          expect.objectContaining({ socket_id: 'socket-1' }),
        ]),
      );
    });

    it('should emit to default view when baseId provided', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['view-default']);
      const records = [{ id: 1 }];
      (service as any).clientSocket = { id: 'socket-1' };
      await service.emitUpdatedRecord(records, 'table-1', 'base-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-default');
    });
  });

  describe('emitUpdatedColumnMeta', () => {
    it('should emit updated_column_meta to tableId', async () => {
      const meta = { column: 'test' };
      await service.emitUpdatedColumnMeta(meta, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'updated_column_meta',
        meta,
      );
    });
  });

  describe('emitFormulaFieldErrors', () => {
    it('should emit formula_field_errors to tableId', async () => {
      const errors = [{ field: 'f1', error: 'syntax' }];
      await service.emitFormulaFieldErrors(errors, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'formula_field_errors',
        errors,
      );
    });
  });

  describe('emitCreatedFields', () => {
    it('should emit created_fields to viewId', async () => {
      const fields = [{ id: 'f1', tableMetaId: 'table-1' }];
      await service.emitCreatedFields(fields, 'view-1');

      expect(mockServer.to).toHaveBeenCalledWith('view-1');
      expect(mockServer.emit).toHaveBeenCalledWith('created_fields', fields);
    });
  });

  describe('emitEnrichmentRequestSent', () => {
    it('should emit enrichmentRequestSent to tableId', async () => {
      const response = { status: 'sent' };
      await service.emitEnrichmentRequestSent(response, 'table-1');

      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'enrichmentRequestSent',
        response,
      );
    });
  });

  describe('emitComputedFieldUpdate', () => {
    it('should emit computed_field_update and records_changed to tableId', async () => {
      const payload = {
        tableId: 'table-1',
        baseId: 'base-1',
        recordIds: [1, 2],
        fieldIds: [10],
        values: { 1: { col: 'val' } },
      };
      mockEmitter.emitAsync.mockResolvedValue(['view-default']);

      await service.emitComputedFieldUpdate(payload);

      expect(mockServer.to).toHaveBeenCalledWith('view-default');
      expect(mockServer.to).toHaveBeenCalledWith('table-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'computed_field_update',
        expect.objectContaining({ type: 'computed_field_update' }),
      );
      expect(mockServer.emit).toHaveBeenCalledWith('records_changed', {
        tableId: 'table-1',
      });
    });
  });

  describe('mergeClientDataIntoPayload', () => {
    it('should merge client data into payload', () => {
      const result = service.mergeClientDataIntoPayload(
        { user_id: 'u1', baseId: 'b1' },
        { tableId: 't1' },
      );
      expect(result).toEqual({
        tableId: 't1',
        user_id: 'u1',
        baseId: 'b1',
      });
    });

    it('should allow client data to override payload', () => {
      const result = service.mergeClientDataIntoPayload(
        { tableId: 'override' },
        { tableId: 'original' },
      );
      expect(result.tableId).toBe('override');
    });
  });

  describe('handleJoinRoom', () => {
    it('should join the room', async () => {
      const client = { join: jest.fn(), id: 'c1' } as any;
      await service.handleJoinRoom(client, 'room-1');
      expect(client.join).toHaveBeenCalledWith('room-1');
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave the room', () => {
      const client = { leave: jest.fn() } as any;
      service.handleLeaveRoom(client, 'room-1');
      expect(client.leave).toHaveBeenCalledWith('room-1');
    });
  });

  describe('getToken', () => {
    it('should extract token from handshake query', () => {
      const client = {
        handshake: { query: { token: 'my-token' } },
      } as any;
      expect(service.getToken(client)).toBe('my-token');
    });
  });
});
