import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Order from '@/app/models/Order';
import '@/app/models/Product';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const userId = auth.user._id;

    const orders = await Order.find({ user: userId }).populate(
      'orderItems.product',
      'productTitle images'
    );

    return Response.json(orders);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch purchase history' },
      { status: 500 }
    );
  }
}

