import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Wallet from '@/app/models/Wallet';
import '@/app/models/Transaction';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const wallet = await Wallet.findOne({ user: auth.user._id }).populate(
      'transactions',
      'amount type date order'
    );
    if (!wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 500 });
    }
    return Response.json(wallet.transactions);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch wallet transactions' },
      { status: 500 }
    );
  }
}

