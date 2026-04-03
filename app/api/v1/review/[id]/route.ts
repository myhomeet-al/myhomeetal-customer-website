import { connectToDb } from '@/app/lib/mongodb';
import Review from '@/app/models/Review';
import '@/app/models/User';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();
    const review = await Review.find({ product: id }).populate(
      'user',
      'firstname'
    );

    return Response.json(review);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
