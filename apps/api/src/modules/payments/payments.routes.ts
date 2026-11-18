import type { FastifyPluginAsync } from "fastify";
import { PaymentsModuleService } from "./payments.service";
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  type CreateRazorpayOrderInput,
  type VerifyRazorpayPaymentInput,
} from "./payments.schemas";
import { sendSuccess } from "../../common/utils/response";

export const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /v1/payments/razorpay/order
  fastify.post<{ Body: CreateRazorpayOrderInput }>(
    "/razorpay/order",
    {
      schema: { body: createRazorpayOrderSchema },
    },
    async (request, reply) => {
      const result = await PaymentsModuleService.createOrder(request.body);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/payments/razorpay/verify
  fastify.post<{ Body: VerifyRazorpayPaymentInput }>(
    "/razorpay/verify",
    {
      schema: { body: verifyRazorpayPaymentSchema },
    },
    async (request, reply) => {
      const result = PaymentsModuleService.verifySignature(request.body);
      return sendSuccess(reply, result);
    }
  );
};

