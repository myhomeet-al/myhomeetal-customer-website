import axios from 'axios';
import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Wallet from '@/app/models/Wallet';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const apiKey = process.env.POOLER_APIKEY;
    if (!apiKey) {
      return Response.json({ error: 'Wallet provider config missing' }, { status: 500 });
    }

    const wallet = await Wallet.findOne({ user: auth.user._id });
    if (!wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const { account_no } = wallet;
    const GETWALLETROUTE = 'https://api.poolerapp.com/api/v1/wallet/';
    const getWallet = await axios.get(`${GETWALLETROUTE}${account_no}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const walletDeets = getWallet?.data?.data;
    return Response.json({ wallet_details: walletDeets });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Error retrieving wallet details' },
      { status: 500 }
    );
  }
}

