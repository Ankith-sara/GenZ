import type { FastifyPluginAsync } from "fastify";
import { OrdersModuleService } from "./orders.service";
import {
  orderParamsSchema,
  cancelOrderSchema,
  requestReturnSchema,
} from "./orders.schemas";
import { sendSuccess } from "../../common/utils/response";
import { UnauthorizedError } from "../../common/errors";

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  // All order history and detail endpoints require customer authentication
  fastify.addHook("preHandler", fastify.authenticate);

  // GET /v1/orders
  fastify.get("/", async (request, reply) => {
    if (!request.user) throw new UnauthorizedError();
    const result = await OrdersModuleService.listCustomerOrders(request.user.id);
    return sendSuccess(reply, result);
  });

  // GET /v1/orders/:orderId
  fastify.get<{ Params: { orderId: string } }>(
    "/:orderId",
    {
      schema: { params: orderParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await OrdersModuleService.getOrderDetails(
        request.user.id,
        request.params.orderId
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/orders/:orderId/cancel
  fastify.post<{ Params: { orderId: string }; Body: { reason?: string } }>(
    "/:orderId/cancel",
    {
      schema: {
        params: orderParamsSchema,
        body: cancelOrderSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await OrdersModuleService.cancelOrder(
        request.user.id,
        request.params.orderId,
        request.body?.reason
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/orders/:orderId/return
  fastify.post<{ Params: { orderId: string }; Body: { reason: string } }>(
    "/:orderId/return",
    {
      schema: {
        params: orderParamsSchema,
        body: requestReturnSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await OrdersModuleService.requestReturn(
        request.user.id,
        request.params.orderId,
        request.body.reason
      );
      return sendSuccess(reply, result);
    }
  );
};

