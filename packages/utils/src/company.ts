/**
 * Single source of truth for GenZ company, legal and customer-policy details.
 *
 * Used by the storefront legal pages (/terms, /privacy, /refund-policy,
 * /shipping-policy, /grievance), the footer and the seller portal.
 *
 */

export interface PostalAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface GrievanceOfficer {
  name: string;
  designation: string;
  email: string;
  phone: string;
  address: PostalAddress;
  workingHours: string;
}

export interface Director {
  name: string;
  din: string;
}

export interface CompanyDetails {
  brandName: string;
  legalEntityName: string;
  cin: string;
  gstin: string;
  esic?: string;
  epfo?: string;
  directors: Director[];
  registeredOffice: PostalAddress;
  domain: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  supportPhoneHref: string;
  supportHours: string;
  instagramHandle: string;
  instagramUrl: string;
  grievanceOfficer: GrievanceOfficer;
}

const SUPPORT_EMAIL = "genz.official.hq@gmail.com";
const SUPPORT_PHONE = "+91 77948 93768";
const SUPPORT_PHONE_HREF = "+917794893768";
const SUPPORT_HOURS =
  "Monday to Saturday, 9:00 AM – 7:00 PM IST (excluding public holidays)";

const REGISTERED_OFFICE: PostalAddress = {
  line1: "H. No : 4-17, Yanampalli",
  line2: "Armoor",
  city: "Nizamabad",
  state: "Telangana",
  pincode: "503175",
  country: "India",
};

export const COMPANY: CompanyDetails = {
  brandName: "GenZ Online",
  legalEntityName: "GENZONLINE PRIVATE LIMITED",
  cin: "U47912TS2026PTC223484",
  gstin: "36AANCG4552H1ZD",
  esic: "52002775620000999",
  epfo: "NZNZB4110223000",
  directors: [
    { name: "Appala Sairam", din: "11973168" },
    { name: "Vishal Alavadutha", din: "11973167" },
  ],
  registeredOffice: REGISTERED_OFFICE,
  domain: "genzonline.in",
  websiteUrl: "https://genzonline.in",
  supportEmail: SUPPORT_EMAIL,
  supportPhone: SUPPORT_PHONE,
  supportPhoneHref: SUPPORT_PHONE_HREF,
  supportHours: SUPPORT_HOURS,
  instagramHandle: "@genzonline4u",
  instagramUrl: "https://www.instagram.com/genzonline4u",
  grievanceOfficer: {
    name: "Vishal Alavadutha",
    designation: "Grievance Officer & Director",
    // Until a dedicated grievance mailbox/number exists, complaints are routed
    // to the official support channels, which are monitored.
    email: SUPPORT_EMAIL,
    phone: SUPPORT_PHONE,
    address: REGISTERED_OFFICE,
    workingHours: SUPPORT_HOURS,
  },
};

/**
 * Customer-facing policy constants. Legal pages, cart and order UIs should
 * reference these instead of hardcoding numbers.
 */
export const POLICY = {
  /** Orders can be cancelled by the buyer until the order reaches this status. */
  cancellationAllowedUntilStatus: "shipped",
  /** Return/replacement requests must be raised within this many days of delivery. */
  returnWindowDays: 7,
  /** Reasons for which a return is accepted within the return window. */
  returnEligibleReasons: [
    "Item arrived damaged",
    "Item is defective",
    "Wrong item delivered",
  ],
  /** Handmade / made-to-order items are non-returnable unless damaged or defective. */
  handmadeNonReturnableUnlessDefective: true,
  /** Refunds go back to the original payment method. */
  refundMethod: "original payment method",
  refundTimelineBusinessDays: { min: 5, max: 7 },
  /** Complaint acknowledgement deadline (Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5)). */
  grievanceAcknowledgementHours: 48,
  /** Complaint resolution deadline (Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5)). */
  grievanceResolutionDays: 30,
  grievanceResolutionLabel: "1 month",
} as const;

/** Government consumer redressal channels (escalation path). */
export const NATIONAL_CONSUMER_HELPLINE = {
  name: "National Consumer Helpline",
  tollFree: "1915",
  website: "https://consumerhelpline.gov.in",
  edaakhilWebsite: "https://edaakhil.nic.in",
} as const;

/** Formats an address as a single comma-separated line. */
export function formatAddress(address: PostalAddress): string {
  return [
    address.line1,
    address.line2,
    address.city,
    `${address.state} ${address.pincode}`.trim(),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Every company field that still holds a "[placeholder]" value. The owner
 * must supply these real values; the spec fails if a placeholder is added
 * without being listed here (or if a filled field is left in the list).
 */
export const COMPANY_DETAILS_PENDING: string[] = [];

/** True while any legally required company detail is still a placeholder. */
export const HAS_PENDING_COMPANY_DETAILS = COMPANY_DETAILS_PENDING.length > 0;

/** Returns the dotted path of every string field in COMPANY that contains "[". */
export function findPlaceholderFields(value: unknown = COMPANY, prefix = ""): string[] {
  if (typeof value === "string") {
    return value.includes("[") ? [prefix] : [];
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
      findPlaceholderFields(v, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
}
