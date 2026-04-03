import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
  paymentId?: string;
  userId: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  method: 'Wallet' | 'Online';
  date: Date;
}

const PaymentSchema = new Schema<IPayment>({
  paymentId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Success', 'Failed', 'Pending'] },
  method: { type: String, enum: ['Wallet', 'Online'], required: true },
  date: { type: Date, required: true, default: Date.now() },
});

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

