import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { env } from "../config/env";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (e.g. mobile app, curl, server-to-server) where origin is undefined
      if (!origin) {
        cb(null, true);
        return;
      }

      // Check against configured CORS_ORIGIN list
      const isAllowed = env.CORS_ORIGIN.some((allowed) => {
        if (allowed === "*") return true;
        if (allowed === origin) return true;
        try {
          const originHost = new URL(origin).host;
          const allowedHost = new URL(allowed).host;
          return originHost === allowedHost;
        } catch {
          return false;
        }
      });

      if (isAllowed || env.NODE_ENV !== "production") {
        cb(null, true);
      } else {
        cb(new Error("CORS request blocked"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-razorpay-signature",
    ],
  });
};

export default fp(corsPlugin, {
  name: "cors-plugin",
});

