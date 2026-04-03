import axios from 'axios';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, email } = body || {};

    const baseUrl = process.env.REXPAY_TEST_API_URL;
    const username = process.env.REXPAY_USERNAME;
    const password = process.env.REXPAY_PASSWORD;
    if (!baseUrl || !username || !password) {
      return Response.json(
        { error: 'RexPay config missing' },
        { status: 500 }
      );
    }

    const url = `${baseUrl}/api/pgs/payment/v2/createPayment`;
    const authString = Buffer.from(`${username}:${password}`).toString('base64');

    const paymentDetails = {
      reference: orderId,
      amount,
      currency: 'NGN',
      userId: email,
      callbackUrl: `https://www.myhomeetal.com/order-confirmed?id=${orderId}-${amount}`,
    };

    const response = await axios.post(url, paymentDetails, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`,
      },
    });

    return Response.json(response.data);
  } catch (error: any) {
    return Response.json(
      { error: error?.response?.data || error?.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

