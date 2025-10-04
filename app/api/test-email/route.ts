// Test endpoint to verify email sending works

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      );
    }

    // Send test email
    const result = await sendEmailNotification({
      to: email,
      subject: '🎉 Test Email from Adaze',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">✅ Email System Working!</h2>
          <p>Hi there,</p>
          <p>This is a test email from your Adaze marketplace.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>✅ Email service is configured correctly!</strong></p>
            <p>You can now receive:</p>
            <ul>
              <li>Login notifications</li>
              <li>Security alerts</li>
              <li>2FA confirmations</li>
              <li>Account updates</li>
            </ul>
          </div>
          <p>If you received this email, your notification system is working perfectly! 🎉</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This is a test email from Adaze Marketplace.
          </p>
        </div>
      `,
      text: `
Email System Working!

This is a test email from your Adaze marketplace.

✅ Email service is configured correctly!

You can now receive:
- Login notifications
- Security alerts
- 2FA confirmations
- Account updates

If you received this email, your notification system is working perfectly!
      `,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: result.data?.id,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
