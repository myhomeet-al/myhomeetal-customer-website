import { connectToDb } from '@/app/lib/mongodb';
import Product from '@/app/models/Product';
import '@/app/models/ProductCategory';
import '@/app/models/ProductSubCategory';
import '@/app/models/Review';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Product Category API] Fetching products for category: ${id}`);
    await connectToDb();
    const products = await Product.find({ category: id })
      .populate('category', 'name')
      .populate('review', 'rating')
      .populate('subCategory', 'name subCategoryImage');

    console.log(`[Product Category API] Found ${products.length} products for category ${id}`);
    return Response.json(products.reverse());
  } catch (error: any) {
    console.error(`[Product Category API] Error fetching products for category:`, error);
    return Response.json(
      { error: error?.message || 'Failed to fetch products by category', details: error?.toString() },
      { status: 500 }
    );
  }
}
