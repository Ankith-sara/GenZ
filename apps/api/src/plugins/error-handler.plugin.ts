import type { FastifyError, FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "../common/errors";
import { sendError } from "../common/utils/response";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 1. Unmatched Route 404 Handler
  fastify.setNotFoundHandler((request, reply) => {
    return sendError(
      reply,
      404,
      "NOT_FOUND",
      `Route ${request.method} ${request.url} not found`
    );
  });

  // 2. Centralized Error Handler
  fastify.setErrorHandler((error: FastifyError | AppError | Error, request, reply) => {
    // Handled Domain & App Errors
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        request.log.error(error);
      }
      return sendError(reply, error.statusCode, error.code, error.message, error.details);
    }

    // Fastify / Zod Validation Errors
    if (
      ("validation" in error && error.validation) ||
      error.name === "ZodError" ||
      "issues" in error ||
      ("code" in error && error.code === "FST_ERR_VALIDATION") ||
      ("statusCode" in error && error.statusCode === 400)
    ) {
      const details =
        ("issues" in error ? (error as any).issues : undefined) ||
        ("validation" in error ? error.validation : undefined);
      return sendError(
        reply,
        400,
        "VALIDATION_ERROR",
        error.message || "Invalid request payload",
        details
      );
    }

    // Fastify Rate Limit Error
    if ("statusCode" in error && error.statusCode === 429) {
      return sendError(
        reply,
        429,
        "RATE_LIMITED",
        error.message || "Too many requests. Please slow down."
      );
    }

    // Bad JSON payload
    if (error instanceof SyntaxError && "body" in error) {
      return sendError(reply, 400, "INVALID_JSON", "Malformed JSON payload");
    }

    // Uncaught Server Errors
    request.log.error(error);
    const isProduction = process.env.NODE_ENV === "production";
    return sendError(
      reply,
      500,
      "INTERNAL_SERVER_ERROR",
      isProduction ? "An internal server error occurred." : error.message
    );
  });
};

export default fp(errorHandlerPlugin, {
  name: "error-handler-plugin",
});
