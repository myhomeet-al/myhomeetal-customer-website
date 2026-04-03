import { requireUserAuth } from '@/app/lib/userAuth';
import User from '@/app/models/User';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const user = await User.findById(auth.user._id).populate(
      'referrals.user',
      'firstname lastname'
    );

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const rawRefs = user.referrals || [];
    const referrals = rawRefs.map((ref: any) => {
      const referred = ref.user;
      return {
        id: referred?._id,
        firstname: referred?.firstname,
        lastname: referred?.lastname,
        status: ref.status,
        pointsContributed: ref.status === 'purchased' ? 400 : 0,
      };
    });

    const totalEarnings = user.points;

    return Response.json({
      success: true,
      data: {
        referrals,
        totalEarnings,
        totalReferrals: referrals.length,
      },
      message: 'Referrals retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting user referrals:', error);
    return Response.json(
      { error: 'An error occurred while retrieving referrals' },
      { status: 500 }
    );
  }
}
