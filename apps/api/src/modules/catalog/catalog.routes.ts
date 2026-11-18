import type { FastifyPluginAsync } from "fastify";
import { CatalogService } from "./catalog.service";
import {
  getProductParamsSchema,
  getProductsQuerySchema,
  type GetProductParams,
  type GetProductsQuery,
} from "./catalog.schemas";
import { sendSuccess } from "../../common/utils/response";

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/catalog/products
  fastify.get<{ Querystring: GetProductsQuery }>(
    "/products",
    {
      schema: {
        querystring: getProductsQuerySchema,
      },
    },
    async (request, reply) => {
      const result = await CatalogService.listProducts(request.query);
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/catalog/featured
  fastify.get("/featured", async (_request, reply) => {
    const result = await CatalogService.getFeatured();
    return sendSuccess(reply, result);
  });

  // GET /v1/catalog/products/:id
  fastify.get<{ Params: GetProductParams }>(
    "/products/:id",
    {
      schema: {
        params: getProductParamsSchema,
      },
    },
    async (request, reply) => {
      const result = await CatalogService.getProductDetails(request.params.id);
      return sendSuccess(reply, result);
    }
  );
};

