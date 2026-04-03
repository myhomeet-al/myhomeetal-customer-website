import { connectToDb } from '@/app/lib/mongodb';
import Suggestion from '@/app/models/Suggestion';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await connectToDb();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return Response.json({ message: 'Query parameter is required.' }, { status: 400 });
    }

    const suggestions = await Suggestion.find({
      $or: [
        { suggestionText: { $regex: `^${query}`, $options: 'i' } },
        { keywords: { $regex: `^${query}`, $options: 'i' } },
      ],
    })
      .sort({ type: 1, popularityScore: -1 })
      .limit(8);

    return Response.json(suggestions);
  } catch (error: any) {
    return Response.json(
      { message: 'Failed to fetch suggestions.', error: error?.message },
      { status: 500 }
    );
  }
}

