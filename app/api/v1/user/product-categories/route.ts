import { connectToDb } from '@/app/lib/mongodb';
import ProductCategory from '@/app/models/ProductCategory';
import '@/app/models/ProductSubCategory';
import '@/app/models/Product';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectToDb();
    const productCategories = await ProductCategory.find()
      .populate('products', 'productTitle images price')
      .populate('subCategory', 'name subCategoryImage');

    return Response.json(productCategories);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch product categories' },
      { status: 500 }
    );
  }
}
