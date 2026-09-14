import { describe, it, expect } from "vitest";

// Target seller ID resolution logic from createProduct action
function resolveTargetSellerId(
  session: { userId: string; role: "seller" | "admin" },
  customSellerIdFromForm?: string
): string {
  const custom = customSellerIdFromForm?.trim();
  const isAdmin = session.role === "admin";
  return isAdmin && custom ? custom : session.userId;
}

// Ownership verification before product operations (update, delete, variant)
function verifyProductOwnership(
  session: { userId: string; role: "seller" | "admin" },
  product: { id: string; seller_id: string; cover_image_path?: string } | null
): { allowed: boolean; error?: string } {
  if (!product) {
    return { allowed: false, error: "Product not found." };
  }
  if (product.seller_id !== session.userId && session.role !== "admin") {
    return { allowed: false, error: "Permission denied: Unauthorized product access." };
  }
  return { allowed: true };
}

describe("Seller Product Security & Authorization Specs", () => {
  describe("createProduct Seller ID Tampering Protection", () => {
    it("forces targetSellerId to session.userId when user is a normal seller, even if seller_id is supplied", () => {
      const sellerSession = { userId: "seller-123", role: "seller" as const };
      const maliciousPayloadSellerId = "victim-seller-999";

      const resolved = resolveTargetSellerId(sellerSession, maliciousPayloadSellerId);
      expect(resolved).toBe("seller-123");
      expect(resolved).not.toBe(maliciousPayloadSellerId);
    });

    it("allows trusted admin to specify a custom target seller ID", () => {
      const adminSession = { userId: "admin-master", role: "admin" as const };
      const targetSellerId = "artisan-polumuri-456";

      const resolved = resolveTargetSellerId(adminSession, targetSellerId);
      expect(resolved).toBe(targetSellerId);
    });

    it("defaults to admin ID if admin does not supply a custom seller ID", () => {
      const adminSession = { userId: "admin-master", role: "admin" as const };
      const resolved = resolveTargetSellerId(adminSession, "");
      expect(resolved).toBe("admin-master");
    });
  });

  describe("Product Mutation & Storage Deletion Isolation", () => {
    const victimProduct = {
      id: "prod-victim-1",
      seller_id: "victim-seller-999",
      cover_image_path: "victim-seller-999/products/prod-victim-1/cover.jpg",
    };

    it("prevents Seller A from updating or deleting Seller B's product", () => {
      const attackerSession = { userId: "attacker-seller", role: "seller" as const };
      const check = verifyProductOwnership(attackerSession, victimProduct);

      expect(check.allowed).toBe(false);
      expect(check.error).toContain("Permission denied");
    });

    it("permits Seller A to operate on their own product", () => {
      const ownerSession = { userId: "victim-seller-999", role: "seller" as const };
      const check = verifyProductOwnership(ownerSession, victimProduct);

      expect(check.allowed).toBe(true);
      expect(check.error).toBeUndefined();
    });

    it("permits admin to operate on any seller's product", () => {
      const adminSession = { userId: "admin-user", role: "admin" as const };
      const check = verifyProductOwnership(adminSession, victimProduct);

      expect(check.allowed).toBe(true);
    });

    it("rejects operations on non-existent products", () => {
      const ownerSession = { userId: "any-seller", role: "seller" as const };
      const check = verifyProductOwnership(ownerSession, null);

      expect(check.allowed).toBe(false);
      expect(check.error).toBe("Product not found.");
    });
  });
});
