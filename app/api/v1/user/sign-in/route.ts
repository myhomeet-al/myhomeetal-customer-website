import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
    const password = valueOrEmpty(body.password);

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { error: 'Invalid email or password, please retry' },
        { status: 422 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, valueOrEmpty(user.password));
    if (!passwordMatch) {
      return Response.json(
        { error: 'invalid email or password, please retry' },
        { status: 422 }
      );
    }

    if (user.isVerified !== true) {
      return Response.json(
        { error: 'User email has not been verified' },
        { status: 422 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ error: 'JWT secret is missing' }, { status: 500 });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '6h' });
    const userProfile = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      phone_number: user.phone_number,
    };

    return Response.json({ token, userProfile });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Ooops!! an error occured, please refresh' },
      { status: 500 }
    );
  }
}
