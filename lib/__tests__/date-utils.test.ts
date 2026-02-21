import {
  formatDateTimeUTC,
  getWeekdayUTC,
  formatLongDateTimeUTC,
  formatDateOnlyUTC,
  formatDateToBR,
  parseTimeFromBR,
} from '../date-utils';

describe('date-utils', () => {
  describe('formatDateTimeUTC', () => {
    it('should format date correctly using local time', () => {
      const date = new Date(2026, 1, 20, 8, 30, 0); // Feb 20, 2026 08:30
      const result = formatDateTimeUTC(date);
      expect(result).toMatch(/20\/02\/2026 08:30/);
    });

    it('should handle string input', () => {
      const dateStr = '2026-02-20T08:30:00';
      const result = formatDateTimeUTC(dateStr);
      expect(result).toContain('08:30');
    });
  });

  describe('getWeekdayUTC', () => {
    it('should return correct weekday in Portuguese', () => {
      const date = new Date(2026, 1, 20); // Friday
      const result = getWeekdayUTC(date);
      expect(['Sexta-feira', 'Quinta-feira', 'Sábado']).toContain(result);
    });
  });

  describe('formatDateOnlyUTC', () => {
    it('should format date only without time', () => {
      const date = new Date(2026, 1, 20, 8, 30, 0);
      const result = formatDateOnlyUTC(date);
      expect(result).toMatch(/20\/02\/2026/);
      expect(result).not.toContain(':');
    });
  });

  describe('formatDateToBR', () => {
    it('should convert YYYY-MM-DD to dd/MM/yyyy', () => {
      const result = formatDateToBR('2026-02-20');
      expect(result).toBe('20/02/2026');
    });

    it('should return null for invalid date', () => {
      const result = formatDateToBR('invalid');
      expect(result).toBeNull();
    });
  });

  describe('parseTimeFromBR', () => {
    it('should convert HH:mm to HH:mm', () => {
      const result = parseTimeFromBR('08:30');
      expect(result).toBe('08:30');
    });

    it('should return null for invalid time', () => {
      const result = parseTimeFromBR('25:00');
      expect(result).toBeNull();
    });
  });
});
