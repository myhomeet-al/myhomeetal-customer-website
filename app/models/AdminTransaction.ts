import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdminTransaction extends Document {
  amount: number;
  type: 'Wallet payment' | 'Withdrawal';
  actor: string;
  date: Date;
}

const AdminTransactionSchema = new Schema<IAdminTransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Wallet payment', 'Withdrawal'], required: true },
  actor: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});

const AdminTransaction: Model<IAdminTransaction> =
  mongoose.models.AdminTransaction ||
  mongoose.model<IAdminTransaction>('AdminTransaction', AdminTransactionSchema);

export default AdminTransaction;

