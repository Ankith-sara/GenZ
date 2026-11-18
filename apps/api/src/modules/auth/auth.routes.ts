import type { FastifyPluginAsync } from "fastify";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  signupSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordUpdateSchema,
  type LoginInput,
  type OtpSendInput,
  type OtpVerifyInput,
  type SignupInput,
  type PasswordResetRequestInput,
  type PasswordResetInput,
  type PasswordUpdateInput,
} from "./auth.schemas";
import { sendSuccess } from "../../common/utils/response";
import { UnauthorizedError } from "../../common/errors";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/auth/me
  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const result = await AuthService.getCurrentUser(request.user.id);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/auth/login
  fastify.post(
    "/login",
    {
      schema: { body: loginSchema },
    },
    async (request, reply) => {
      const { email, password } = request.body as LoginInput;
      const result = await AuthService.loginWithPassword(email, password);
      return sendSuccess(reply, result, "Login successful");
    }
  );

  // POST /v1/auth/otp/send
  fastify.post(
    "/otp/send",
    {
      schema: { body: otpSendSchema },
    },
    async (request, reply) => {
      const { email } = request.body as OtpSendInput;
      const result = await AuthService.sendOtp(email);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/auth/otp/verify
  fastify.post(
    "/otp/verify",
    {
      schema: { body: otpVerifySchema },
    },
    async (request, reply) => {
      const { email, token } = request.body as OtpVerifyInput;
      const result = await AuthService.verifyLoginOtp(email, token);
      return sendSuccess(reply, result, "Verification successful");
    }
  );

  // POST /v1/auth/signup
  fastify.post(
    "/signup",
    {
      schema: { body: signupSchema },
    },
    async (request, reply) => {
      const { email, fullName, password } = request.body as SignupInput;
      const result = await AuthService.signup(email, fullName, password);
      return sendSuccess(reply, result, "Signup initiated", 201);
    }
  );

  // POST /v1/auth/signup/verify
  fastify.post(
    "/signup/verify",
    {
      schema: { body: otpVerifySchema },
    },
    async (request, reply) => {
      const { email, token } = request.body as OtpVerifyInput;
      const result = await AuthService.verifySignupOtp(email, token);
      return sendSuccess(reply, result, "Signup verified successfully");
    }
  );

  // POST /v1/auth/password/reset-request
  fastify.post(
    "/password/reset-request",
    {
      schema: { body: passwordResetRequestSchema },
    },
    async (request, reply) => {
      const { email } = request.body as PasswordResetRequestInput;
      const result = await AuthService.sendPasswordReset(email);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/auth/password/reset
  fastify.post(
    "/password/reset",
    {
      schema: { body: passwordResetSchema },
    },
    async (request, reply) => {
      const { email, token, password } = request.body as PasswordResetInput;
      const result = await AuthService.resetPasswordWithOtp(email, token, password);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/auth/password/update
  fastify.post(
    "/password/update",
    {
      preHandler: [fastify.authenticate],
      schema: { body: passwordUpdateSchema },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthorizedError();
      const { password } = request.body as PasswordUpdateInput;
      const result = await AuthService.updatePassword(request.user.id, password);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/auth/logout
  fastify.post(
    "/logout",
    {
      preHandler: [fastify.optionalAuthenticate],
    },
    async (_request, reply) => {
      return sendSuccess(reply, { message: "Logged out successfully" });
    }
  );
};
