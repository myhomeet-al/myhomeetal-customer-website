import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductCategory extends Document {
  name: string;
  products: mongoose.Types.ObjectId[];
  subCategory: mongoose.Types.ObjectId[];
  product_category_image?: string;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

const ProductCategorySchema = new Schema<IProductCategory>({
  name: { type: String, required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  subCategory: [{ type: Schema.Types.ObjectId, ref: 'ProductSubCategory' }],
  product_category_image: { type: String },
  createdBy: { type: String },
  createdOn: { type: String },
  updatedBy: { type: String },
  updatedOn: { type: String },
});

const ProductCategory: Model<IProductCategory> =
  mongoose.models.ProductCategory ||
  mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema);

export default ProductCategory;
