import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInventory extends Document {
  product?: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  createdOn?: string;
  createdBy?: string;
  updatedOn?: string;
  updatedBy?: string;
}

const InventorySchema = new Schema<IInventory>({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 0, min: 0 },
  createdOn: { type: String },
  createdBy: { type: String },
  updatedOn: { type: String },
  updatedBy: { type: String },
});

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
