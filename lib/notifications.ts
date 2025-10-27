// Email notification system for security events

import { createClient } from '@/lib/supabase/client';

export interface NotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send email notification using Resend API
export async function sendEmailNotification(data: NotificationData) {
  try {
    console.log('📧 Sending email notification to:', data.to);
    
    const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }
    
    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Adaze Security <onboarding@resend.dev>', // Use resend.dev for testing, replace with your verified domain
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Resend error:', result);
      return { success: false, error: result };
    }

    console.log('✅ Email sent successfully:', result.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

// Send login notification
export async function notifyNewLogin(
  userId: string,
  email: string,
  device: string,
  location: string,
  ipAddress: string
) {
  const subject = '🔐 New login to your Adaze account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">New Login Detected</h2>
      <p>Hi there,</p>
      <p>We detected a new login to your Adaze account:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Device:</strong> ${device}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you don't recognize this login, please secure your account immediately by:</p>
      <ul>
        <li>Changing your password</li>
        <li>Enabling two-factor authentication</li>
        <li>Reviewing your active sessions</li>
      </ul>
      <p style="margin-top: 30px;">
        <a href="https://adazeconnect.com/settings" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Secure My Account
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated security notification from Adaze Marketplace.
      </p>
    </div>
  `;

  const text = `
New login to your Adaze account

Device: ${device}
Location: ${location}
IP Address: ${ipAddress}
Time: ${new Date().toLocaleString()}

If this wasn't you, please secure your account immediately.
Visit: https://adazeconnect.com/settings
  `;

  return sendEmailNotification({ to: email, subject, html, text });
}

// Send suspicious activity alert
export async function notifySuspiciousActivity(
  userId: string,
  email: string,
  activityType: string,
  description: string,
  severity: string
) {
  const subject = '⚠️ Suspicious activity detected on your Adaze account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">⚠️ Security Alert</h2>
      <p>Hi there,</p>
      <p>We detected suspicious activity on your Adaze account:</p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Activity:</strong> ${activityType.replace(/_/g, ' ')}</p>
        <p style="margin: 5px 0;"><strong>Severity:</strong> ${severity.toUpperCase()}</p>
        <p style="margin: 5px 0;"><strong>Details:</strong> ${description}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p><strong>What should you do?</strong></p>
      <ul>
        <li>Review your recent account activity</li>
        <li>Change your password if you suspect unauthorized access</li>
        <li>Enable two-factor authentication for extra security</li>
        <li>Check your active sessions and terminate any you don't recognize</li>
      </ul>
      <p style="margin-top: 30px;">
        <a href="https://adazeconnect.com/settings" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Account Security
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated security alert from Adaze Marketplace.
      </p>
    </div>
  `;

  const text = `
⚠️ Suspicious activity detected on your Adaze account

Activity: ${activityType.replace(/_/g, ' ')}
Severity: ${severity.toUpperCase()}
Details: ${description}
Time: ${new Date().toLocaleString()}

Please review your account security immediately.
Visit: https://adazeconnect.com/settings
  `;

  return sendEmailNotification({ to: email, subject, html, text });
}

// Send account locked notification
export async function notifyAccountLocked(
  userId: string,
  email: string,
  reason: string,
  lockoutMinutes: number
) {
  const subject = '🔒 Your Adaze account has been temporarily locked';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">🔒 Account Locked</h2>
      <p>Hi there,</p>
      <p>Your Adaze account has been temporarily locked for security reasons:</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
        <p style="margin: 5px 0;"><strong>Lockout Duration:</strong> ${lockoutMinutes} minutes</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can try logging in again after ${lockoutMinutes} minutes.</p>
      <p>If you believe this was a mistake or need immediate access, please contact our support team.</p>
      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        This is an automated security notification from Adaze Marketplace.
      </p>
    </div>
  `;

  const text = `
Your Adaze account has been temporarily locked

Reason: ${reason}
Lockout Duration: ${lockoutMinutes} minutes
Time: ${new Date().toLocaleString()}

You can try logging in again after ${lockoutMinutes} minutes.
  `;

  return sendEmailNotification({ to: email, subject, html, text });
}

// Send 2FA enabled notification
export async function notify2FAEnabled(userId: string, email: string) {
  const subject = '✅ Two-factor authentication enabled';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">✅ 2FA Enabled</h2>
      <p>Hi there,</p>
      <p>Two-factor authentication has been successfully enabled on your Adaze account.</p>
      <p>Your account is now more secure! You'll need to enter a code from your authenticator app when signing in.</p>
      <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Make sure you:</strong></p>
        <ul style="margin: 10px 0;">
          <li>Saved your backup codes in a secure location</li>
          <li>Have access to your authenticator app</li>
          <li>Know how to use 2FA when logging in</li>
        </ul>
      </div>
      <p>If you didn't enable 2FA, please secure your account immediately.</p>
      <p style="margin-top: 30px;">
        <a href="https://adazeconnect.com/settings" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Security Settings
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated security notification from Adaze Marketplace.
      </p>
    </div>
  `;

  const text = `
Two-factor authentication enabled

2FA has been successfully enabled on your Adaze account.
Your account is now more secure!

Make sure you saved your backup codes and have access to your authenticator app.
  `;

  return sendEmailNotification({ to: email, subject, html, text });
}

// Log notification to database (for tracking)
export async function logNotification(
  userId: string,
  type: string,
  channel: 'email' | 'sms',
  status: 'sent' | 'failed',
  metadata?: any
) {
  try {
    const supabase = createClient();
    
    // You could create a notifications_log table to track all notifications
    // For now, we'll just log to console
    console.log('Notification Log:', {
      userId,
      type,
      channel,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    });

    // TODO: Insert into notifications_log table
    // await supabase.from('notifications_log').insert({
    //   user_id: userId,
    //   type,
    //   channel,
    //   status,
    //   metadata,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to log notification:', error);
    return { success: false, error };
  }
}
