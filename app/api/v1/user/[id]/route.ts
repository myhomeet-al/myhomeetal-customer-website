import { requireUserAuth } from '@/app/lib/userAuth';

export const runtime = 'nodejs';

/**
 * Legacy route is GET /user/:id but the controller ignores :id and returns the
 * authenticated user's profile. Same behavior here.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserAuth(request);
  if (auth.ok === false) return auth.response;

  try {
    const profile = auth.user;
    if (!profile) {
      return Response.json({ error: 'Not Found' }, { status: 404 });
    }
    return Response.json(profile);
  } catch (error: any) {
    return Response.json(
      { error: 'Ooops!! an error occured, please refresh' },
      { status: 500 }
    );
  }
}
