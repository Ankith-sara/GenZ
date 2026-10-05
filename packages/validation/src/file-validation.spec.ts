import { describe, it, expect } from "vitest";
import { validateFileContent, validateFileContentServer } from "./file-validation";

describe("File Validation Magic Byte Logic Specs", () => {
  it("rejects file exceeding max size", async () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });

    const result = await validateFileContent(largeFile, ["image"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("under 5MB");
  });

  it("validates valid PNG magic bytes", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    const file = new File([pngHeader.buffer], "image.png", { type: "image/png" });

    const result = await validateFileContent(file, ["image"]);
    expect(result.valid).toBe(true);
  });

  it("detects disguised executable disguised as PNG", async () => {
    const exeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0, 0, 0, 0, 0, 0, 0, 0]);
    const file = new File([exeHeader.buffer], "fake.png", { type: "image/png" });

    const result = await validateFileContent(file, ["image"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid file contents");
  });

  it("validates Node Buffer magic bytes server-side", async () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);

    const result = await validateFileContentServer(pngBuffer, ["image"]);
    expect(result.valid).toBe(true);
  });

  it("rejects fake PDF Buffer server-side", async () => {
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = await validateFileContentServer(exeBuffer, ["pdf"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid file contents");
  });
});
