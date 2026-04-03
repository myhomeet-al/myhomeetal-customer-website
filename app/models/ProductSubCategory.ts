import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductSubCategory extends Document {
  name: string;
  products: mongoose.Types.ObjectId[];
  category?: mongoose.Types.ObjectId;
  subCategoryImage?: string;
  createdBy?: string;
  updatedBy?: string;
  createdOn?: string;
  updatedOn?: string;
}

const ProductSubCategorySchema = new Schema<IProductSubCategory>({
  name: { type: String, required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  category: { type: Schema.Types.ObjectId, ref: 'ProductCategory' },
  subCategoryImage: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  createdOn: { type: String },
  updatedOn: { type: String },
});

const ProductSubCategory: Model<IProductSubCategory> =
  mongoose.models.ProductSubCategory ||
  mongoose.model<IProductSubCategory>('ProductSubCategory', ProductSubCategorySchema);

export default ProductSubCategory;
