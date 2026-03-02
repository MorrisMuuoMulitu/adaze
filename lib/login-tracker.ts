// Login tracking functions for security monitoring

// Get device type from user agent
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

// Get browser from user agent
function getBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  if (/opera/i.test(userAgent)) return 'Opera';
  return 'Unknown';
}

// Get OS from user agent
function getOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

// Log login attempt
export async function logLoginAttempt(attempt: {
  userId: string;
  email: string;
  status: 'success' | 'failed' | 'blocked';
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  locationCountry?: string;
  locationCity?: string;
}) {
  if (typeof window !== 'undefined') {
    // In browser, we should probably call an API instead of using Prisma
    // For now, just skip or implement API call
    return;
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const { LoginStatus } = await import('@prisma/client');
    const userAgent = attempt.userAgent || 'Server';

    await prisma.loginHistory.create({
      data: {
        userId: attempt.userId,
        ipAddress: attempt.ipAddress || 'Unknown',
        userAgent: userAgent,
        deviceType: attempt.deviceType || getDeviceType(userAgent),
        browser: attempt.browser || getBrowser(userAgent),
        os: attempt.os || getOS(userAgent),
        locationCountry: attempt.locationCountry || 'Kenya',
        locationCity: attempt.locationCity || 'Nairobi',
        status: attempt.status.toUpperCase() as any,
        isSuspicious: false,
        riskScore: 0,
      },
    });

    console.log('✅ Login attempt logged successfully');

    // Send email notification if enabled (and successful login)
    if (attempt.status === 'success') {
      try {
        const { notifyNewLogin } = await import('@/lib/notifications');
        await notifyNewLogin(
          attempt.userId,
          attempt.email,
          `${getBrowser(userAgent)} on ${getOS(userAgent)}`,
          attempt.locationCity || 'Nairobi, Kenya',
          attempt.ipAddress || 'Unknown'
        );
      } catch (notifyError) {
        console.error('Failed to send login notification:', notifyError);
      }
    }
  } catch (error) {
    console.error('Error in logLoginAttempt:', error);
  }
}

// Create active session
export async function createActiveSession(userId: string) {
  if (typeof window !== 'undefined') return null;

  try {
    const { prisma } = await import('@/lib/prisma');
    const userAgent = 'Server';
    const sessionToken = crypto.randomUUID();

    await prisma.session.create({
      data: {
        userId: userId,
        sessionToken: sessionToken,
        deviceName: getBrowser(userAgent),
        deviceType: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        os: getOS(userAgent),
        ipAddress: 'Unknown',
        locationCountry: 'Kenya',
        locationCity: 'Nairobi',
        isActive: true,
        lastActivityAt: new Date(),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    console.log('✅ Active session created');
    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

// Update session activity
export async function updateSessionActivity(sessionToken: string) {
  if (typeof window !== 'undefined') return;

  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.session.update({
      where: { sessionToken },
      data: {
        lastActivityAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

// Terminate session on logout
export async function terminateSession(userId: string) {
  if (typeof window !== 'undefined') {
    // Call API instead of direct Prisma
    await fetch('/api/account/terminate-sessions', { method: 'POST' });
    return;
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.session.updateMany({
      where: { 
        userId: userId,
        isActive: true
      },
      data: { isActive: false },
    });
    console.log('✅ Session terminated');
  } catch (error) {
    console.error('Error terminating session:', error);
  }
}

// Get client IP (best effort - needs server-side for accuracy)
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP:', error);
    return 'Unknown';
  }
}
