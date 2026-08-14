export type Role = "buyer" | "seller" | "admin" | "customer";

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
  state: string | null;
  pincode: string | null;
  alternate_phone: string | null;
  bio: string | null;
  email_notifications: boolean;
  gst_number: string | null;
  shipping_address: string | null;
  account_status: string;
  last_active_at: string | null;
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

export type SellerProfile = {
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

export type SellerDocument = {
  id: string;
  seller_id: string;
  doc_type: DocType;
  file_path: string;
  file_name: string;
  uploaded_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  age_group: string | null;
  description: string | null;
  price_inr: number | null;
  status: ProductStatus;
  cover_image_path: string | null;
  materials: string[];
  seller_verified?: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  seller_id: string;
  variant_name: string;
  variant_value: string;
  price_inr: number | null;
  stock_qty: number | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  seller_id: string;
  image_path: string;
  position: number;
  created_at: string;
};

export type Inquiry = {
  id: string;
  product_id: string;
  seller_id: string;
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
  seller_id: string;
  video_path: string;
  thumbnail_path: string | null;
  caption: string | null;
  created_at: string;
};

export type PageView = {
  id: number;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
};

export type RateLimitLog = {
  id: string;
  ip_address: string;
  identifier: string | null;
  endpoint_type: string;
  action_name: string;
  is_failed: boolean;
  created_at: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type SellerApplication = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  business_name: string;
  business_type: string;
  form_data: Record<string, unknown>;
  status: ApplicationStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
};

export type SellerPublicProfile = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  established_year: number | null;
};

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
      seller_profiles: {
        Row: SellerProfile;
        Insert: Partial<SellerProfile> & {
          id: string;
          business_name: string;
          gst_number: string;
        };
        Update: Partial<SellerProfile>;
        Relationships: [];
      };
      seller_documents: {
        Row: SellerDocument;
        Insert: Omit<SellerDocument, "id" | "uploaded_at">;
        Update: Partial<SellerDocument>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & { seller_id: string; name: string };
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
          seller_id: string;
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
      page_views: {
        Row: PageView;
        Insert: Omit<PageView, "id" | "created_at">;
        Update: Partial<PageView>;
        Relationships: [];
      };
      rate_limit_logs: {
        Row: RateLimitLog;
        Insert: Omit<RateLimitLog, "id" | "created_at">;
        Update: Partial<RateLimitLog>;
        Relationships: [];
      };
      seller_applications: {
        Row: SellerApplication;
        Insert: Omit<
          SellerApplication,
          "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason"
        > & { status?: ApplicationStatus; rejection_reason?: string | null };
        Update: Partial<SellerApplication>;
        Relationships: [];
      };
    };
    Views: {
      seller_public_profiles: {
        Row: SellerPublicProfile;
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
