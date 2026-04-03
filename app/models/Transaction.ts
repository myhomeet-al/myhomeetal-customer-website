import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  amount: number;
  type: 'Deposit' | 'Purchase';
  order?: string;
  date: Date;
  description?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Deposit', 'Purchase'], required: true },
  order: { type: String },
  date: { type: Date, default: Date.now() },
  description: { type: String },
});

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

