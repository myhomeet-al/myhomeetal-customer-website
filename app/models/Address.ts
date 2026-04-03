import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  deliveryAddress: string;
  phone_number: string;
  city: string;
}

const AddressSchema = new Schema<IAddress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryAddress: { type: String, required: true },
  phone_number: { type: String, required: true },
  city: { type: String, required: true },
});

const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

export default Address;

