import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "../config/env";

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  if (env.NODE_ENV === "test") {
    // In tests, disable or set high limits to avoid flaky rate limiting in test runs
    await fastify.register(fastifyRateLimit, {
      max: 1000,
      timeWindow: "1 minute",
    });
    return;
  }

  await fastify.register(fastifyRateLimit, {
    max: 120, // 120 requests per minute per IP as standard baseline
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      // Key rate limiting by authenticated user ID, fallback to trustProxy IP
      if (request.user?.id) {
        return `user:${request.user.id}`;
      }
      return request.ip;
    },
  });
};

export default fp(rateLimitPlugin, {
  name: "rate-limit-plugin",
});
