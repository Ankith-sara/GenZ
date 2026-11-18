import type { FastifyReply } from "fastify";
import type { ApiResponse, ApiErrorResponse } from "../types";

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode = 200
): FastifyReply {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return reply.code(statusCode).send(response);
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): FastifyReply {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return reply.code(statusCode).send(response);
}

