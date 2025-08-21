/**
 * Removes non-digit characters from a phone number string.
 * Allows a leading '+' for international format.
 * @param phone The raw phone number string or number.
 * @returns A cleaned phone number string.
 */
export const cleanPhoneNumber = (phone: string | number): string => {
  const phoneStr = String(phone || '');
  if (!phoneStr) return '';
  return phoneStr.replace(/[^0-9+]/g, '');
};

/**
 * Formats a phone number for display in Japanese domestic format.
 * Converts E.164 format (+81... or 81...) to 0-prefixed format (090...).
 * @param phone The phone number string or number, potentially in E.164 format.
 * @returns A formatted phone number string for display.
 */
export const formatPhoneNumberForDisplay = (phone: string | number): string => {
  const phoneStr = String(phone || '');
  if (!phoneStr) return '';
  const cleaned = cleanPhoneNumber(phoneStr);
  if (cleaned.startsWith('+81')) {
    return '0' + cleaned.substring(3);
  }
  // Handle numbers like 8190...
  if (cleaned.startsWith('81') && (cleaned.length === 12 || cleaned.length === 11)) {
    return '0' + cleaned.substring(2);
  }
  return cleaned;
};