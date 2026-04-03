import axios from 'axios';
import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Wallet from '@/app/models/Wallet';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const createWalletRoute = process.env.CREATE_WALLET_API;
    const apiKey = process.env.POOLER_APIKEY;
    if (!createWalletRoute || !apiKey) {
      return Response.json(
        { error: 'Wallet provider config missing' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      display_name,
      bvn,
      email,
      firstname,
      lastname,
      gender,
      currency,
      date_of_birth,
      mobile_number,
    } = body || {};

    const payload = {
      display_name,
      bvn,
      firstname,
      lastname,
      currency,
      email,
      gender,
      date_of_birth,
      mobile_number,
    };

    const response = await axios.post(createWalletRoute, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const account_no = response?.data?.data?.account_no;
    if (!account_no) {
      return Response.json(
        { error: response?.data?.data || 'Failed to create wallet' },
        { status: 500 }
      );
    }

    const wallet = new Wallet({ user: auth.user._id, account_no });
    const newWalletData = await wallet.save();

    return Response.json({ message: 'Wallet Created Successfully', newWalletData });
  } catch (error: any) {
    const providerMessage =
      error?.response?.data?.data || error?.response?.data || error?.message;
    return Response.json({ error: providerMessage }, { status: 500 });
  }
}

