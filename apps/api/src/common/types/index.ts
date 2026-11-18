import "fastify";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply
    ) => Promise<void>;
    optionalAuthenticate: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply
    ) => Promise<void>;
    authenticateSeller: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply
    ) => Promise<void>;
  }
}
