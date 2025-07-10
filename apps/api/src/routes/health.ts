import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// テンプレート用の型定義
type HealthResponse = {
  status: string;
  today: string;
  timestamp: string;
  server: string;
  version?: string;
};

type TodayResponse = {
  date: string;
  dayOfWeek: string;
  timestamp: string;
  formatted: string;
};

type ErrorResponse = {
  error: string;
  message: string;
  timestamp: string;
};

export default async function healthRoutes(fastify: FastifyInstance) {
  // ヘルスチェックエンドポイント
  fastify.get<{
    Reply: HealthResponse | ErrorResponse;
  }>(
    '/health',
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<HealthResponse | ErrorResponse> => {
      try {
        const now = new Date();

        const response: HealthResponse = {
          status: 'ok',
          today: format(now, 'yyyy-MM-dd'),
          timestamp: now.toISOString(),
          server: 'template-api',
          version: '1.0.0',
        };

        return response;
      } catch (error) {
        fastify.log.error('Health check failed:', error);

        const errorResponse: ErrorResponse = {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Health check failed',
          timestamp: new Date().toISOString(),
        };

        reply.status(500);
        return errorResponse;
      }
    }
  );

  // 今日の日付取得エンドポイント
  fastify.get<{
    Reply: TodayResponse | ErrorResponse;
  }>(
    '/today',
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<TodayResponse | ErrorResponse> => {
      try {
        const now = new Date();

        const response: TodayResponse = {
          date: format(now, 'yyyy-MM-dd'),
          dayOfWeek: format(now, 'EEEE', { locale: ja }),
          timestamp: now.toISOString(),
          formatted: format(now, 'yyyy年MM月dd日', { locale: ja }),
        };

        return response;
      } catch (error) {
        fastify.log.error('Today endpoint failed:', error);

        const errorResponse: ErrorResponse = {
          error: 'INTERNAL_SERVER_ERROR',
          message: "Failed to get today's date",
          timestamp: new Date().toISOString(),
        };

        reply.status(500);
        return errorResponse;
      }
    }
  );
}
