import { describe, it, expect } from "vitest";

function validateFileUpload(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Unsupported file format" };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "File exceeds 5MB size limit" };
  }

  return { valid: true };
}

describe("Utility: File Validation", () => {
  it("allows valid PNG and JPEG images under 5MB", () => {
    const validImage = {
      name: "gst-certificate.png",
      size: 2 * 1024 * 1024,
      type: "image/png",
    };
    expect(validateFileUpload(validImage)).toEqual({ valid: true });
  });

  it("allows PDF documents under 5MB for GST proof", () => {
    const validPdf = {
      name: "gst-doc.pdf",
      size: 1 * 1024 * 1024,
      type: "application/pdf",
    };
    expect(validateFileUpload(validPdf)).toEqual({ valid: true });
  });

  it("rejects files exceeding 5MB limit", () => {
    const oversizedFile = {
      name: "large-catalog.pdf",
      size: 10 * 1024 * 1024,
      type: "application/pdf",
    };
    const res = validateFileUpload(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("5MB");
  });

  it("rejects executable or unsupported file extensions", () => {
    const invalidFile = {
      name: "script.exe",
      size: 100 * 1024,
      type: "application/x-msdownload",
    };
    const res = validateFileUpload(invalidFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Unsupported");
  });
});
