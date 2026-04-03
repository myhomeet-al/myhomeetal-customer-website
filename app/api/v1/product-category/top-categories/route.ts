import { connectToDb } from '@/app/lib/mongodb';
import ProductCategory from '@/app/models/ProductCategory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDb();
    const topCategories = await ProductCategory.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          product_category_image: { $first: '$product_category_image' },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
    ]);

    return Response.json(topCategories);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch top categories' },
      { status: 500 }
    );
  }
}
