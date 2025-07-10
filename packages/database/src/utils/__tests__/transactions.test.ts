import {
  withTransaction,
  batchTransaction,
  retryTransaction,
} from '../transactions';

// Mock Prisma Client
const mockPrismaClient = {
  $transaction: jest.fn(),
};

describe('Transaction Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withTransaction', () => {
    it('should execute function within transaction', async () => {
      const mockResult = { id: 1, name: 'test' };
      const mockTxFn = jest.fn().mockResolvedValue(mockResult);

      mockPrismaClient.$transaction.mockResolvedValue(mockResult);

      const result = await withTransaction(mockPrismaClient as any, mockTxFn);

      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(mockTxFn, {
        timeout: 5000,
        isolationLevel: undefined,
      });
      expect(result).toBe(mockResult);
    });

    it('should use custom timeout and isolation level', async () => {
      const mockResult = { id: 1 };
      const mockTxFn = jest.fn().mockResolvedValue(mockResult);

      mockPrismaClient.$transaction.mockResolvedValue(mockResult);

      await withTransaction(mockPrismaClient as any, mockTxFn, {
        timeout: 10000,
        isolationLevel: 'Serializable',
      });

      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(mockTxFn, {
        timeout: 10000,
        isolationLevel: 'Serializable',
      });
    });

    it('should propagate transaction errors', async () => {
      const mockError = new Error('Transaction failed');
      const mockTxFn = jest.fn().mockRejectedValue(mockError);

      mockPrismaClient.$transaction.mockRejectedValue(mockError);

      await expect(
        withTransaction(mockPrismaClient as any, mockTxFn)
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('batchTransaction', () => {
    it('should execute multiple operations in transaction', async () => {
      const mockResults = [{ id: 1 }, { id: 2 }];
      const operation1 = jest.fn().mockResolvedValue(mockResults[0]);
      const operation2 = jest.fn().mockResolvedValue(mockResults[1]);

      mockPrismaClient.$transaction.mockImplementation(async fn => {
        const mockTx = {};
        return fn(mockTx);
      });

      const result = await batchTransaction(mockPrismaClient as any, [
        operation1,
        operation2,
      ]);

      expect(result).toEqual(mockResults);
      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
    });

    it('should pass transaction client to all operations', async () => {
      const mockTx = { transaction: 'client' };
      const operation1 = jest.fn().mockResolvedValue({ id: 1 });
      const operation2 = jest.fn().mockResolvedValue({ id: 2 });

      mockPrismaClient.$transaction.mockImplementation(async fn => {
        return fn(mockTx);
      });

      await batchTransaction(mockPrismaClient as any, [operation1, operation2]);

      expect(operation1).toHaveBeenCalledWith(mockTx);
      expect(operation2).toHaveBeenCalledWith(mockTx);
    });
  });

  describe('retryTransaction', () => {
    it('should succeed on first attempt', async () => {
      const mockResult = { id: 1 };
      const mockTxFn = jest.fn().mockResolvedValue(mockResult);

      mockPrismaClient.$transaction.mockResolvedValue(mockResult);

      const result = await retryTransaction(
        mockPrismaClient as any,
        mockTxFn,
        3
      );

      expect(result).toBe(mockResult);
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should retry on serialization failure', async () => {
      const mockResult = { id: 1 };
      const mockTxFn = jest.fn().mockResolvedValue(mockResult);
      const serializationError = new Error('serialization_failure occurred');

      mockPrismaClient.$transaction
        .mockRejectedValueOnce(serializationError)
        .mockResolvedValueOnce(mockResult);

      const result = await retryTransaction(
        mockPrismaClient as any,
        mockTxFn,
        3
      );

      expect(result).toBe(mockResult);
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(2);
    });

    it('should retry on deadlock error', async () => {
      const mockResult = { id: 1 };
      const mockTxFn = jest.fn().mockResolvedValue(mockResult);
      const deadlockError = new Error('deadlock_detected in transaction');

      mockPrismaClient.$transaction
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce(mockResult);

      const result = await retryTransaction(
        mockPrismaClient as any,
        mockTxFn,
        3
      );

      expect(result).toBe(mockResult);
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const mockTxFn = jest.fn();
      const nonRetryableError = new Error('Invalid data');

      mockPrismaClient.$transaction.mockRejectedValue(nonRetryableError);

      await expect(
        retryTransaction(mockPrismaClient as any, mockTxFn, 3)
      ).rejects.toThrow('Invalid data');

      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const mockTxFn = jest.fn();
      const serializationError = new Error('serialization_failure occurred');

      mockPrismaClient.$transaction.mockRejectedValue(serializationError);

      await expect(
        retryTransaction(mockPrismaClient as any, mockTxFn, 2)
      ).rejects.toThrow('serialization_failure occurred');

      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(2);
    });

    // Note: Testing actual delay would require mocking setTimeout and advancing timers
    // For now, we trust that the delay logic works as written
  });
});
