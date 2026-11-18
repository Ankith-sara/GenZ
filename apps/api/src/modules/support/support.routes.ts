import type { FastifyPluginAsync } from "fastify";
import { SupportService } from "./support.service";
import {
  contactSchema,
  newsletterSchema,
  waitlistSchema,
  analyticsTrackSchema,
} from "./support.schemas";
import { sendSuccess } from "../../common/utils/response";

export const supportRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /v1/support/contact
  fastify.post(
    "/contact",
    {
      schema: { body: contactSchema },
    },
    async (request, reply) => {
      const result = await SupportService.submitContactMessage(request.body as any);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/newsletter/subscribe (or /v1/support/newsletter)
  fastify.post(
    "/newsletter",
    {
      schema: { body: newsletterSchema },
    },
    async (request, reply) => {
      const { email } = request.body as any;
      const result = await SupportService.subscribeNewsletter(email);
      return sendSuccess(reply, result);
    }
  );

  // POST /v1/waitlist/join (or /v1/support/waitlist)
  fastify.post(
    "/waitlist",
    {
      schema: { body: waitlistSchema },
    },
    async (request, reply) => {
      const result = await SupportService.joinWaitlist(request.body as any);
      return sendSuccess(reply, result, undefined, 201);
    }
  );

  // POST /v1/analytics/track
  fastify.post(
    "/analytics/track",
    {
      schema: { body: analyticsTrackSchema },
    },
    async (request, reply) => {
      const result = await SupportService.trackPageView(request.body as any);
      return sendSuccess(reply, result);
    }
  );
};

