import { logger } from '../logger';

describe('Logger Module', () => {
  it('should export logger configuration object', () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('should have level configuration', () => {
    expect(logger.level).toBeDefined();
    expect(['debug', 'info', 'warn', 'error']).toContain(logger.level);
  });

  it('should have serializers configuration', () => {
    expect(logger.serializers).toBeDefined();
    expect(typeof logger.serializers).toBe('object');
    expect(typeof logger.serializers.req).toBe('function');
    expect(typeof logger.serializers.res).toBe('function');
    expect(typeof logger.serializers.err).toBe('function');
  });

  it('should serialize request objects correctly', () => {
    const mockReq = {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test' },
      ip: '127.0.0.1',
      socket: { remotePort: 8080 },
    };

    const serialized = logger.serializers.req(mockReq);

    expect(serialized.method).toBe('GET');
    expect(serialized.url).toBe('/test');
    expect(serialized.headers).toEqual({ 'user-agent': 'test' });
    expect(serialized.remoteAddress).toBe('127.0.0.1');
    expect(serialized.remotePort).toBe(8080);
  });

  it('should serialize response objects correctly', () => {
    const mockRes = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    };

    const serialized = logger.serializers.res(mockRes);

    expect(serialized.statusCode).toBe(200);
    expect(serialized.headers).toEqual({ 'content-type': 'application/json' });
  });

  it('should serialize error objects correctly', () => {
    const mockErr = new Error('Test error');
    mockErr.name = 'TestError';

    const serialized = logger.serializers.err(mockErr);

    expect(serialized.message).toBe('Test error');
    expect(serialized.stack).toBeTruthy();
  });

  it('should have appropriate transport configuration', () => {
    if (logger.transport) {
      expect(logger.transport.target).toBe('pino-pretty');
      expect(logger.transport.options).toBeDefined();
    }
  });
});
