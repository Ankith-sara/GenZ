/**
 * Escapes a value for safe interpolation into HTML text or a quoted attribute.
 * Use for every user- or seller-provided string placed in an email template.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only allows http(s) URLs into href attributes; anything else becomes "#". */
export function safeUrl(value: string | null | undefined): string {
  if (!value) return "#";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? escapeHtml(url.toString())
      : "#";
  } catch {
    return "#";
  }
}
