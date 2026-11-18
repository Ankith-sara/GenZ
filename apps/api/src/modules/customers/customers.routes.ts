import type { FastifyPluginAsync } from "fastify";
import { CustomersService } from "./customers.service";
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  addressParamsSchema,
} from "./customers.schemas";
import { sendSuccess } from "../../common/utils/response";
import { UnauthorizedError, ValidationError } from "../../common/errors";

export const customersRoutes: FastifyPluginAsync = async (fastify) => {
  // All customer profile and address routes require authentication
  fastify.addHook("preHandler", fastify.authenticate);

  // GET /v1/customers/profile
  fastify.get("/profile", async (request, reply) => {
    if (!request.user) throw new UnauthorizedError();
    const profile = await CustomersService.getProfile(request.user.id);
    return sendSuccess(reply, { profile });
  });

  // PATCH /v1/customers/profile
  fastify.patch(
    "/profile",
    {
      schema: { body: updateProfileSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const updates = request.body as Parameters<
        typeof CustomersService.updateProfile
      >[1];
      const profile = await CustomersService.updateProfile(request.user.id, updates);
      return sendSuccess(reply, { profile }, "Profile updated successfully");
    }
  );

  // POST /v1/customers/profile/avatar
  fastify.post("/profile/avatar", async (request, reply) => {
    if (!request.user) throw new UnauthorizedError();

    const data = await request.file();
    if (!data) {
      throw new ValidationError("No avatar image file was provided");
    }

    const buffer = await data.toBuffer();
    const result = await CustomersService.uploadAvatar(
      request.user.id,
      buffer,
      data.filename,
      data.mimetype
    );

    return sendSuccess(reply, result, "Avatar uploaded successfully");
  });

  // GET /v1/customers/addresses
  fastify.get("/addresses", async (request, reply) => {
    if (!request.user) throw new UnauthorizedError();
    const addresses = await CustomersService.listAddresses(request.user.id);
    return sendSuccess(reply, { addresses });
  });

  // POST /v1/customers/addresses
  fastify.post(
    "/addresses",
    {
      schema: { body: addressSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const newAddress = request.body as Parameters<
        typeof CustomersService.addAddress
      >[1];
      const addresses = await CustomersService.addAddress(request.user.id, newAddress);
      return sendSuccess(reply, { addresses }, "Address added successfully", 201);
    }
  );

  // PUT /v1/customers/addresses/:addressId
  fastify.put<{ Params: { addressId: string } }>(
    "/addresses/:addressId",
    {
      schema: {
        params: addressParamsSchema,
        body: updateAddressSchema,
      },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const updates = request.body as Parameters<
        typeof CustomersService.updateAddress
      >[2];
      const addresses = await CustomersService.updateAddress(
        request.user.id,
        request.params.addressId,
        updates
      );
      return sendSuccess(reply, { addresses }, "Address updated successfully");
    }
  );

  // DELETE /v1/customers/addresses/:addressId
  fastify.delete<{ Params: { addressId: string } }>(
    "/addresses/:addressId",
    {
      schema: { params: addressParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const addresses = await CustomersService.deleteAddress(
        request.user.id,
        request.params.addressId
      );
      return sendSuccess(reply, { addresses }, "Address deleted successfully");
    }
  );

  // POST /v1/customers/addresses/:addressId/default
  fastify.post<{ Params: { addressId: string } }>(
    "/addresses/:addressId/default",
    {
      schema: { params: addressParamsSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const addresses = await CustomersService.setDefaultAddress(
        request.user.id,
        request.params.addressId
      );
      return sendSuccess(reply, { addresses }, "Default address updated");
    }
  );
};
