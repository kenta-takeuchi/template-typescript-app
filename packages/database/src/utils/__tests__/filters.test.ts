import {
  dateRangeToWhere,
  numericRangeToWhere,
  textSearchToWhere,
  multiFieldTextSearch,
  arrayContainsFilter,
  buildWhereClause,
} from '../filters';

describe('Filter Utils', () => {
  describe('dateRangeToWhere', () => {
    it('should handle date range with both dates', () => {
      const filter = {
        from: new Date('2023-01-01'),
        to: new Date('2023-12-31'),
      };

      const result = dateRangeToWhere(filter);

      expect(result).toEqual({
        gte: filter.from,
        lte: filter.to,
      });
    });

    it('should handle string dates', () => {
      const filter = {
        from: '2023-01-01',
        to: '2023-12-31',
      };

      const result = dateRangeToWhere(filter);

      expect(result).toEqual({
        gte: new Date('2023-01-01'),
        lte: new Date('2023-12-31'),
      });
    });

    it('should handle only from date', () => {
      const filter = { from: new Date('2023-01-01') };
      const result = dateRangeToWhere(filter);

      expect(result).toEqual({
        gte: filter.from,
      });
    });

    it('should handle only to date', () => {
      const filter = { to: new Date('2023-12-31') };
      const result = dateRangeToWhere(filter);

      expect(result).toEqual({
        lte: filter.to,
      });
    });

    it('should return undefined for empty filter', () => {
      const result = dateRangeToWhere({});
      expect(result).toBeUndefined();
    });
  });

  describe('numericRangeToWhere', () => {
    it('should handle numeric range with both values', () => {
      const filter = { min: 100, max: 1000 };
      const result = numericRangeToWhere(filter);

      expect(result).toEqual({
        gte: 100,
        lte: 1000,
      });
    });

    it('should handle only min value', () => {
      const filter = { min: 100 };
      const result = numericRangeToWhere(filter);

      expect(result).toEqual({
        gte: 100,
      });
    });

    it('should handle only max value', () => {
      const filter = { max: 1000 };
      const result = numericRangeToWhere(filter);

      expect(result).toEqual({
        lte: 1000,
      });
    });

    it('should return undefined for empty filter', () => {
      const result = numericRangeToWhere({});
      expect(result).toBeUndefined();
    });
  });

  describe('textSearchToWhere', () => {
    it('should handle contains search (default)', () => {
      const filter = { query: 'test' };
      const result = textSearchToWhere(filter);

      expect(result).toEqual({
        contains: 'test',
        mode: 'insensitive',
      });
    });

    it('should handle startsWith search', () => {
      const filter = { query: 'test', mode: 'startsWith' as const };
      const result = textSearchToWhere(filter);

      expect(result).toEqual({
        startsWith: 'test',
        mode: 'insensitive',
      });
    });

    it('should handle endsWith search', () => {
      const filter = { query: 'test', mode: 'endsWith' as const };
      const result = textSearchToWhere(filter);

      expect(result).toEqual({
        endsWith: 'test',
        mode: 'insensitive',
      });
    });

    it('should handle equals search', () => {
      const filter = { query: 'test', mode: 'equals' as const };
      const result = textSearchToWhere(filter);

      expect(result).toEqual({
        equals: 'test',
        mode: 'insensitive',
      });
    });

    it('should handle case sensitive search', () => {
      const filter = { query: 'test', caseSensitive: true };
      const result = textSearchToWhere(filter);

      expect(result).toEqual({
        contains: 'test',
        mode: 'default',
      });
    });

    it('should return undefined for empty query', () => {
      const result = textSearchToWhere({});
      expect(result).toBeUndefined();
    });
  });

  describe('multiFieldTextSearch', () => {
    it('should create OR filter for multiple fields', () => {
      const fields = ['name', 'email', 'description'];
      const filter = { query: 'test' };
      const result = multiFieldTextSearch(fields, filter);

      expect(result).toEqual({
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } },
          { description: { contains: 'test', mode: 'insensitive' } },
        ],
      });
    });

    it('should return undefined for empty query', () => {
      const result = multiFieldTextSearch(['name'], {});
      expect(result).toBeUndefined();
    });
  });

  describe('arrayContainsFilter', () => {
    it('should handle "some" mode (default)', () => {
      const values = ['skill1', 'skill2'];
      const result = arrayContainsFilter(values);

      expect(result).toEqual({
        hasSome: values,
      });
    });

    it('should handle "every" mode', () => {
      const values = ['skill1', 'skill2'];
      const result = arrayContainsFilter(values, 'every');

      expect(result).toEqual({
        hasEvery: values,
      });
    });

    it('should handle "none" mode', () => {
      const values = ['skill1', 'skill2'];
      const result = arrayContainsFilter(values, 'none');

      expect(result).toEqual({
        isEmpty: false,
        NOT: {
          hasSome: values,
        },
      });
    });

    it('should return undefined for empty array', () => {
      const result = arrayContainsFilter([]);
      expect(result).toBeUndefined();
    });
  });

  describe('buildWhereClause', () => {
    it('should build where clause from filters', () => {
      const filters = {
        name: 'John',
        age: 25,
        active: true,
        empty: '',
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = buildWhereClause(filters);

      expect(result).toEqual({
        name: 'John',
        age: 25,
        active: true,
      });
    });

    it('should return undefined for empty filters', () => {
      const result = buildWhereClause({});
      expect(result).toBeUndefined();
    });

    it('should return undefined for filters with only empty values', () => {
      const filters = {
        empty: '',
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = buildWhereClause(filters);
      expect(result).toBeUndefined();
    });
  });
});
