import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ShippingService } from "@genz/services/shipping";
import { sendSuccess } from "../../common/utils/response";

const trackQuerySchema = z.object({
  carrier: z.string().min(1),
  trackingNumber: z.string().min(1),
});

export const shippingRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/shipping/carriers
  fastify.get("/carriers", async (_request, reply) => {
    const carriers = ShippingService.getSupportedCarriers();
    return sendSuccess(reply, { carriers });
  });

  // GET /v1/shipping/track
  fastify.get<{ Querystring: { carrier: string; trackingNumber: string } }>(
    "/track",
    {
      schema: { querystring: trackQuerySchema },
    },
    async (request, reply) => {
      const { carrier, trackingNumber } = request.query;
      const result = ShippingService.validateDispatch(carrier, trackingNumber);
      return sendSuccess(reply, result);
    }
  );
};

