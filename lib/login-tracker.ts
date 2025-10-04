// Login tracking functions for security monitoring

import { createClient } from '@/lib/supabase/client';

interface LoginAttempt {
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
}

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
export async function logLoginAttempt(attempt: LoginAttempt) {
  try {
    const supabase = createClient();
    const userAgent = attempt.userAgent || navigator.userAgent;

    const { error } = await supabase
      .from('login_history')
      .insert({
        user_id: attempt.userId,
        login_time: new Date().toISOString(),
        ip_address: attempt.ipAddress || 'Unknown',
        user_agent: userAgent,
        device_type: attempt.deviceType || getDeviceType(userAgent),
        browser: attempt.browser || getBrowser(userAgent),
        os: attempt.os || getOS(userAgent),
        location_country: attempt.locationCountry || 'Kenya',
        location_city: attempt.locationCity || 'Nairobi',
        status: attempt.status,
        is_suspicious: false,
        risk_score: 0,
      });

    if (error) {
      console.error('Failed to log login attempt:', error);
    } else {
      console.log('✅ Login attempt logged successfully');
    }

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
  try {
    const supabase = createClient();
    const userAgent = navigator.userAgent;

    const sessionToken = crypto.randomUUID();

    const { error } = await supabase
      .from('active_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        device_name: getBrowser(userAgent),
        device_type: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        os: getOS(userAgent),
        ip_address: 'Unknown', // Would need server-side to get real IP
        location_country: 'Kenya',
        location_city: 'Nairobi',
        is_active: true,
        last_activity_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    if (error) {
      console.error('Failed to create session:', error);
    } else {
      console.log('✅ Active session created');
    }

    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

// Update session activity
export async function updateSessionActivity(sessionToken: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('active_sessions')
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Failed to update session:', error);
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

// Terminate session on logout
export async function terminateSession(userId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to terminate session:', error);
    } else {
      console.log('✅ Session terminated');
    }
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
