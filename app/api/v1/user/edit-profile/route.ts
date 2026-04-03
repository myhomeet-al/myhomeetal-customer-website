import { requireUserAuth } from '@/app/lib/userAuth';
import User from '@/app/models/User';

export const runtime = 'nodejs';

export async function PUT(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json();
    const firstname =
      body.firstname ??
      body.firstName ??
      body.first_name;
    const lastname =
      body.lastname ?? body.lastName ?? body.last_name;
    const { email, phone_number } = body;

    const updatedProfile = await User.findByIdAndUpdate(
      auth.user._id,
      {
        ...(firstname !== undefined && { firstname }),
        ...(lastname !== undefined && { lastname }),
        ...(email !== undefined && { email }),
        ...(phone_number !== undefined && { phone_number }),
      },
      { new: true }
    );

    if (!updatedProfile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Match legacy typo: "mesage"
    return Response.json({
      mesage: 'Your Profile has been sucessfully updated',
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
