import type { VerificationStatus, DocType } from "@/types/database";

export const STATUS_LABEL: Record<VerificationStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified",
  rejected: "Changes requested",
};

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  gst_certificate: "GST Certificate",
  factory_photo: "Factory Photo",
  quality_certificate: "Quality Certificate",
  other: "Other Document",
};

export const DOC_TYPES: DocType[] = [
  "gst_certificate",
  "factory_photo",
  "quality_certificate",
  "other",
];
