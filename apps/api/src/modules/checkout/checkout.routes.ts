import type { FastifyPluginAsync } from "fastify";
import { CheckoutModuleService } from "./checkout.service";
import {
  createCheckoutOrderSchema,
  type CreateCheckoutOrderInput,
} from "./checkout.schemas";
import { sendSuccess } from "../../common/utils/response";

export const checkoutRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /v1/checkout/orders (supports both signed-in customers and guest checkout)
  fastify.post<{ Body: CreateCheckoutOrderInput }>(
    "/orders",
    {
      preHandler: [fastify.optionalAuthenticate],
      schema: { body: createCheckoutOrderSchema },
    },
    async (request, reply) => {
      const result = await CheckoutModuleService.processOrder(
        request.body,
        request.user
      );
      return sendSuccess(reply, result, "Order placed successfully", 201);
    }
  );
};

