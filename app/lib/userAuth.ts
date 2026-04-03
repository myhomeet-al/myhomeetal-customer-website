import jwt from 'jsonwebtoken';
import { connectToDb } from '@/app/lib/mongodb';
import User from '@/app/models/User';

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function requireUserAuth(request: Request): Promise<
  | { ok: true; user: any }
  | { ok: false; response: Response }
> {
  const token = extractBearerToken(request);
  if (!token) {
    return {
      ok: false as const,
      response: Response.json(
        { error: 'Authorization Header is Missing' },
        { status: 401 }
      ),
    };
  }

  const jwtSecret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!jwtSecret) {
    return {
      ok: false as const,
      response: Response.json({ error: 'JWT secret is missing' }, { status: 500 }),
    };
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as { id: string };
    await connectToDb();
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return {
        ok: false as const,
        response: Response.json({ error: 'User not found' }, { status: 401 }),
      };
    }
    return { ok: true as const, user };
  } catch (error: any) {
    return {
      ok: false as const,
      response: Response.json({ error: error?.message || 'Unauthorized' }, { status: 401 }),
    };
  }
}
