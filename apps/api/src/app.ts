import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyMultipart from "@fastify/multipart";
import fastifyRawBody from "fastify-raw-body";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import corsPlugin from "./plugins/cors.plugin";
import rateLimitPlugin from "./plugins/rate-limit.plugin";
import errorHandlerPlugin from "./plugins/error-handler.plugin";
import authPlugin from "./plugins/auth.plugin";
import { getSupabaseClient } from "./integrations/supabase";
import { sendSuccess } from "./common/utils/response";
import { bold, cyan, dim, green, red, yellow } from "./common/utils/terminal";

import { catalogRoutes } from "./modules/catalog/catalog.routes";
import { categoriesRoutes } from "./modules/categories/categories.routes";
import { searchRoutes } from "./modules/search/search.routes";
import { sellersRoutes } from "./modules/sellers/sellers.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { customersRoutes } from "./modules/customers/customers.routes";
import { cartRoutes } from "./modules/cart/cart.routes";
import { supportRoutes } from "./modules/support/support.routes";
import { paymentsRoutes } from "./modules/payments/payments.routes";
import { webhooksRoutes } from "./modules/webhooks/webhooks.routes";
import { checkoutRoutes } from "./modules/checkout/checkout.routes";
import { ordersRoutes } from "./modules/orders/orders.routes";
import { shippingRoutes } from "./modules/shipping/shipping.routes";

// One definition of "dev" for both the logger and the request log
const isDevEnv = () =>
  process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

function getLoggerConfig() {
  if (process.env.NODE_ENV === "test") {
    return false;
  }
  let pinoPrettyPath: string | null = null;
  try {
    pinoPrettyPath = require.resolve("pino-pretty");
  } catch {
    pinoPrettyPath = null;
  }

  return {
    level: process.env.LOG_LEVEL || "info",
    transport:
      isDevEnv() && pinoPrettyPath
        ? {
            target: pinoPrettyPath,
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname,reqId,responseTime",
              singleLine: true,
            },
          }
        : undefined,
  };
}

const statusColor = (status: number) =>
  status >= 500 ? red : status >= 400 ? yellow : status >= 300 ? cyan : green;

const timeColor = (ms: number) => (ms > 500 ? red : ms > 200 ? yellow : dim);

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

export async function buildApp(
  opts: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  const isDev = isDevEnv();

  const app = Fastify({
    logger: getLoggerConfig(),
    disableRequestLogging: isDev,
    ...opts,
  });

  // Dev only: one clean line per request, e.g.
  //   14:02:11  200  GET    /v1/catalog/products          12ms
  // In production pino's structured request logs are used instead, so there
  // are no color codes in your log files.
  if (isDev) {
    app.addHook("onResponse", (request, reply, done) => {
      const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
      const url = truncate(request.raw.url || request.url, 60);
      const status = reply.statusCode;
      const ms = Math.round(reply.elapsedTime);

      console.log(
        `${dim(time)}  ${statusColor(status)(String(status))}  ` +
          `${bold(request.method.padEnd(6))} ${url.padEnd(44)} ` +
          `${timeColor(ms)(`${ms}ms`)}`
      );
      done();
    });
  }

  // Configure Zod Type Provider compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 1. Raw body support (for webhooks signature verification)
  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false, // only applied when config.rawBody is true
    encoding: "utf8",
    runFirst: true,
  });

  // 2. Sensible helpers & utilities
  await app.register(fastifySensible);

  // 3. Multipart / form-data uploads
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5,
    },
  });

  // 4. CORS
  await app.register(corsPlugin);

  // 5. Rate limiting
  await app.register(rateLimitPlugin);

  // 6. Centralized Error Handler
  await app.register(errorHandlerPlugin);

  // 7. Supabase Authentication Decorator
  await app.register(authPlugin);

  // Health and Readiness Checks
  app.get("/health", async (_req, reply) => {
    return sendSuccess(reply, {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: "@genz/api",
      version: "1.0.0",
    });
  });

  app.get("/ready", async (_req, reply) => {
    let dbStatus = "ok";
    if (process.env.NODE_ENV !== "test") {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB probe timeout")), 1500)
        );
        const probePromise = (async () => {
          const supabase = getSupabaseClient();
          return supabase.from("products").select("id").limit(1);
        })();

        const result = (await Promise.race([probePromise, timeoutPromise])) as {
          error: unknown;
        };
        if (result?.error) {
          dbStatus = "degraded";
        }
      } catch {
        dbStatus = "degraded";
      }
    }

    return sendSuccess(reply, {
      status: dbStatus === "ok" ? "ready" : "degraded",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // Register V1 API Modules
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: "/auth" });
      await v1.register(customersRoutes, { prefix: "/customers" });
      await v1.register(catalogRoutes, { prefix: "/catalog" });
      await v1.register(categoriesRoutes, { prefix: "/categories" });
      await v1.register(searchRoutes, { prefix: "/search" });
      await v1.register(sellersRoutes, { prefix: "/sellers" });
      await v1.register(cartRoutes, { prefix: "/cart" });
      await v1.register(checkoutRoutes, { prefix: "/checkout" });
      await v1.register(paymentsRoutes, { prefix: "/payments" });
      await v1.register(webhooksRoutes, { prefix: "/webhooks" });
      await v1.register(ordersRoutes, { prefix: "/orders" });
      await v1.register(shippingRoutes, { prefix: "/shipping" });
      await v1.register(supportRoutes, { prefix: "/support" });
      // Aliases for root public actions
      await v1.register(supportRoutes, { prefix: "" });
    },
    { prefix: "/v1" }
  );

  return app;
}