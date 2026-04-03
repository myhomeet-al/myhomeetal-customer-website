import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  phone_number?: string;
  otp?: number | null;
  otpExpiry?: Date | null;
  isVerified?: boolean;
  points?: number;
  referralCode?: string;
  referredBy?: string | null;
  hasMadePurchase?: boolean;
  referrals?: {
    user: mongoose.Types.ObjectId;
    status: 'signed_up' | 'purchased';
  }[];
  savedItems?: mongoose.Types.ObjectId[];
  cart?: { product: mongoose.Types.ObjectId; qty: number }[];
  addressBook?: mongoose.Types.ObjectId[];
  purchaseHistory?: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  phone_number: { type: String },
  otp: { type: Number, required: false },
  otpExpiry: { type: Date, required: false },
  isVerified: { type: Boolean, default: false },
  points: { type: Number, default: 100 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  hasMadePurchase: { type: Boolean, default: false },
  referrals: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['signed_up', 'purchased'],
        default: 'signed_up',
      },
    },
  ],
  savedItems: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, default: 1 },
    },
  ],
  addressBook: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
