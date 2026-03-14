/**
 * Geo-Location Service
 *
 * Optional geo-location lookup for IP addresses.
 * Uses external APIs to determine location from IP.
 */

interface GeoLocation {
  ip: string;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  isp: string | null;
}

// Cache for geo-location results (simple in-memory cache)
const geoCache = new Map<string, { data: GeoLocation; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get geo-location for an IP address
 * Uses ip-api.com free tier (rate limited to 45 requests/minute)
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  // Return default for unknown or private IPs
  if (ip === 'unknown' || isPrivateIP(ip)) {
    return {
      ip,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      region: 'Nairobi',
      latitude: -1.2921,
      longitude: 36.8219,
      timezone: 'Africa/Nairobi',
      isp: null,
    };
  }

  // Check cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Use ip-api.com for geo-location (free tier)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,region,lat,lon,timezone,isp`);
    const data = await response.json();

    if (data.status !== 'success') {
      console.warn(`Geo-location lookup failed for IP ${ip}:`, data.message);
      return getDefaultGeoLocation(ip);
    }

    const geoLocation: GeoLocation = {
      ip,
      country: data.country || null,
      countryCode: data.countryCode || null,
      city: data.city || null,
      region: data.regionName || null,
      latitude: data.lat || null,
      longitude: data.lon || null,
      timezone: data.timezone || null,
      isp: data.isp || null,
    };

    // Cache the result
    geoCache.set(ip, { data: geoLocation, timestamp: Date.now() });

    return geoLocation;
  } catch (error) {
    console.error('Error fetching geo-location:', error);
    return getDefaultGeoLocation(ip);
  }
}

/**
 * Get geo-location for Kenya (default)
 */
function getDefaultGeoLocation(ip: string): GeoLocation {
  return {
    ip,
    country: 'Kenya',
    countryCode: 'KE',
    city: 'Nairobi',
    region: 'Nairobi',
    latitude: -1.2921,
    longitude: 36.8219,
    timezone: 'Africa/Nairobi',
    isp: null,
  };
}

/**
 * Check if IP is private (imported from ip-utils)
 */
function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ];

  return privateRanges.some(pattern => pattern.test(ip));
}

/**
 * Format location string for display
 */
export function formatLocation(geo: GeoLocation): string {
  if (geo.city && geo.country) {
    return `${geo.city}, ${geo.country}`;
  }
  if (geo.country) {
    return geo.country;
  }
  return 'Unknown Location';
}

/**
 * Detect suspicious location patterns
 */
export function isSuspiciousLocation(
  previousLocation: { country: string | null; city: string | null } | null,
  currentLocation: GeoLocation
): boolean {
  if (!previousLocation) return false;

  // Different country from previous login (potential concern)
  if (previousLocation.country && currentLocation.country &&
      previousLocation.country !== currentLocation.country) {
    return true;
  }

  return false;
}