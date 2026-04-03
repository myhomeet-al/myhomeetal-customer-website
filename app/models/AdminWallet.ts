import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdminWallet extends Document {
  admin: mongoose.Types.ObjectId;
  account_no: string;
  transactions: mongoose.Types.ObjectId[];
}

const AdminWalletSchema = new Schema<IAdminWallet>({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  account_no: { type: String, required: true },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'AdminTransaction' }],
});

const AdminWallet: Model<IAdminWallet> =
  mongoose.models.AdminWallet ||
  mongoose.model<IAdminWallet>('AdminWallet', AdminWalletSchema);

export default AdminWallet;

