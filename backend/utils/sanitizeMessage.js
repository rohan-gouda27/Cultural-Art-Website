/**
 * Sanitize chat message: hide phone numbers and price/amounts to protect platform business model.
 * Replaces detected patterns with ***** and returns whether any replacement was made.
 */
const PHONE_REGEX = /(?:\+91[\s-]*)?(?:0)?[6-9]\d[\s.-]*\d{8}\b|\b[6-9]\d{9}\b/g;
const PRICE_REGEX = /₹\s*\d+(?:,\d+)*(?:\.\d+)?|\b(?:rs\.?|rupees?|inr)\s*\d+(?:,\d+)*(?:\.\d+)?|\b(?:price|cost|budget|amount)\s*[:\s]*\d+(?:,\d+)*(?:\.\d+)?|\b\d{5,}\b/gi;
const MASK = '*****';

function sanitizeMessage(content) {
  if (!content || typeof content !== 'string') return { sanitized: content || '', wasSanitized: false };
  let sanitized = content.replace(PHONE_REGEX, MASK).replace(PRICE_REGEX, MASK);
  const wasSanitized = sanitized !== content;
  return { sanitized: sanitized.trim() || content, wasSanitized };
}

module.exports = { sanitizeMessage };
