import type { FastifyPluginAsync } from "fastify";
import { CartService } from "./cart.service";
import { validateCartSchema, type ValidateCartInput } from "./cart.schemas";
import { sendSuccess } from "../../common/utils/response";

export const cartRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /v1/cart/validate
  fastify.post<{ Body: ValidateCartInput }>(
    "/validate",
    {
      schema: { body: validateCartSchema },
    },
    async (request, reply) => {
      const result = await CartService.validateAndCalculate(request.body);
      return sendSuccess(reply, result);
    }
  );
};

