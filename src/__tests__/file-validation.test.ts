import { describe, it, expect } from "vitest";
import { validateFileContent } from "@/lib/file-validation";

function createMockFile(
  bytes: number[],
  name: string,
  type: string,
  sizeOverride?: number
): File {
  const uint8Array = new Uint8Array(bytes);
  const file = new File([uint8Array], name, { type });
  if (sizeOverride !== undefined) {
    Object.defineProperty(file, "size", { value: sizeOverride });
  }
  return file;
}

describe("File Validation & Magic Byte Header Checks (src/lib/file-validation.ts)", () => {
  describe("Image Validation", () => {
    it("accepts valid JPEG files with FF D8 FF header magic bytes", async () => {
      const jpegHeader = [
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ];
      const file = createMockFile(jpegHeader, "photo.jpg", "image/jpeg");

      const result = await validateFileContent(file, ["image"]);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts valid PNG files with 89 50 4E 47 header magic bytes", async () => {
      const pngHeader = [
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ];
      const file = createMockFile(pngHeader, "logo.png", "image/png");

      const result = await validateFileContent(file, ["image"]);
      expect(result.valid).toBe(true);
    });

    it("accepts valid WEBP files with RIFF...WEBP header magic bytes", async () => {
      const webpHeader = [
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0x00,
        0x00,
        0x00,
        0x00,
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
      ];
      const file = createMockFile(webpHeader, "banner.webp", "image/webp");

      const result = await validateFileContent(file, ["image"]);
      expect(result.valid).toBe(true);
    });

    it("rejects image files exceeding the 5MB size limit", async () => {
      const jpegHeader = [
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ];
      const oversizedSize = 6 * 1024 * 1024; // 6MB
      const file = createMockFile(jpegHeader, "huge.jpg", "image/jpeg", oversizedSize);

      const result = await validateFileContent(file, ["image"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Image files must be under 5MB");
    });
  });

  describe("PDF Document Validation", () => {
    it("accepts valid PDF files with %PDF header magic bytes", async () => {
      const pdfHeader = [
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0a, 0x25, 0xe2, 0xe4,
      ];
      const file = createMockFile(pdfHeader, "gst-certificate.pdf", "application/pdf");

      const result = await validateFileContent(file, ["pdf"]);
      expect(result.valid).toBe(true);
    });

    it("rejects PDF documents exceeding the 10MB size limit", async () => {
      const pdfHeader = [
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0a, 0x25, 0xe2, 0xe4,
      ];
      const oversizedSize = 12 * 1024 * 1024; // 12MB
      const file = createMockFile(
        pdfHeader,
        "large.pdf",
        "application/pdf",
        oversizedSize
      );

      const result = await validateFileContent(file, ["pdf"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("PDF documents must be under 10MB");
    });
  });

  describe("Video Reel Validation", () => {
    it("accepts valid MP4 video files with ftyp header at offset 4", async () => {
      const mp4Header = [
        0x00,
        0x00,
        0x00,
        0x18, // box size
        0x66,
        0x74,
        0x79,
        0x70, // ftyp
        0x6d,
        0x70,
        0x34,
        0x32, // mp42
      ];
      const file = createMockFile(mp4Header, "product-reel.mp4", "video/mp4");

      const result = await validateFileContent(file, ["video"]);
      expect(result.valid).toBe(true);
    });

    it("accepts valid WEBM video files with 1A 45 DF A3 header", async () => {
      const webmHeader = [
        0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81,
      ];
      const file = createMockFile(webmHeader, "demo.webm", "video/webm");

      const result = await validateFileContent(file, ["video"]);
      expect(result.valid).toBe(true);
    });

    it("rejects video files exceeding the 50MB size limit", async () => {
      const mp4Header = [
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
      ];
      const oversizedSize = 55 * 1024 * 1024; // 55MB
      const file = createMockFile(
        mp4Header,
        "huge-video.mp4",
        "video/mp4",
        oversizedSize
      );

      const result = await validateFileContent(file, ["video"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Video files must be under 50MB");
    });
  });

  describe("Security & Spoofing Defense", () => {
    it("detects disguised executable files renamed to .png", async () => {
      // Windows executable (MZ header): 4D 5A ...
      const exeHeader = [
        0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
      ];
      const spoofedFile = createMockFile(exeHeader, "malicious.png", "image/png");

      const result = await validateFileContent(spoofedFile, ["image"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file contents");
    });

    it("rejects corrupt or empty files with less than 4 bytes", async () => {
      const corruptFile = createMockFile([0x01, 0x02], "empty.jpg", "image/jpeg");

      const result = await validateFileContent(corruptFile, ["image"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File is empty or corrupt");
    });
  });
});
