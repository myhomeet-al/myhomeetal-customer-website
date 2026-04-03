import { connectToDb } from '@/app/lib/mongodb';
import { requireUserAuth } from '@/app/lib/userAuth';
import Address from '@/app/models/Address';
import User from '@/app/models/User';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const addresses = await Address.find({ user: auth.user._id });
    return Response.json(addresses);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json();
    const { deliveryAddress, phone_number, city } = body || {};

    const address = new Address({
      user: auth.user._id,
      deliveryAddress,
      phone_number,
      city,
    });
    await address.save();

    await User.findByIdAndUpdate(auth.user._id, { $push: { addressBook: address._id } });

    return Response.json({ message: 'Address Created successfully', address });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to create address' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json();
    const { addressId, deliveryAddress, phone_number, city } = body || {};

    const user = await User.findById(auth.user._id);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    const address = await Address.findByIdAndUpdate(
      addressId,
      { deliveryAddress, phone_number, city },
      { new: true }
    );
    if (!address) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    return Response.json(address);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to update address' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    await connectToDb();
    const body = await request.json().catch(() => ({}));
    const { addressId } = body || {};

    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return Response.json({ error: 'Addres not found' }, { status: 404 });
    }

    return Response.json({ message: 'Address deleted successfully' });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}

