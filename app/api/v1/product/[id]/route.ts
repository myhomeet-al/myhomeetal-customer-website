import { connectToDb } from '@/app/lib/mongodb';
import Product from '@/app/models/Product';
import '@/app/models/ProductCategory';
import '@/app/models/ProductSubCategory';
import '@/app/models/Inventory';
import '@/app/models/Review';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('review', 'rating comment date')
      .populate('inventory', 'quantity createdBy createdOn')
      .populate('subCategory', 'name');

    if (!product) {
      return Response.json({ message: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch product detail' },
      { status: 500 }
    );
  }
}
