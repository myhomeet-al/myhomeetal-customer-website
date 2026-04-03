import { requireUserAuth } from '@/app/lib/userAuth';
import Product from '@/app/models/Product';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const { id: productId } = await params;
    const product = await Product.findById(productId);
    if (!product) {
      return Response.json({ error: 'Product Not found' }, { status: 404 });
    }

    const user = auth.user;
    if (!user.savedItems) user.savedItems = [];
    if (!user.savedItems.some((id: any) => id.toString() === productId)) {
      user.savedItems.push(product._id);
      await user.save();
    }

    return Response.json({
      message: 'Product added to savedItems',
      savedItems: user.savedItems,
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Failed to save item' }, { status: 500 });
  }
}
