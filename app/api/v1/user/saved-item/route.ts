import { requireUserAuth } from '@/app/lib/userAuth';

export const runtime = 'nodejs';

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
    user.savedItems = (user.savedItems || []).filter(
      (item: any) => item.toString() !== productId
    );
    await user.save();

    return Response.json({
      message: 'Product removed from savedItems',
      savedItems: user.savedItems,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to remove saved item' },
      { status: 500 }
    );
  }
}
