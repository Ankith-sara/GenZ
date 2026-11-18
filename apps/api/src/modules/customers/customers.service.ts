import { getSupabaseAdminClient } from "../../integrations/supabase";
import { NotFoundError, ValidationError } from "../../common/errors";
import crypto from "crypto";

export interface AddressItem {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export class CustomersService {
  static async getProfile(customerId: string) {
    const admin = getSupabaseAdminClient();
    const [authRes, profileRes] = await Promise.all([
      admin.auth.admin.getUserById(customerId),
      admin.from("profiles").select("*").eq("id", customerId).maybeSingle(),
    ]);

    if (!authRes.data?.user) {
      throw new NotFoundError("Customer account not found");
    }

    const user = authRes.data.user;
    const profile = profileRes.data;
    const addresses = (user.user_metadata?.addresses as AddressItem[]) || [];

    return {
      id: customerId,
      email: user.email || "",
      fullName: profile?.full_name || (user.user_metadata?.full_name as string) || null,
      phone: profile?.phone || (user.user_metadata?.phone as string) || null,
      city: profile?.city || null,
      avatarUrl: profile?.avatar_url || (user.user_metadata?.avatar_url as string) || null,
      role: profile?.role || "buyer",
      addresses,
      createdAt: profile?.created_at || user.created_at,
    };
  }

  static async updateProfile(
    customerId: string,
    updates: { fullName?: string; phone?: string; city?: string }
  ) {
    const admin = getSupabaseAdminClient();

    const dbPayload: Record<string, string> = {};
    if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.city !== undefined) dbPayload.city = updates.city;

    if (Object.keys(dbPayload).length > 0) {
      const { error } = await admin
        .from("profiles")
        .update(dbPayload)
        .eq("id", customerId);

      if (error) {
        throw new ValidationError(`Failed to update profile: ${error.message}`);
      }
    }

    return this.getProfile(customerId);
  }

  static async uploadAvatar(
    customerId: string,
    fileBuffer: Buffer,
    filename: string,
    contentType: string
  ) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      throw new ValidationError("Invalid image format. Only JPEG, PNG, and WebP are allowed.");
    }

    const admin = getSupabaseAdminClient();
    const ext = filename.split(".").pop() || "jpg";
    const safePath = `${customerId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(safePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new ValidationError(`Storage upload failed: ${uploadError.message}`);
    }

    const publicUrl = admin.storage.from("avatars").getPublicUrl(safePath).data.publicUrl;

    const { error: dbError } = await admin
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", customerId);

    if (dbError) {
      throw new ValidationError(`Database avatar update failed: ${dbError.message}`);
    }

    return { avatarUrl: publicUrl };
  }

  static async listAddresses(customerId: string): Promise<AddressItem[]> {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(customerId);
    if (error || !data?.user) {
      throw new NotFoundError("Customer account not found");
    }
    return (data.user.user_metadata?.addresses as AddressItem[]) || [];
  }

  static async addAddress(customerId: string, address: Omit<AddressItem, "id"> & { id?: string }) {
    const admin = getSupabaseAdminClient();
    const current = await this.listAddresses(customerId);

    const newId = address.id || `addr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const newAddress: AddressItem = {
      ...address,
      id: newId,
      isDefault: address.isDefault ?? current.length === 0,
    };

    let updatedList = [...current];
    if (newAddress.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(newAddress);

    const { data: userRes } = await admin.auth.admin.getUserById(customerId);
    await admin.auth.admin.updateUserById(customerId, {
      user_metadata: {
        ...(userRes?.user?.user_metadata || {}),
        addresses: updatedList,
      },
    });

    return updatedList;
  }

  static async updateAddress(
    customerId: string,
    addressId: string,
    updates: Partial<Omit<AddressItem, "id">>
  ) {
    const admin = getSupabaseAdminClient();
    const current = await this.listAddresses(customerId);
    const index = current.findIndex((a) => a.id === addressId);
    if (index === -1) {
      throw new NotFoundError(`Address with id "${addressId}" not found`);
    }

    let updatedList = [...current];
    if (updates.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    updatedList[index] = {
      ...updatedList[index],
      ...updates,
      id: addressId,
    };

    const { data: userRes } = await admin.auth.admin.getUserById(customerId);
    await admin.auth.admin.updateUserById(customerId, {
      user_metadata: {
        ...(userRes?.user?.user_metadata || {}),
        addresses: updatedList,
      },
    });

    return updatedList;
  }

  static async deleteAddress(customerId: string, addressId: string) {
    const admin = getSupabaseAdminClient();
    const current = await this.listAddresses(customerId);
    const updatedList = current.filter((a) => a.id !== addressId);

    const { data: userRes } = await admin.auth.admin.getUserById(customerId);
    await admin.auth.admin.updateUserById(customerId, {
      user_metadata: {
        ...(userRes?.user?.user_metadata || {}),
        addresses: updatedList,
      },
    });

    return updatedList;
  }

  static async setDefaultAddress(customerId: string, addressId: string) {
    return this.updateAddress(customerId, addressId, { isDefault: true });
  }
}

