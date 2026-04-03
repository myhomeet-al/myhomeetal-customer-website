import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  qty: number;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  date: Date;
  status: 'Not paid' | 'Ongoing' | 'Delivered';
  address: mongoose.Types.ObjectId;
  orderPrice: number;
  orderItems: IOrderItem[];
  deliveryMethod: 'Door delivery' | 'Pickup delivery';
  paymentMethod: 'Wallet' | 'Online';
}

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now(), required: true },
  status: {
    type: String,
    enum: ['Not paid', 'Ongoing', 'Delivered'],
    default: 'Not paid',
  },
  address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  orderPrice: { type: Number, required: true },
  orderItems: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  deliveryMethod: {
    type: String,
    enum: ['Door delivery', 'Pickup delivery'],
    required: true,
  },
  paymentMethod: { type: String, enum: ['Wallet', 'Online'], required: true },
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

