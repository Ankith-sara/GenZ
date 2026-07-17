export type Role = "buyer" | "manufacturer" | "admin";

export type VerificationStatus = "not_submitted" | "pending" | "verified" | "rejected";

export type DocType =
  "gst_certificate" | "factory_photo" | "quality_certificate" | "other";

export type ProductStatus = "draft" | "published" | "archived";

export type InquiryStatus = "new" | "responded" | "closed";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export type ManufacturerProfile = {
  id: string;
  business_name: string;
  gst_number: string;
  factory_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  description: string | null;
  established_year: number | null;
  status: VerificationStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ManufacturerDocument = {
  id: string;
  manufacturer_id: string;
  doc_type: DocType;
  file_path: string;
  file_name: string;
  uploaded_at: string;
};

export type Product = {
  id: string;
  manufacturer_id: string;
  name: string;
  category: string;
  age_group: string | null;
  description: string | null;
  price_inr: number | null;
  status: ProductStatus;
  cover_image_path: string | null;
  materials: string[];
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  manufacturer_id: string;
  variant_name: string;
  variant_value: string;
  price_inr: number | null;
  stock_qty: number | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  manufacturer_id: string;
  image_path: string;
  position: number;
  created_at: string;
};

export type Inquiry = {
  id: string;
  product_id: string;
  manufacturer_id: string;
  buyer_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  reason: string | null;
  message: string;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string;
};

export type Reel = {
  id: string;
  product_id: string;
  manufacturer_id: string;
  video_path: string;
  thumbnail_path: string | null;
  caption: string | null;
  created_at: string;
};

export type ManufacturerPublicProfile = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  established_year: number | null;
};

/**
 * Minimal typed schema for the Supabase client generics, shaped to match
 * what `supabase gen types typescript` produces. Once you have a live
 * project, run that command and replace this file with the generated
 * output for full type safety across the schema.
 *
 * Note: table Row/Insert/Update use `type` (not `interface`) above —
 * interfaces don't structurally satisfy `Record<string, unknown>` in
 * TypeScript's conditional-type checks, which is what supabase-js uses
 * internally to validate the Database generic.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; role: Role };
        Update: Partial<Profile>;
        Relationships: [];
      };
      waitlist: {
        Row: WaitlistEntry;
        Insert: Omit<WaitlistEntry, "id" | "created_at">;
        Update: Partial<WaitlistEntry>;
        Relationships: [];
      };
      manufacturer_profiles: {
        Row: ManufacturerProfile;
        Insert: Partial<ManufacturerProfile> & {
          id: string;
          business_name: string;
          gst_number: string;
        };
        Update: Partial<ManufacturerProfile>;
        Relationships: [];
      };
      manufacturer_documents: {
        Row: ManufacturerDocument;
        Insert: Omit<ManufacturerDocument, "id" | "uploaded_at">;
        Update: Partial<ManufacturerDocument>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & { manufacturer_id: string; name: string };
        Update: Partial<Product>;
        Relationships: [];
      };
      reels: {
        Row: Reel;
        Insert: Omit<Reel, "id" | "created_at">;
        Update: Partial<Reel>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, "id" | "created_at">;
        Update: Partial<ProductVariant>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id" | "created_at">;
        Update: Partial<ProductImage>;
        Relationships: [];
      };
      inquiries: {
        Row: Inquiry;
        Insert: Partial<Inquiry> & {
          product_id: string;
          manufacturer_id: string;
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<Inquiry>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Partial<ContactMessage> & {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<ContactMessage>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, "id" | "created_at">;
        Update: Partial<NewsletterSubscriber>;
        Relationships: [];
      };
    };
    Views: {
      manufacturer_public_profiles: {
        Row: ManufacturerPublicProfile;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: Role;
      verification_status: VerificationStatus;
      product_status: ProductStatus;
      inquiry_status: InquiryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
