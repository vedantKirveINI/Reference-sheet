import { DateTimeUtils } from '../DateTime';

describe('DateTimeUtils', () => {
  let dateUtils: DateTimeUtils;

  beforeEach(() => {
    dateUtils = new DateTimeUtils();
  });

  describe('static format arrays', () => {
    it('should have ACCEPTABLE_FORMATS defined', () => {
      expect(DateTimeUtils.ACCEPTABLE_FORMATS.length).toBeGreaterThan(0);
    });

    it('should have ACCEPTABLE_DATETIME_FORMATS combining with and without seconds', () => {
      expect(DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS.length).toBe(
        DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS_WITH_SECONDS.length +
          DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS_WITHOUT_SECONDS.length,
      );
    });

    it('should have DEFAULT_TIMEZONE set to Asia/Kolkata', () => {
      expect(DateTimeUtils.DEFAULT_TIMEZONE).toBe('Asia/Kolkata');
    });
  });

  describe('validate_and_convert_date', () => {
    it('should return null for null input', () => {
      expect(dateUtils.validate_and_convert_date(null as any)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(dateUtils.validate_and_convert_date(undefined as any)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(dateUtils.validate_and_convert_date('')).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      expect(dateUtils.validate_and_convert_date('   ')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(dateUtils.validate_and_convert_date(123 as any)).toBeNull();
    });

    it('should parse ISO format YYYY-MM-DD', () => {
      const result = dateUtils.validate_and_convert_date('2025-01-15');
      expect(result).toBeTruthy();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should parse ISO datetime with T separator', () => {
      const result = dateUtils.validate_and_convert_date(
        '2025-01-15T10:30:00',
      );
      expect(result).toBeTruthy();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should parse ISO datetime with Z timezone', () => {
      const result = dateUtils.validate_and_convert_date(
        '2025-01-15T10:30:00Z',
      );
      expect(result).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should parse DD/MM/YYYY format', () => {
      const result = dateUtils.validate_and_convert_date('15/01/2025');
      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    it('should parse DD-MM-YYYY format', () => {
      const result = dateUtils.validate_and_convert_date('15-01-2025');
      expect(result).toBeTruthy();
    });

    it('should parse YYYY/MM/DD format', () => {
      const result = dateUtils.validate_and_convert_date('2025/01/15');
      expect(result).toBeTruthy();
    });

    it('should parse datetime with timezone offset', () => {
      const result = dateUtils.validate_and_convert_date(
        '2025-01-15T10:30:00+05:30',
      );
      expect(result).toBeTruthy();
      expect(result).toBe('2025-01-15T05:00:00.000Z');
    });

    it('should strip surrounding quotes', () => {
      const result = dateUtils.validate_and_convert_date('"2025-01-15"');
      expect(result).toBeTruthy();
    });

    it('should strip single quotes', () => {
      const result = dateUtils.validate_and_convert_date("'2025-01-15'");
      expect(result).toBeTruthy();
    });

    it('should return null for invalid date string', () => {
      expect(dateUtils.validate_and_convert_date('not-a-date')).toBeNull();
    });

    it('should return null for quoted-only string', () => {
      expect(dateUtils.validate_and_convert_date('""')).toBeNull();
    });

    it('should parse with a specific format', () => {
      const result = dateUtils.validate_and_convert_date(
        '15/01/2025',
        'DD/MM/YYYY',
      );
      expect(result).toBeTruthy();
    });

    it('should use custom default timezone', () => {
      const resultDefault = dateUtils.validate_and_convert_date(
        '2025-01-15T10:00:00',
        undefined,
        'Asia/Kolkata',
      );
      const resultUTC = dateUtils.validate_and_convert_date(
        '2025-01-15T10:00:00',
        undefined,
        'UTC',
      );
      expect(resultDefault).not.toBe(resultUTC);
    });

    it('should parse datetime without seconds', () => {
      const result = dateUtils.validate_and_convert_date('2025-01-15T10:30');
      expect(result).toBeTruthy();
    });

    it('should parse DD/MM/YYYY HH:mm:ss format', () => {
      const result = dateUtils.validate_and_convert_date(
        '15/01/2025 10:30:00',
      );
      expect(result).toBeTruthy();
    });

    it('should parse month name formats', () => {
      const result = dateUtils.validate_and_convert_date('15 January 2025');
      expect(result).toBeTruthy();
    });

    it('should parse abbreviated month formats', () => {
      const result = dateUtils.validate_and_convert_date('15 Jan 2025');
      expect(result).toBeTruthy();
    });

    it('should handle whitespace trimming', () => {
      const result = dateUtils.validate_and_convert_date(
        '  2025-01-15T10:30:00Z  ',
      );
      expect(result).toBe('2025-01-15T10:30:00.000Z');
    });
  });
});
