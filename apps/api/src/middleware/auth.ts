import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    optionalAuth: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    authorize: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authMiddlewarePlugin: FastifyPluginAsync = async fastify => {
  // 認証デコレータを追加
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );

  // オプショナル認証（トークンがなくてもエラーにしない）
  fastify.decorate(
    'optionalAuth',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const authorization = request.headers.authorization;
        if (authorization) {
          await request.jwtVerify();
        }
      } catch (err) {
        // オプショナル認証の場合は認証エラーを無視
        request.log.debug('Optional authentication failed:', err);
      }
    }
  );

  // ロールベースの認可
  fastify.decorate('authorize', function (allowedRoles: string[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        const user = request.user as any;
        const userRole = user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
          return reply.status(403).send({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '権限が不足しています',
            },
          });
        }
      } catch (err) {
        reply.send(err);
      }
    };
  });
};

export const authMiddleware = fp(authMiddlewarePlugin, {
  name: 'auth-middleware',
  dependencies: ['@fastify/jwt'],
});
