import type { FastifyPluginAsync } from "fastify";
import { getPlatformCategories } from "@genz/database/categories";
import { sendSuccess } from "../../common/utils/response";

export const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/categories
  fastify.get("/", async (_request, reply) => {
    const categories = await getPlatformCategories();
    return sendSuccess(reply, { categories });
  });
};

