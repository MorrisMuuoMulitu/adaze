/**
 * M-Pesa Helper Utilities
 */

/**
 * Generates a timestamp in the format YYYYMMDDHHmmss
 * Uses Africa/Nairobi (UTC+3) timezone as required by Safaricom
 */
export function generateTimestamp(): string {
  const now = new Date();
  
  // Africa/Nairobi is UTC+3
  const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return nairobiTime.getUTCFullYear().toString() +
    pad(nairobiTime.getUTCMonth() + 1) +
    pad(nairobiTime.getUTCDate()) +
    pad(nairobiTime.getUTCHours()) +
    pad(nairobiTime.getUTCMinutes()) +
    pad(nairobiTime.getUTCSeconds());
}

/**
 * Generates the M-Pesa password for STK Push
 */
export function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  return Buffer.from(shortCode + passkey + timestamp).toString('base64');
}

/**
 * Returns the base URL for the M-Pesa API based on the environment
 */
export function getBaseUrl(environment: string): string {
  if (environment === 'production') {
    return 'https://api.safaricom.co.ke';
  } else if (environment === 'sandbox') {
    return 'https://sandbox.safaricom.co.ke';
  } else {
    throw new Error(`Invalid M-Pesa environment: ${environment}. Must be 'production' or 'sandbox'.`);
  }
}

/**
 * Formats a phone number to the Safaricom format: 254XXXXXXXXX
 * Supports formats: 0712345678, +254712345678, 254712345678, 712345678
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle various formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('254')) {
    // Already correct
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    cleaned = '254' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
    // Already correct
  } else {
    throw new Error(`Invalid Safaricom phone number format: ${phone}.`);
  }

  // Final check for Safaricom format (2547XXXXXXXX or 2541XXXXXXXX)
  if (!/^254[17]\d{8}$/.test(cleaned)) {
    throw new Error(`Number ${phone} is not a valid Safaricom phone number.`);
  }

  return cleaned;
}

/**
 * Masks a phone number for logging: 254******1234
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  return `${formatted.slice(0, 3)}******${formatted.slice(-4)}`;
}
