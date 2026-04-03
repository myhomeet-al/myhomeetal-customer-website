import { requireUserAuth } from '@/app/lib/userAuth';
import '@/app/models/Product';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const user = await auth.user.populate(
      'cart.product',
      'productTitle price images brand'
    );
    return Response.json({ cart: user.cart || [] });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json();
    const productId = body?.productId as string;
    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    const user = auth.user;
    const cartItem = user.cart?.find(
      (item: any) => item.product.toString() === productId
    );
    if (cartItem) {
      cartItem.qty -= 1;
      if (cartItem.qty <= 0) {
        user.cart = user.cart!.filter(
          (item: any) => item.product.toString() !== productId
        );
      }
      await user.save();
      return Response.json({ message: 'Product quantity updated', cart: user.cart });
    }
    return Response.json({ error: 'Product not found in cart' }, { status: 404 });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json();
    const productId = body?.productId as string;
    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    const user = auth.user;
    user.cart = (user.cart || []).filter(
      (item: any) => item.product.toString() !== productId
    );
    await user.save();

    return Response.json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
