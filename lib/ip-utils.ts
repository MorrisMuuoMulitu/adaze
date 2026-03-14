/**
 * IP Address Utilities
 *
 * Extracts client IP addresses from request headers for security tracking.
 * Supports various proxy configurations including Cloudflare, Nginx, and AWS.
 */

/**
 * Extract client IP address from request headers
 *
 * Priority order:
 * 1. x-forwarded-for (first IP in chain)
 * 2. x-real-ip (Nginx)
 * 3. cf-connecting-ip (Cloudflare)
 * 4. x-client-ip (AWS ALB)
 * 5. x-cluster-client-ip (GCP)
 * 6. forwarded (RFC 7239)
 * 7. 'unknown' fallback
 */
export function extractClientIP(headers: Headers): string {
  // Check X-Forwarded-For header (most common)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2, ...
    // The first one is the original client IP
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  // Check X-Real-IP (Nginx)
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Check CF-Connecting-IP (Cloudflare)
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // Check X-Client-IP (AWS ALB)
  const clientIP = headers.get('x-client-ip');
  if (clientIP) {
    return clientIP;
  }

  // Check X-Cluster-Client-IP (GCP)
  const clusterIP = headers.get('x-cluster-client-ip');
  if (clusterIP) {
    return clusterIP;
  }

  // Check Forwarded header (RFC 7239)
  const forwarded = headers.get('forwarded');
  if (forwarded) {
    // Parse: for=192.0.2.1;proto=http;by=203.0.113.1
    const forMatch = forwarded.match(/for=([^;,\s]+)/);
    if (forMatch && forMatch[1]) {
      // Remove brackets and port if present
      return forMatch[1].replace(/[\[\]]/g, '').split(':')[0];
    }
  }

  return 'unknown';
}

/**
 * Extract client IP from Next.js Request
 */
export function extractClientIPFromRequest(request: Request): string {
  return extractClientIP(request.headers);
}

/**
 * Check if an IP address is valid
 */
export function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){1,7}$|^([0-9a-fA-F]{1,4}:){1,7}:$/;

  if (ipv4Pattern.test(ip)) {
    // Validate IPv4 octets are in range
    const octets = ip.split('.').map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
  }

  return ipv6Pattern.test(ip);
}

/**
 * Check if IP is a private/local address
 */
export function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,                           // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,                     // 192.168.0.0/16
    /^127\./,                          // 127.0.0.0/8 (localhost)
    /^169\.254\./,                     // 169.254.0.0/16 (link-local)
    /^::1$/,                           // IPv6 localhost
    /^fc00:/i,                        // IPv6 unique local
    /^fe80:/i,                        // IPv6 link-local
  ];

  return privateRanges.some(pattern => pattern.test(ip));
}