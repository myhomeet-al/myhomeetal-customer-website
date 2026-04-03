import { connectToDb } from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import '@/app/models/Product';
import '@/app/models/Address';
import '@/app/models/User';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();
    const order = await Order.findById(id)
      .populate('user', 'firstname lastname email phone_number')
      .populate('orderItems.product', 'productTitle images')
      .populate('address', 'deliveryAddress city phone_number');

    if (!order) {
      return Response.json({ error: 'Order Not found' }, { status: 404 });
    }

    const orderItemsWithTitles = (order.orderItems || []).map((item: any) => ({
      ...item.toObject(),
      productTitle: item.product ? item.product.productTitle : null,
    }));

    return Response.json({
      ...order.toObject(),
      orderItems: orderItemsWithTitles,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

