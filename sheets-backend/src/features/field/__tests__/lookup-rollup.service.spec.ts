import { LookupRollupService } from '../lookup-rollup.service';

describe('LookupRollupService', () => {
  let service: LookupRollupService;
  let mockEmitter: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    service = new LookupRollupService(mockEmitter);
  });

  describe('registerEvents', () => {
    it('should register lookup and rollup events', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'lookup.resolveLookupFields',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'rollup.resolveRollupFields',
        expect.any(Function),
      );
    });
  });

  describe('applyRollupFunction', () => {
    describe('countall', () => {
      it('should count all values including nulls', () => {
        expect(service.applyRollupFunction('countall({values})', [1, null, 'a', '', undefined])).toBe(5);
      });

      it('should return 0 for empty array', () => {
        expect(service.applyRollupFunction('countall({values})', [])).toBe(0);
      });
    });

    describe('counta', () => {
      it('should count non-null, non-undefined, non-empty values', () => {
        expect(service.applyRollupFunction('counta({values})', [1, null, 'a', '', undefined])).toBe(2);
      });
    });

    describe('count', () => {
      it('should count numeric values', () => {
        expect(service.applyRollupFunction('count({values})', [1, 'abc', 3, null])).toBe(3);
      });

      it('should count string numbers', () => {
        expect(service.applyRollupFunction('count({values})', ['5', '10'])).toBe(2);
      });
    });

    describe('sum', () => {
      it('should sum numeric values', () => {
        expect(service.applyRollupFunction('sum({values})', [1, 2, 3])).toBe(6);
      });

      it('should return 0 for empty array', () => {
        expect(service.applyRollupFunction('sum({values})', [])).toBe(0);
      });

      it('should ignore non-numeric values', () => {
        expect(service.applyRollupFunction('sum({values})', [10, 'abc', 5])).toBe(15);
      });
    });

    describe('average', () => {
      it('should compute average of numeric values', () => {
        expect(service.applyRollupFunction('average({values})', [2, 4, 6])).toBe(4);
      });

      it('should return null for empty numeric values', () => {
        expect(service.applyRollupFunction('average({values})', ['abc'])).toBeNull();
      });

      it('should return null for empty array', () => {
        expect(service.applyRollupFunction('average({values})', [])).toBeNull();
      });
    });

    describe('max', () => {
      it('should return the max numeric value', () => {
        expect(service.applyRollupFunction('max({values})', [1, 5, 3])).toBe(5);
      });

      it('should return null for no numeric values', () => {
        expect(service.applyRollupFunction('max({values})', [])).toBeNull();
      });
    });

    describe('min', () => {
      it('should return the min numeric value', () => {
        expect(service.applyRollupFunction('min({values})', [1, 5, 3])).toBe(1);
      });

      it('should return null for no numeric values', () => {
        expect(service.applyRollupFunction('min({values})', [])).toBeNull();
      });
    });

    describe('and', () => {
      it('should return true if all truthy', () => {
        expect(service.applyRollupFunction('and({values})', [true, 1, 'yes'])).toBe(true);
      });

      it('should return false if any falsy', () => {
        expect(service.applyRollupFunction('and({values})', [true, 0, 'yes'])).toBe(false);
      });

      it('should return true for empty array', () => {
        expect(service.applyRollupFunction('and({values})', [])).toBe(true);
      });
    });

    describe('or', () => {
      it('should return true if any truthy', () => {
        expect(service.applyRollupFunction('or({values})', [false, 0, 1])).toBe(true);
      });

      it('should return false if all falsy', () => {
        expect(service.applyRollupFunction('or({values})', [false, 0, ''])).toBe(false);
      });
    });

    describe('xor', () => {
      it('should return true if odd number of truthy', () => {
        expect(service.applyRollupFunction('xor({values})', [true, false, false])).toBe(true);
      });

      it('should return false if even number of truthy', () => {
        expect(service.applyRollupFunction('xor({values})', [true, true, false])).toBe(false);
      });
    });

    describe('array_join', () => {
      it('should join non-null values with comma', () => {
        expect(service.applyRollupFunction('array_join({values})', ['a', 'b', null, 'c'])).toBe('a, b, c');
      });
    });

    describe('array_unique', () => {
      it('should return unique stringified values', () => {
        const result = service.applyRollupFunction('array_unique({values})', ['a', 'b', 'a', null, 'b']);
        expect(result).toEqual(['a', 'b']);
      });
    });

    describe('array_compact', () => {
      it('should filter out null/undefined/empty values', () => {
        const result = service.applyRollupFunction('array_compact({values})', [1, null, 'a', '', undefined]);
        expect(result).toEqual([1, 'a']);
      });
    });

    describe('concatenate', () => {
      it('should concatenate non-null values without separator', () => {
        expect(service.applyRollupFunction('concatenate({values})', ['hello', null, 'world'])).toBe('helloworld');
      });
    });

    describe('unknown expression', () => {
      it('should return null for unknown rollup function', () => {
        expect(service.applyRollupFunction('unknown_func({values})', [1, 2])).toBeNull();
      });
    });
  });

  describe('resolveLookupFields', () => {
    it('should return records unchanged if no lookup fields', async () => {
      const records = [{ __id: 1 }];
      const fields = [{ type: 'SHORT_TEXT', id: 1 }];

      const result = await service.resolveLookupFields(
        { records, fields, baseId: 'b1', tableId: 't1' },
        {} as any,
      );

      expect(result).toEqual(records);
    });
  });

  describe('resolveRollupFields', () => {
    it('should return records unchanged if no rollup fields', async () => {
      const records = [{ __id: 1 }];
      const fields = [{ type: 'SHORT_TEXT', id: 1 }];

      const result = await service.resolveRollupFields(
        { records, fields, baseId: 'b1', tableId: 't1' },
        {} as any,
      );

      expect(result).toEqual(records);
    });

    it('should skip rollup fields missing expression', async () => {
      const records = [{ __id: 1 }];
      const fields = [
        {
          type: 'ROLLUP',
          id: 1,
          options: { linkFieldId: '2' },
          lookupOptions: { linkFieldId: '2', lookupFieldId: '3', foreignTableId: 'ft1' },
        },
      ];

      const result = await service.resolveRollupFields(
        { records, fields, baseId: 'b1', tableId: 't1' },
        {} as any,
      );

      expect(result).toEqual(records);
    });
  });
});
