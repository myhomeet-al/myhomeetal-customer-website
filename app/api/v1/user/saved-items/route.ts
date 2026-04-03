import { requireUserAuth } from '@/app/lib/userAuth';
import '@/app/models/Product';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const user = await auth.user.populate(
      'savedItems',
      'productTitle price images brand'
    );
    return Response.json({ savedItems: user.savedItems || [] });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch saved items' },
      { status: 500 }
    );
  }
}
