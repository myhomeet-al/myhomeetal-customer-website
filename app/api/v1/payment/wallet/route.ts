import axios from 'axios';
import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import AdminTransaction from '@/app/models/AdminTransaction';
import AdminWallet from '@/app/models/AdminWallet';
import Inventory from '@/app/models/Inventory';
import Order from '@/app/models/Order';
import Payment from '@/app/models/Payment';
import Transaction from '@/app/models/Transaction';
import User from '@/app/models/User';
import Wallet from '@/app/models/Wallet';

export const runtime = 'nodejs';

async function handlePurchaseAndReferralReward(userId: any) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.hasMadePurchase) {
    user.hasMadePurchase = true;

    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const referralIndex = (referrer.referrals || []).findIndex(
          (ref: any) => ref.user.toString() === user._id.toString()
        );
        if (referralIndex !== -1) {
          // @ts-ignore mongoose mixed type
          referrer.referrals[referralIndex].status = 'purchased';
          referrer.points = (referrer.points || 0) + 400;
          await referrer.save();
        }
      }
    }

    await user.save();
  }
}

export async function POST(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json();
    const { orderId, narration, amount, from_account_number, points } = body || {};

    const apiKey = process.env.POOLER_APIKEY;
    const createWalletRoute = process.env.CREATE_WALLET_API;
    if (!apiKey || !createWalletRoute) {
      return Response.json(
        { error: 'Wallet provider config missing' },
        { status: 500 }
      );
    }

    const user = await User.findById(auth.user._id);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    const fetchAdminWallet = await AdminWallet.find();
    if (!fetchAdminWallet || fetchAdminWallet.length === 0) {
      return Response.json({ error: 'No admin account was found' }, { status: 404 });
    }
    const adminAccountNumber = fetchAdminWallet[0].account_no;

    const wallet = await Wallet.findOne({ user: auth.user._id });
    if (!wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const pts = Number(points || 0);
    if (pts > 0 && (user.points || 0) < pts) {
      return Response.json({ error: 'Insufficient points' }, { status: 400 });
    }

    const walletIntraTransferRoute = `${createWalletRoute}payments/intra`;
    const payload = {
      narration,
      reference: orderId,
      amount,
      from_account_number,
      to_account_number: adminAccountNumber,
      to_settlement: false,
    };

    const response = await axios.post(walletIntraTransferRoute, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response?.data?.status && response.data.status !== '01') {
      return Response.json(
        { error: response?.data?.message || 'Payment failed' },
        { status: 400 }
      );
    }

    if (pts > 0) {
      user.points = (user.points || 0) - pts;
      await user.save();
    }

    const payment = new Payment({
      userId: auth.user._id,
      orderId,
      amount,
      status: 'Success',
      method: 'Wallet',
    } as any);
    await payment.save();

    const transaction = new Transaction({
      wallet: wallet._id,
      amount: -Number(amount),
      type: 'Purchase',
      order: orderId,
    });
    await transaction.save();

    wallet.transactions = wallet.transactions || [];
    wallet.transactions.push(transaction._id as any);
    await wallet.save();

    const adminTransaction = new AdminTransaction({
      amount: parseFloat(String(amount)),
      type: 'Wallet payment',
      actor: `${user.firstname || ''}${user.lastname ? ` ${user.lastname}` : ''}`.trim(),
    });
    await adminTransaction.save();

    const fetchedAdminWallet = fetchAdminWallet[0];
    fetchedAdminWallet.transactions = fetchedAdminWallet.transactions || [];
    fetchedAdminWallet.transactions.push(adminTransaction._id as any);
    await fetchedAdminWallet.save();

    const order = await Order.findOne({ orderId });
    if (order) {
      order.status = 'Ongoing';
      await order.save();

      for (const item of order.orderItems || []) {
        await Inventory.findOneAndUpdate(
          // @ts-ignore
          { $or: [{ product: item.product }, { _id: item.product }] },
          { $inc: { quantity: -item.qty } }
        );
      }
    }

    user.cart = [];
    await user.save();

    await handlePurchaseAndReferralReward(auth.user._id);
    return Response.json({ message: 'Payment successful', payment });
  } catch (error: any) {
    return Response.json(
      { error: error?.response?.data || error?.message || 'Payment failed' },
      { status: 500 }
    );
  }
}

