import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  account_no: string;
  transactions: mongoose.Types.ObjectId[];
}

const WalletSchema = new Schema<IWallet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  account_no: { type: String, required: true },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
});

const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;

