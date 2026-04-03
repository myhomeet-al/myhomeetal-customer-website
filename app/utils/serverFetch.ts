/**
 * Server-side fetch helper that constructs absolute URLs
 * Used in Server Components to ensure proper URL resolution
 */

function getBaseUrl(): string {
  const protocol = process.env.NODE_ENV === 'production' 
    ? 'https' 
    : 'http';
  
  const host = process.env.NEXT_PUBLIC_API_URL 
    || process.env.VERCEL_URL 
    || process.env.NEXT_PUBLIC_BASE_URL
    || 'localhost:3000';
  
  return `${protocol}://${host}`;
}

interface FetchOptions extends RequestInit {
  next?: NextFetchRequestConfig;
}

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

/**
 * Server-side fetch wrapper that ensures absolute URLs
 * @param endpoint - API endpoint (e.g., '/api/v1/product-category/categories')
 * @param options - Fetch options including next.js specific config
 * @returns Promise with response
 */
export async function serverFetch(
  endpoint: string,
  options?: FetchOptions
): Promise<Response> {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct absolute URL
  const baseUrl = getBaseUrl();
  const absoluteUrl = `${baseUrl}${normalizedEndpoint}`;

  try {
    const response = await fetch(absoluteUrl, {
      ...options,
    });
    
    return response;
  } catch (error) {
    console.error(`Server fetch failed for ${absoluteUrl}:`, error);
    throw error;
  }
}

export { getBaseUrl };
