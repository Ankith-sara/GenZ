import type { FastifyPluginAsync } from "fastify";
import { SellersService } from "./sellers.service";
import {
  sellerParamsSchema,
  productParamsSchema,
  variantParamsSchema,
  orderParamsSchema,
  documentParamsSchema,
  updateSellerProfileSchema,
  updateStudioSchema,
  uploadDocumentSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  quickUpdateProductSchema,
  addVariantSchema,
  updateOrderStatusSchema,
  createReelSchema,
  sellerProductsQuerySchema,
  sellerOrdersQuerySchema,
  type SellerParams,
  type ProductParams,
  type VariantParams,
  type OrderParams,
  type DocumentParams,
  type UpdateSellerProfileInput,
  type UpdateStudioInput,
  type UploadDocumentInput,
  type CreateProductInput,
  type UpdateProductInput,
  type QuickUpdateProductInput,
  type AddVariantInput,
  type UpdateOrderStatusInput,
  type CreateReelInput,
  type SellerProductsQuery,
  type SellerOrdersQuery,
} from "./sellers.schemas";
import { sendSuccess } from "../../common/utils/response";
import { UnauthorizedError } from "../../common/errors";

export const sellersRoutes: FastifyPluginAsync = async (fastify) => {
  // ----------------------------------------------------------------------
  // PUBLIC ENDPOINTS
  // ----------------------------------------------------------------------

  // GET /v1/sellers/:id/public-profile
  fastify.get<{ Params: SellerParams }>(
    "/:id/public-profile",
    {
      schema: {
        params: sellerParamsSchema,
      },
    },
    async (request, reply) => {
      const result = await SellersService.getPublicProfile(request.params.id);
      return sendSuccess(reply, result);
    }
  );

  // ----------------------------------------------------------------------
  // AUTHENTICATED SELLER WORKSPACE ENDPOINTS
  // ----------------------------------------------------------------------

  // GET /v1/sellers/me/overview
  fastify.get(
    "/me/overview",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.getSellerOverview(
        request.user.id,
        request.user.email
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/profile
  fastify.get(
    "/me/profile",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.getSellerProfile(
        request.user.id,
        request.user.email
      );
      return sendSuccess(reply, result);
    }
  );

  // PUT /v1/sellers/me/profile
  fastify.put<{ Body: UpdateSellerProfileInput }>(
    "/me/profile",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { body: updateSellerProfileSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateSellerProfile(
        request.user.id,
        request.body
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/verify
  fastify.post(
    "/me/verify",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.submitForVerification(request.user.id);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/profile/studio
  fastify.post<{ Body: UpdateStudioInput }>(
    "/me/profile/studio",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { body: updateStudioSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateCreatorStudio(
        request.user.id,
        request.body
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/avatar
  fastify.post<{ Body: { avatarUrl: string } }>(
    "/me/avatar",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateAvatar(
        request.user.id,
        request.body?.avatarUrl
      );
      return sendSuccess(reply, result);
    }
  );

  // DELETE /v1/sellers/me/avatar
  fastify.delete(
    "/me/avatar",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.removeAvatar(request.user.id);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/cover
  fastify.post<{ Body: { coverUrl: string } }>(
    "/me/cover",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateCover(
        request.user.id,
        request.body?.coverUrl
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/documents
  fastify.get(
    "/me/documents",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.listDocuments(request.user.id);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/documents
  fastify.post<{ Body: UploadDocumentInput }>(
    "/me/documents",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { body: uploadDocumentSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.uploadDocument(
        request.user.id,
        request.body
      );
      return sendSuccess(reply, result);
    }
  );

  // DELETE /v1/sellers/me/documents/:id
  fastify.delete<{ Params: DocumentParams }>(
    "/me/documents/:id",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { params: documentParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.deleteDocument(
        request.user.id,
        request.params.id
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/products
  fastify.get<{ Querystring: SellerProductsQuery }>(
    "/me/products",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { querystring: sellerProductsQuerySchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.listSellerProducts(
        request.user.id,
        request.query
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/products
  fastify.post<{ Body: CreateProductInput }>(
    "/me/products",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { body: createProductSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.createSellerProduct(
        request.user.id,
        request.body
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/products/:id
  fastify.get<{ Params: ProductParams }>(
    "/me/products/:id",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { params: productParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.getSellerProduct(
        request.user.id,
        request.params.id,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // PUT /v1/sellers/me/products/:id
  fastify.put<{ Params: ProductParams; Body: UpdateProductInput }>(
    "/me/products/:id",
    {
      preHandler: [fastify.authenticateSeller],
      schema: {
        params: productParamsSchema,
        body: updateProductSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateSellerProduct(
        request.user.id,
        request.params.id,
        request.body,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // PATCH /v1/sellers/me/products/:id/status
  fastify.patch<{ Params: ProductParams; Body: { status: "draft" | "published" | "archived" } }>(
    "/me/products/:id/status",
    {
      preHandler: [fastify.authenticateSeller],
      schema: {
        params: productParamsSchema,
        body: updateProductStatusSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.setSellerProductStatus(
        request.user.id,
        request.params.id,
        request.body.status,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // PATCH /v1/sellers/me/products/:id/quick-update
  fastify.patch<{ Params: ProductParams; Body: QuickUpdateProductInput }>(
    "/me/products/:id/quick-update",
    {
      preHandler: [fastify.authenticateSeller],
      schema: {
        params: productParamsSchema,
        body: quickUpdateProductSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.quickUpdateSellerProduct(
        request.user.id,
        request.params.id,
        request.body,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // DELETE /v1/sellers/me/products/:id
  fastify.delete<{ Params: ProductParams }>(
    "/me/products/:id",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { params: productParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.deleteSellerProduct(
        request.user.id,
        request.params.id,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/products/:id/variants
  fastify.post<{ Params: ProductParams; Body: AddVariantInput }>(
    "/me/products/:id/variants",
    {
      preHandler: [fastify.authenticateSeller],
      schema: {
        params: productParamsSchema,
        body: addVariantSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.addProductVariant(
        request.user.id,
        request.params.id,
        request.body,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // DELETE /v1/sellers/me/products/:id/variants/:variantId
  fastify.delete<{ Params: VariantParams }>(
    "/me/products/:id/variants/:variantId",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { params: variantParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.deleteProductVariant(
        request.user.id,
        request.params.id,
        request.params.variantId,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/orders
  fastify.get<{ Querystring: SellerOrdersQuery }>(
    "/me/orders",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { querystring: sellerOrdersQuerySchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.listSellerOrders(
        request.user.id,
        request.query
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/orders/:orderId
  fastify.get<{ Params: OrderParams }>(
    "/me/orders/:orderId",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { params: orderParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.getSellerOrder(
        request.user.id,
        request.params.orderId,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // PATCH /v1/sellers/me/orders/:orderId/status
  fastify.patch<{ Params: OrderParams; Body: UpdateOrderStatusInput }>(
    "/me/orders/:orderId/status",
    {
      preHandler: [fastify.authenticateSeller],
      schema: {
        params: orderParamsSchema,
        body: updateOrderStatusSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.updateSellerOrderStatus(
        request.user.id,
        request.params.orderId,
        request.body,
        request.user.role || "seller"
      );
      return sendSuccess(reply, result);
    }
  );

  // GET /v1/sellers/me/reels
  fastify.get<{ Querystring: { product_id?: string } }>(
    "/me/reels",
    { preHandler: [fastify.authenticateSeller] },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.listSellerReels(
        request.user.id,
        request.query.product_id
      );
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/sellers/me/reels
  fastify.post<{ Body: CreateReelInput }>(
    "/me/reels",
    {
      preHandler: [fastify.authenticateSeller],
      schema: { body: createReelSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await SellersService.createSellerReel(
        request.user.id,
        request.body
      );
      return sendSuccess(reply, result);
    }
  );
};
