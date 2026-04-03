import crypto from 'crypto';
import { connectToDb } from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { Resend } from 'resend';

export const runtime = 'nodejs';

function valueOrEmpty(value: unknown): string {
  return value ? String(value) : '';
}

async function sendVerificationEmail(email: string, otp: number, firstname: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const response = await resend.emails.send({
      from: 'My home et al <verify@myhomeetal.com>',
      to: email,
      subject: 'Verify Your Email - Myhomeetal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${firstname},</h2>
          <p>We're resending your verification OTP:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #ED2224; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>Best regards,<br>Myhomeetal Team</p>
        </div>
      `
    });

    if (response.error) {
      console.error('Error sending verification email:', response.error);
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    console.log(`Verification email resent to ${email}. Email ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    await connectToDb();
    const body = await request.json();
    const email = valueOrEmpty(body.email).toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return Response.json({ error: 'User does not exist' }, { status: 404 });
    }

    const otp = crypto.randomInt(10000, 100000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Send verification email
    try {
      await sendVerificationEmail(email, otp, existingUser.firstname || 'User');
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError);
      return Response.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();

    return Response.json({ message: `We sent an OTP to ${email}, please verify ` });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return Response.json({ error: error?.message || 'Failed to resend OTP' }, { status: 500 });
  }
}
