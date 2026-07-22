/**
 * Utility functions for security and sanitization.
 */

/**
 * Escapes HTML characters to prevent XSS.
 * React escapes by default on render, but this is useful for storing data safely.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Trims whitespace and removes basic HTML tags to sanitize input.
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (typeof input !== "string") return "";
  
  // Trim whitespace
  let clean = input.trim();
  
  // Remove basic HTML tags (this is a simple regex, for complex cases use DOMPurify)
  clean = clean.replace(/<[^>]*>?/gm, "");
  
  return escapeHtml(clean);
}
