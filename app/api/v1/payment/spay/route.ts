import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Inventory from '@/app/models/Inventory';
import Order from '@/app/models/Order';
import User from '@/app/models/User';

export const runtime = 'nodejs';

async function handlePurchaseAndReferralReward(userId: any) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.hasMadePurchase) {
    user.hasMadePurchase = true;

    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const referralIndex = (referrer.referrals || []).findIndex(
          (ref: any) => ref.user.toString() === user._id.toString()
        );
        if (referralIndex !== -1) {
          // @ts-ignore mongoose mixed type
          referrer.referrals[referralIndex].status = 'purchased';
          referrer.points = (referrer.points || 0) + 400;
          await referrer.save();
        }
      }
    }

    await user.save();
  }
}

export async function PUT(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json();
    const { orderId, points } = body || {};

    const user = await User.findById(auth.user._id);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    const pts = Number(points || 0);
    if (pts > 0) {
      if ((user.points || 0) < pts) {
        return Response.json({ error: 'Insufficient points' }, { status: 400 });
      }
      user.points = (user.points || 0) - pts;
      await user.save();
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = 'Ongoing';
    await order.save();

    for (const item of order.orderItems || []) {
      await Inventory.findOneAndUpdate(
        // Inventory schema differs across environments; try both selectors.
        // @ts-ignore
        { $or: [{ product: item.product }, { _id: item.product }] },
        { $inc: { quantity: -item.qty } }
      );
    }

    user.cart = [];
    await user.save();

    await handlePurchaseAndReferralReward(auth.user._id);
    return Response.json({ message: 'Payment Confirmed as successful', order });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

