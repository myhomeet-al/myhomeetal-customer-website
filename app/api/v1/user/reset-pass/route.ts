import bcrypt from 'bcryptjs';
import { connectToDb } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export const runtime = 'nodejs';

function valueOrEmpty(value: unknown): string {
  return value ? String(value) : '';
}

export async function POST(request: Request) {
  try {
    await connectToDb();
    const body = await request.json();
    const email = valueOrEmpty(body.email).toLowerCase().trim();
    const otp = Number(body.otp);
    const password = valueOrEmpty(body.password);

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (Number(user.otp) !== otp) {
      return Response.json({ error: 'Invalid OTP' }, { status: 400 });
    }
    if (!user.otpExpiry || Date.now() > new Date(user.otpExpiry).getTime()) {
      return Response.json({ error: 'OTP expired' }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 12);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return Response.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Reset password failed' }, { status: 500 });
  }
}
