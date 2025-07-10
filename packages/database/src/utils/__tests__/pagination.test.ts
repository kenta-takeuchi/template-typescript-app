import {
  calculatePagination,
  createPaginationResult,
  paginatedQuery,
} from '../pagination';

describe('Pagination Utils', () => {
  describe('calculatePagination', () => {
    it('should return default values when no params provided', () => {
      const result = calculatePagination();

      expect(result).toEqual({
        skip: 0,
        take: 20,
        page: 1,
        limit: 20,
      });
    });

    it('should calculate correct skip and take for page 2', () => {
      const result = calculatePagination({ page: 2, limit: 10 });

      expect(result).toEqual({
        skip: 10,
        take: 10,
        page: 2,
        limit: 10,
      });
    });

    it('should enforce minimum page of 1', () => {
      const result = calculatePagination({ page: 0 });

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should enforce maximum limit', () => {
      const result = calculatePagination({ limit: 200, maxLimit: 100 });

      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = calculatePagination({ limit: 0 });

      expect(result.limit).toBe(1);
      expect(result.take).toBe(1);
    });
  });

  describe('createPaginationResult', () => {
    it('should create correct pagination result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginationResult(data, 25, 2, 10);

      expect(result).toEqual({
        data,
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle first page correctly', () => {
      const data = [{ id: 1 }];
      const result = createPaginationResult(data, 10, 1, 5);

      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });

    it('should handle last page correctly', () => {
      const data = [{ id: 1 }];
      const result = createPaginationResult(data, 10, 2, 5);

      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it('should handle single page correctly', () => {
      const data = [{ id: 1 }];
      const result = createPaginationResult(data, 1, 1, 10);

      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('paginatedQuery', () => {
    it('should execute paginated query correctly', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const mockFindMany = jest.fn().mockResolvedValue(mockData);
      const mockCount = jest.fn().mockResolvedValue(25);

      const result = await paginatedQuery(
        mockFindMany,
        mockCount,
        { page: 2, limit: 10 },
        { where: { active: true } }
      );

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { active: true },
        skip: 10,
        take: 10,
      });

      expect(mockCount).toHaveBeenCalledWith({
        where: { active: true },
      });

      expect(result).toEqual({
        data: mockData,
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should remove pagination fields from count query', async () => {
      const mockFindMany = jest.fn().mockResolvedValue([]);
      const mockCount = jest.fn().mockResolvedValue(0);

      await paginatedQuery(
        mockFindMany,
        mockCount,
        { page: 1, limit: 10 },
        {
          where: { active: true },
          orderBy: { name: 'asc' },
          skip: 999, // Should be removed from count
          take: 999, // Should be removed from count
        }
      );

      expect(mockCount).toHaveBeenCalledWith({
        where: { active: true },
      });
    });
  });
});
