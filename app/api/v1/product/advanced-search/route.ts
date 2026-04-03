import { connectToDb } from '@/app/lib/mongodb';
import Product from '@/app/models/Product';
import '@/app/models/ProductCategory';
import '@/app/models/Inventory';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await connectToDb();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const regexPatterns = queryWords.map((word) => new RegExp(word, 'i'));

    const products = await Product.find({
      $and: regexPatterns.map((pattern) => ({
        $or: [{ productTitle: pattern }, { description: pattern }, { brand: pattern }],
      })),
    })
      .populate('category', 'name')
      .populate('inventory', 'quantity')
      .limit(100);

    if (products.length === 0) {
      return Response.json(
        { message: 'No products found matching the search query' },
        { status: 404 }
      );
    }

    const sortedProducts = products.sort((a: any, b: any) => {
      const score = (p: any) =>
        queryWords.reduce((acc, word) => {
          const pattern = new RegExp(word, 'i');
          const categoryName = p?.category?.name || '';
          return (
            acc +
            (pattern.test(p.productTitle) ? 3 : 0) +
            (pattern.test(p.brand) ? 2 : 0) +
            (pattern.test(p.description) ? 1 : 0) +
            (pattern.test(categoryName) ? 2 : 0)
          );
        }, 0);
      return score(b) - score(a);
    });

    return Response.json(sortedProducts);
  } catch (error: any) {
    return Response.json(
      { error: 'An error occurred while searching for products' },
      { status: 500 }
    );
  }
}
