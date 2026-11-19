import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { UnauthorizedError, ForbiddenError } from "../common/errors";
import { getSupabaseClient, getSupabaseAdminClient } from "../integrations/supabase";
import type { AuthenticatedUser } from "../common/types";

function extractBearerToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  return match ? match[1].trim() : null;
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Required Authentication Decorator
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const token = extractBearerToken(request);
      if (!token) {
        throw new UnauthorizedError("Missing Authorization header with Bearer token");
      }

      // Test environment bypass hook if token is a mock test token
      if (process.env.NODE_ENV === "test" && token.startsWith("test-token-")) {
        const userId = token.replace("test-token-", "");
        const role = userId.includes("seller")
          ? "seller"
          : userId.includes("admin")
            ? "admin"
            : "buyer";
        request.user = {
          id: userId,
          email: `${userId}@example.com`,
          role,
          user_metadata: {},
        };
        return;
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        throw new UnauthorizedError(
          error?.message || "Invalid, expired, or revoked session token"
        );
      }

      const user = data.user;

      // Query database profile for authoritative role (never trust user metadata alone)
      let role = "buyer";
      try {
        const admin = getSupabaseAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role) {
          role = profile.role;
        }
      } catch {
        // Safe default: untrusted users always receive buyer role
        role = "buyer";
      }

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        role,
        user_metadata: user.user_metadata || {},
      };

      request.user = authenticatedUser;
    }
  );

  // Optional Authentication Decorator (Supports Guest Checkout / Public Browsing)
  fastify.decorate(
    "optionalAuthenticate",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const token = extractBearerToken(request);
      if (!token) {
        request.user = undefined;
        return;
      }

      if (process.env.NODE_ENV === "test" && token.startsWith("test-token-")) {
        const userId = token.replace("test-token-", "");
        request.user = {
          id: userId,
          email: `${userId}@example.com`,
          role: "buyer",
          user_metadata: {},
        };
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const user = data.user;
          let role = "buyer";
          try {
            const admin = getSupabaseAdminClient();
            const { data: profile } = await admin
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle();
            if (profile?.role) role = profile.role;
          } catch {
            role = "buyer";
          }

          request.user = {
            id: user.id,
            email: user.email,
            role,
            user_metadata: user.user_metadata || {},
          };
        } else {
          request.user = undefined;
        }
      } catch {
        request.user = undefined;
      }
    }
  );

  // Authenticate specifically for Sellers and Admins
  fastify.decorate(
    "authenticateSeller",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      if (!request.user) {
        throw new UnauthorizedError("Authentication required");
      }
      if (request.user.role !== "seller" && request.user.role !== "admin") {
        throw new ForbiddenError("Seller access required");
      }
    }
  );
};

export default fp(authPlugin, {
  name: "auth-plugin",
});
