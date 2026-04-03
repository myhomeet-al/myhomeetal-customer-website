import bcrypt from 'bcryptjs';
import { requireUserAuth } from '@/app/lib/userAuth';
import User from '@/app/models/User';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const password = body?.password;

    const profile = await User.findById(auth.user._id);
    if (!profile) {
      return Response.json({ error: 'Not Found' }, { status: 404 });
    }

    if (!profile.password) {
      return Response.json(
        { error: 'Account has no password set; cannot verify deletion' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Invalid password' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return Response.json({ error: 'Invalid password' }, { status: 400 });
    }

    await User.findByIdAndDelete(auth.user._id);
    return Response.json({ message: 'Account Deleted Successfully' });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
