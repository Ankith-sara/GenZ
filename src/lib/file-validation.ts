export type AllowedFileType = "image" | "pdf" | "video";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates magic byte signatures from a Uint8Array slice.
 */
export function validateBufferMagicBytes(
  bytes: Uint8Array,
  size: number,
  allowedTypes: AllowedFileType[],
  mimeTypeHint?: string
): FileValidationResult {
  const isVideo = allowedTypes.includes("video") && mimeTypeHint?.startsWith("video/");
  const isPdf = allowedTypes.includes("pdf") && mimeTypeHint === "application/pdf";
  const isImage = allowedTypes.includes("image") && mimeTypeHint?.startsWith("image/");

  if (isVideo && size > 50 * 1024 * 1024) {
    return { valid: false, error: "Video files must be under 50MB." };
  }
  if (isPdf && size > 10 * 1024 * 1024) {
    return { valid: false, error: "PDF documents must be under 10MB." };
  }
  if (isImage && size > 5 * 1024 * 1024) {
    return { valid: false, error: "Image files must be under 5MB." };
  }

  // General size fallbacks if mimeTypeHint is not set
  if (
    allowedTypes.length === 1 &&
    allowedTypes[0] === "image" &&
    size > 5 * 1024 * 1024
  ) {
    return { valid: false, error: "Image files must be under 5MB." };
  }
  if (
    allowedTypes.length === 1 &&
    allowedTypes[0] === "pdf" &&
    size > 10 * 1024 * 1024
  ) {
    return { valid: false, error: "PDF documents must be under 10MB." };
  }
  if (
    allowedTypes.length === 1 &&
    allowedTypes[0] === "video" &&
    size > 50 * 1024 * 1024
  ) {
    return { valid: false, error: "Video files must be under 50MB." };
  }

  if (bytes.length < 4) {
    return { valid: false, error: "File is empty or corrupt." };
  }

  // JPEG: FF D8 FF
  const isJpegSig = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPngSig =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  const isWebpSig =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  // PDF: %PDF (25 50 44 46)
  const isPdfSig =
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

  // MP4/MOV: ftyp (66 74 79 70) at offset 4
  const isMp4Sig =
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;

  // WEBM: 1A 45 DF A3
  const isWebmSig =
    bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;

  // Determine detected type
  let detected: AllowedFileType | null = null;
  if (isJpegSig || isPngSig || isWebpSig) {
    detected = "image";
  } else if (isPdfSig) {
    detected = "pdf";
  } else if (isMp4Sig || isWebmSig) {
    detected = "video";
  }

  if (!detected || !allowedTypes.includes(detected)) {
    return {
      valid: false,
      error: `Invalid file contents. Expected file type: ${allowedTypes.join(" or ").toUpperCase()}.`,
    };
  }

  return { valid: true };
}

/**
 * Server-side file content validator.
 * Accepts Node Buffer, Uint8Array, or Web File/Blob object.
 */
export async function validateFileContentServer(
  fileOrBuffer: File | Buffer | Uint8Array,
  allowedTypes: AllowedFileType[],
  mimeTypeHint?: string
): Promise<FileValidationResult> {
  let bytes: Uint8Array;
  let size: number;

  if (Buffer.isBuffer(fileOrBuffer) || fileOrBuffer instanceof Uint8Array) {
    bytes = new Uint8Array(fileOrBuffer.subarray(0, 12));
    size = fileOrBuffer.byteLength;
  } else if (typeof (fileOrBuffer as File).arrayBuffer === "function") {
    const file = fileOrBuffer as File;
    size = file.size;
    mimeTypeHint = mimeTypeHint || file.type;
    const slice = file.slice(0, 12);
    const ab = await slice.arrayBuffer();
    bytes = new Uint8Array(ab);
  } else {
    return { valid: false, error: "Invalid file object provided." };
  }

  return validateBufferMagicBytes(bytes, size, allowedTypes, mimeTypeHint);
}

/**
 * Client-side file content validator (delegates to server-capable validator).
 */
export async function validateFileContent(
  file: File,
  allowedTypes: AllowedFileType[]
): Promise<FileValidationResult> {
  return validateFileContentServer(file, allowedTypes, file.type);
}
