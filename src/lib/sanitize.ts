/**
 * Sanitization utilities to prevent XSS attacks
 * Handles HTML entities and basic script filtering
 */

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Create a temporary DOM element to leverage browser's built-in HTML parser
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function sanitizeAttribute(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Remove any potentially dangerous characters
  return input
    .replace(/[<>"'`]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;',
      };
      return escapeMap[char] || char;
    })
    .trim()
    .slice(0, 500); // Cap at 500 chars for form inputs
}

export function sanitizeTaskLabel(input: string): string {
  return sanitizeAttribute(input).slice(0, 100);
}

export function sanitizeZone(input: string): string {
  return sanitizeAttribute(input).slice(0, 50);
}

export function sanitizeMemberName(input: string): string {
  return sanitizeAttribute(input).slice(0, 30);
}

export function sanitizeNote(input: string): string {
  // Notes can be longer and don't need aggressive attribute escaping
  if (!input || typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML.slice(0, 5000); // Cap notes at 5000 chars
}
