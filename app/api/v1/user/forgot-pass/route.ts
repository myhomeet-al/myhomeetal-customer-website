import crypto from 'crypto';
import { connectToDb } from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { Resend } from 'resend';

export const runtime = 'nodejs';

function valueOrEmpty(value: unknown): string {
  return value ? String(value) : '';
}

async function sendPasswordResetEmail(email: string, otp: number, firstname: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const response = await resend.emails.send({
      from: 'My home et al <verify@myhomeetal.com>',
      to: email,
      subject: 'Password Reset OTP - Myhomeetal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${firstname || 'User'},</h2>
          <p>We received a request to reset your password. Use the OTP below to proceed:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #ED2224; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>Myhomeetal Team</p>
        </div>
      `
    });

    if (response.error) {
      console.error('Error sending password reset email:', response.error);
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    console.log(`Password reset OTP sent to ${email}. Email ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    await connectToDb();
    const body = await request.json();
    const email = valueOrEmpty(body.email).toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'User does not exist' }, { status: 404 });
    }

    const otp = crypto.randomInt(10000, 100000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Send email
    try {
      await sendPasswordResetEmail(email, otp, user.firstname || 'User');
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError);
      return Response.json({ 
        error: 'Failed to send verification code. Please try again later.' 
      }, { status: 500 });
    }

    // Save OTP only after email is sent successfully
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    return Response.json({ message: `An OTP has been sent to ${email}` });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return Response.json({ error: error?.message || 'Forgot password failed' }, { status: 500 });
  }
}
