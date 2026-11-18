import type { FastifyPluginAsync } from "fastify";
import { SearchService } from "@genz/services/search";
import {
  searchProductsQuerySchema,
  type SearchProductsQuery,
} from "./search.schemas";
import { sendSuccess } from "../../common/utils/response";

export const searchRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/search
  fastify.get<{ Querystring: SearchProductsQuery }>(
    "/",
    {
      schema: {
        querystring: searchProductsQuerySchema,
      },
    },
    async (request, reply) => {
      const { q, limit } = request.query;
      const result = await SearchService.searchProducts({
        query: q || "",
        limit,
      });
      return sendSuccess(reply, result);
    }
  );
};

