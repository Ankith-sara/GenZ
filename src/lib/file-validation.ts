export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file's content by checking its magic bytes/header signature.
 * Prevents disguised files (e.g., .exe renamed to .png) from being processed.
 */
export async function validateFileContent(
  file: File,
  allowedTypes: ("image" | "pdf" | "video")[]
): Promise<FileValidationResult> {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isVideo = file.type.startsWith("video/");

  // 1. Double check size limits first
  if (isVideo && file.size > 50 * 1024 * 1024) {
    return { valid: false, error: "Video files must be under 50MB." };
  }
  if (isPdf && file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "PDF documents must be under 10MB." };
  }
  if (isImage && file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "Image files must be under 5MB." };
  }

  // 2. Read first 12 bytes
  let buffer: ArrayBuffer;
  try {
    buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file.slice(0, 12));
    });
  } catch (err) {
    console.error("FileReader error:", err);
    return { valid: false, error: "Could not read file contents." };
  }

  const arr = new Uint8Array(buffer);
  if (arr.length < 4) {
    return { valid: false, error: "File is empty or corrupt." };
  }

  // JPEG: FF D8 FF
  const isJpegSig = arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPngSig =
    arr[0] === 0x89 &&
    arr[1] === 0x50 &&
    arr[2] === 0x4e &&
    arr[3] === 0x47 &&
    arr[4] === 0x0d &&
    arr[5] === 0x0a &&
    arr[6] === 0x1a &&
    arr[7] === 0x0a;

  // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  const isWebpSig =
    arr[0] === 0x52 &&
    arr[1] === 0x49 &&
    arr[2] === 0x46 &&
    arr[3] === 0x46 &&
    arr[8] === 0x57 &&
    arr[9] === 0x45 &&
    arr[10] === 0x42 &&
    arr[11] === 0x50;

  // PDF: %PDF (25 50 44 46)
  const isPdfSig =
    arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46;

  // MP4/MOV: ftyp (66 74 79 70) at offset 4
  const isMp4Sig =
    arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70;

  // WEBM: 1A 45 DF A3
  const isWebmSig =
    arr[0] === 0x1a && arr[1] === 0x45 && arr[2] === 0xdf && arr[3] === 0xa3;

  // Determine detected type
  let detected: "image" | "pdf" | "video" | null = null;
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
