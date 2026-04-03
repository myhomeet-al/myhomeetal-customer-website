import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Order from '@/app/models/Order';
import User from '@/app/models/User';

export const runtime = 'nodejs';

function generateOrderId(): string {
  return Math.floor(Math.random() * 10 ** 13)
    .toString()
    .padStart(13, '0');
}

export async function POST(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json();
    const { address, orderPrice, orderItems, deliveryMethod, paymentMethod } =
      body || {};

    const userId = auth.user._id;
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const newOrder = new Order({
      orderId,
      user: userId,
      address,
      orderPrice,
      orderItems,
      deliveryMethod,
      paymentMethod,
    });

    await newOrder.save();

    // Update user's purchase history
    await User.findByIdAndUpdate(userId, { $push: { purchaseHistory: newOrder._id } });

    return Response.json({ message: 'Order Created Successfully', newOrder });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

