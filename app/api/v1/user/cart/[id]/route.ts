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
    if (!user.cart) user.cart = [];

    const cartItem = user.cart.find(
      (item: any) => item.product.toString() === productId
    );
    if (cartItem) {
      cartItem.qty += 1;
    } else {
      user.cart.push({ product: product._id, qty: 1 });
    }
    await user.save();

    return Response.json({ message: 'Product added to cart', cart: user.cart });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Failed to add to cart' }, { status: 500 });
  }
}
