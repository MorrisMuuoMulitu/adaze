/**
 * M-Pesa Security Middleware Utilities
 */

/**
 * Official Safaricom Daraja Callback IP Ranges (2026)
 */
export const SAFARICOM_IP_RANGES = [
  '196.201.212.0/24',
  '196.201.213.0/24',
  '196.201.214.0/24',
  // Individual IPs often used
  '196.201.212.127',
  '196.201.212.138',
  '196.201.214.200',
  '196.201.214.206',
];

/**
 * Checks if an IP is within the Safaricom whitelist
 */
export function isSafaricomIp(ip: string): boolean {
  const environment = process.env.MPESA_ENV || process.env.NEXT_PUBLIC_MPESA_ENV || 'sandbox';
  
  // In sandbox, we allow all IPs for easier testing with ngrok/simulators
  if (environment === 'sandbox') {
    return true;
  }

  // Handle IPv6 loopback and mapped IPv4
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return true;
  }

  // In production, you would use a CIDR library to check ranges
  // For simplicity here, we'll check exact matches or start-of-string
  return SAFARICOM_IP_RANGES.some(range => {
    if (range.includes('/')) {
      const base = range.split('/')[0].split('.').slice(0, 3).join('.');
      return ip.startsWith(base);
    }
    return ip === range;
  });
}

/**
 * Simple Idempotency Helper (In-memory Set with TTL)
 * In production, this should use Redis
 */
const processedRequests = new Set<string>();

export function isDuplicateRequest(checkoutRequestId: string): boolean {
  if (processedRequests.has(checkoutRequestId)) {
    return true;
  }
  
  processedRequests.add(checkoutRequestId);
  
  // Simple cleanup after 1 hour
  setTimeout(() => {
    processedRequests.delete(checkoutRequestId);
  }, 3600000);
  
  return false;
}
