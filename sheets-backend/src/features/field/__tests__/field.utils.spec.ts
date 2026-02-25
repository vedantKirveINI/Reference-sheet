import { FieldUtils } from '../field.utils';

describe('FieldUtils', () => {
  let fieldUtils: FieldUtils;

  beforeEach(() => {
    fieldUtils = new FieldUtils();
  });

  describe('getDBFieldName', () => {
    it('should generate a valid db field name from a simple name', () => {
      const result = fieldUtils.getDBFieldName('My Field', 'abc123');
      expect(result).toBe('my_field_abc123');
    });

    it('should trim leading and trailing spaces', () => {
      const result = fieldUtils.getDBFieldName('  Name  ', 'uuid1');
      expect(result).toBe('name_uuid1');
    });

    it('should replace non-alphanumeric characters with underscores', () => {
      const result = fieldUtils.getDBFieldName('Hello@World!', 'uuid2');
      expect(result).toBe('hello_world__uuid2');
    });

    it('should replace spaces with underscores', () => {
      const result = fieldUtils.getDBFieldName('first second third', 'uuid3');
      expect(result).toBe('first_second_third_uuid3');
    });

    it('should remove consecutive underscores', () => {
      const result = fieldUtils.getDBFieldName('a___b', 'uuid4');
      expect(result).toBe('a_b_uuid4');
    });

    it('should prepend underscore if name starts with a number', () => {
      const result = fieldUtils.getDBFieldName('123field', 'uuid5');
      expect(result).toBe('_123field_uuid5');
    });

    it('should use underscore prefix if name becomes just underscores after formatting', () => {
      const result = fieldUtils.getDBFieldName('!!!', 'uuid6');
      expect(result).toBe('__uuid6');
    });

    it('should truncate long names to respect PostgreSQL 63-byte limit', () => {
      const longName = 'a'.repeat(100);
      const uuid = 'shortuuid';
      const result = fieldUtils.getDBFieldName(longName, uuid);
      const byteLength = Buffer.byteLength(result, 'utf8');
      expect(byteLength).toBeLessThanOrEqual(63);
      expect(result.endsWith(`_${uuid}`)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = fieldUtils.getDBFieldName('名前', 'uuid7');
      expect(result).toContain('_uuid7');
    });

    it('should handle empty string name', () => {
      const result = fieldUtils.getDBFieldName('', 'uuid8');
      expect(result).toBe('_field_uuid8');
    });
  });

  describe('getFilterFieldIdsAndClean', () => {
    it('should remove leaf nodes whose field is in field_ids', () => {
      const filter = {
        conjunction: 'AND',
        childs: [
          { field: 'f1', operator: 'eq', value: 'x' },
          { field: 'f2', operator: 'eq', value: 'y' },
        ],
      };
      const field_ids = { f1: 'f1' };

      fieldUtils.getFilterFieldIdsAndClean({ filter, field_ids });

      expect(filter.childs).toHaveLength(1);
      expect(filter.childs[0].field).toBe('f2');
    });

    it('should clear entire filter if all children are removed', () => {
      const filter: any = {
        conjunction: 'AND',
        childs: [{ field: 'f1', operator: 'eq', value: 'x' }],
      };
      const field_ids = { f1: 'f1' };

      fieldUtils.getFilterFieldIdsAndClean({ filter, field_ids });

      expect(filter.childs).toBeUndefined();
      expect(filter.conjunction).toBeUndefined();
    });

    it('should handle nested group nodes', () => {
      const filter = {
        conjunction: 'AND',
        childs: [
          {
            conjunction: 'OR',
            childs: [
              { field: 'f1', operator: 'eq', value: 'x' },
              { field: 'f2', operator: 'eq', value: 'y' },
            ],
          },
        ],
      };
      const field_ids = { f1: 'f1' };

      fieldUtils.getFilterFieldIdsAndClean({ filter, field_ids });

      expect(filter.childs).toHaveLength(1);
      expect(filter.childs[0].childs).toHaveLength(1);
      expect(filter.childs[0].childs[0].field).toBe('f2');
    });

    it('should remove empty nested groups', () => {
      const filter: any = {
        conjunction: 'AND',
        childs: [
          {
            conjunction: 'OR',
            childs: [{ field: 'f1', operator: 'eq', value: 'x' }],
          },
        ],
      };
      const field_ids = { f1: 'f1' };

      fieldUtils.getFilterFieldIdsAndClean({ filter, field_ids });

      expect(filter.childs).toBeUndefined();
    });

    it('should handle null filter gracefully', () => {
      expect(() => {
        fieldUtils.getFilterFieldIdsAndClean({
          filter: null,
          field_ids: {},
        });
      }).not.toThrow();
    });

    it('should handle filter without childs', () => {
      const filter = { conjunction: 'AND' };
      expect(() => {
        fieldUtils.getFilterFieldIdsAndClean({
          filter,
          field_ids: { f1: 'f1' },
        });
      }).not.toThrow();
    });

    it('should keep nodes whose field is NOT in field_ids', () => {
      const filter = {
        conjunction: 'AND',
        childs: [
          { field: 'f1', operator: 'eq', value: 'a' },
          { field: 'f2', operator: 'eq', value: 'b' },
          { field: 'f3', operator: 'eq', value: 'c' },
        ],
      };
      const field_ids = { f2: 'f2' };

      fieldUtils.getFilterFieldIdsAndClean({ filter, field_ids });

      expect(filter.childs).toHaveLength(2);
      expect(filter.childs.map((c) => c.field)).toEqual(['f1', 'f3']);
    });
  });
});
