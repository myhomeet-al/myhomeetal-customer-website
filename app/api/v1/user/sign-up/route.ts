import bcrypt from 'bcryptjs';
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
          <h2>Welcome to Myhomeetal, ${firstname}!</h2>
          <p>Thank you for signing up. Please verify your email using the OTP below:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #ED2224; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>Myhomeetal Team</p>
        </div>
      `
    });

    if (response.error) {
      console.error('Error sending verification email:', response.error);
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    console.log(`Verification email sent to ${email}. Email ID: ${response.data?.id}`);
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
    const password = valueOrEmpty(body.password);
    const firstname = valueOrEmpty(body.firstname);
    const lastname = valueOrEmpty(body.lastname);
    const referralCode = valueOrEmpty(body.referralCode);

    if (!email || !password || !firstname || !lastname) {
      return Response.json(
        { error: 'email, password, firstname and lastname are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const otp = crypto.randomInt(10000, 100000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);
    const newReferralCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    let referredBy: string | null = null;
    let referrer: any = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referralCode;
      }
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, otp, firstname);
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError);
      return Response.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    const user = await User.create({
      email,
      firstname,
      lastname,
      password: hashedPassword,
      otp,
      otpExpiry,
      referralCode: newReferralCode,
      points: 100,
      referredBy,
      isVerified: false,
    });

    if (referrer) {
      referrer.referrals = referrer.referrals || [];
      referrer.referrals.push({
        user: user._id,
        status: 'signed_up',
      });
      await referrer.save();
    }

    return Response.json({
      message: `We sent an OTP to ${email}, please verify `,
      referralCode: newReferralCode,
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return Response.json({ error: error?.message || 'Sign up failed' }, { status: 500 });
  }
}
