import { TimeBasedTriggerService } from '../time-based-trigger.service';

describe('TimeBasedTriggerService', () => {
  let service: TimeBasedTriggerService;
  let mockEmitter: any;
  let mockWinstonLogger: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    };

    mockPrisma = {
      scheduledTrigger: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      dataStream: {
        findMany: jest.fn(),
      },
      triggerSchedule: {
        findMany: jest.fn(),
      },
    };

    service = new TimeBasedTriggerService(mockEmitter, mockWinstonLogger);
  });

  describe('registerEvents', () => {
    it('should register expected events', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map((c) => c[0]);
      expect(eventNames).toContain('timeBasedTrigger.handleTimeBasedTriggers');
      expect(eventNames).toContain('timeBasedTrigger.cancelScheduledTriggersForRecord');
    });
  });

  describe('calculateScheduledTime', () => {
    const baseDate = new Date('2025-06-15T12:00:00Z');

    it('should return exact time for EXACT type', () => {
      const result = service.calculateScheduledTime(baseDate, {
        type: 'EXACT',
        offsetMinutes: 0,
        fieldId: 1,
        name: 'test',
      });
      expect(result.getTime()).toBe(baseDate.getTime());
    });

    it('should subtract offset for BEFORE type', () => {
      const result = service.calculateScheduledTime(baseDate, {
        type: 'BEFORE',
        offsetMinutes: 30,
        fieldId: 1,
        name: 'test',
      });
      const expected = new Date(baseDate.getTime() - 30 * 60 * 1000);
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should add offset for AFTER type', () => {
      const result = service.calculateScheduledTime(baseDate, {
        type: 'AFTER',
        offsetMinutes: 60,
        fieldId: 1,
        name: 'test',
      });
      const expected = new Date(baseDate.getTime() + 60 * 60 * 1000);
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should throw when timestamp value is falsy', () => {
      expect(() =>
        service.calculateScheduledTime(null as any, {
          type: 'EXACT',
          offsetMinutes: 0,
          fieldId: 1,
          name: 'test',
        }),
      ).toThrow('Timestamp value is required');
    });

    it('should handle string timestamps', () => {
      const result = service.calculateScheduledTime(
        new Date('2025-01-01T00:00:00Z'),
        { type: 'AFTER', offsetMinutes: 120, fieldId: 1, name: 'test' },
      );
      expect(result.getTime()).toBe(new Date('2025-01-01T02:00:00Z').getTime());
    });

    it('should return baseTime for unknown type', () => {
      const result = service.calculateScheduledTime(baseDate, {
        type: 'UNKNOWN' as any,
        offsetMinutes: 30,
        fieldId: 1,
        name: 'test',
      });
      expect(result.getTime()).toBe(baseDate.getTime());
    });
  });

  describe('handleTimeBasedTriggers', () => {
    it('should cancel triggers for delete_record events', async () => {
      mockPrisma.scheduledTrigger.updateMany.mockResolvedValue({ count: 1 });

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1, 2],
          eventType: 'delete_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockPrisma.scheduledTrigger.updateMany).toHaveBeenCalledTimes(2);
      expect(mockPrisma.scheduledTrigger.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          recordId: 1,
          status: 'active',
          state: 'PENDING',
        }),
        data: expect.objectContaining({
          status: 'inactive',
          state: 'CANCELLED',
        }),
      });
    });

    it('should exit early when no data streams found', async () => {
      mockPrisma.dataStream.findMany.mockResolvedValue([]);

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1],
          eventType: 'create_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockPrisma.triggerSchedule.findMany).not.toHaveBeenCalled();
    });

    it('should skip null recordIds', async () => {
      mockPrisma.dataStream.findMany.mockResolvedValue([{ id: 'ds-1' }]);
      mockPrisma.triggerSchedule.findMany.mockResolvedValue([
        { id: 'ts-1', dataStreamId: 'ds-1', fieldId: 1, type: 'EXACT', offsetMinutes: 0 },
      ]);
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table-1']);

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [null as any, undefined as any],
          eventType: 'create_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'table.getDbName',
        'table-1',
        'base-1',
        mockPrisma,
      );
    });

    it('should exit when dbTableName is not found', async () => {
      mockPrisma.dataStream.findMany.mockResolvedValue([{ id: 'ds-1' }]);
      mockPrisma.triggerSchedule.findMany.mockResolvedValue([]);
      mockEmitter.emitAsync.mockResolvedValue([null]);

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1],
          eventType: 'create_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockPrisma.scheduledTrigger.create).not.toHaveBeenCalled();
    });

    it('should filter by dataStreamId when provided', async () => {
      mockPrisma.dataStream.findMany.mockResolvedValue([]);

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1],
          eventType: 'create_record',
          updatedFieldIds: [],
          dataStreamId: 'ds-specific',
        },
        mockPrisma,
      );

      expect(mockPrisma.dataStream.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'ds-specific' }),
        }),
      );
    });

    it('should log error on exception', async () => {
      mockPrisma.dataStream.findMany.mockRejectedValue(new Error('DB error'));

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1],
          eventType: 'create_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockWinstonLogger.logger.error).toHaveBeenCalled();
    });

    it('should process create_record with empty updatedFieldIds for all fields', async () => {
      const ds = { id: 'ds-1' };
      const ts = { id: 'ts-1', dataStreamId: 'ds-1', fieldId: 5, type: 'EXACT', offsetMinutes: 0, name: 'trigger' };
      mockPrisma.dataStream.findMany.mockResolvedValue([ds]);
      mockPrisma.triggerSchedule.findMany.mockResolvedValue([ts]);
      mockEmitter.emitAsync
        .mockResolvedValueOnce(['base-1.table-1'])
        .mockResolvedValueOnce([[{ id: 5, type: 'DATE', dbFieldName: 'date_field', status: 'active' }]]);

      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const fetchSpy = jest.spyOn(service as any, 'fetchTimestampFieldValue').mockResolvedValue(futureDate);
      mockPrisma.scheduledTrigger.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.scheduledTrigger.create.mockResolvedValue({ id: 'st-1' });

      await service.handleTimeBasedTriggers(
        {
          tableId: 'table-1',
          baseId: 'base-1',
          recordIds: [1],
          eventType: 'create_record',
          updatedFieldIds: [],
        },
        mockPrisma,
      );

      expect(mockPrisma.scheduledTrigger.create).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe('cancelScheduledTriggersForRecord', () => {
    it('should cancel pending triggers for given record', async () => {
      mockPrisma.scheduledTrigger.updateMany.mockResolvedValue({ count: 1 });

      await service.cancelScheduledTriggersForRecord(
        { tableId: 'table-1', recordId: 42 },
        mockPrisma,
      );

      expect(mockPrisma.scheduledTrigger.updateMany).toHaveBeenCalledWith({
        where: {
          dataStream: { tableId: 'table-1' },
          recordId: 42,
          status: 'active',
          state: 'PENDING',
        },
        data: expect.objectContaining({
          status: 'inactive',
          state: 'CANCELLED',
        }),
      });
    });

    it('should log error on exception', async () => {
      mockPrisma.scheduledTrigger.updateMany.mockRejectedValue(new Error('DB error'));

      await service.cancelScheduledTriggersForRecord(
        { tableId: 'table-1', recordId: 42 },
        mockPrisma,
      );

      expect(mockWinstonLogger.logger.error).toHaveBeenCalled();
    });
  });
});
