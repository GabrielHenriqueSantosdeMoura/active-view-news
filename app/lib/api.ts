import { NewsAPIResponse } from './types';

// Search params for server-side search (using userId)
export interface SearchParamsWithUserId {
  query: string;
  userId: string;
  pageSize?: number;
  page?: number;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

// Search news using the API route (server-side)
// This fetches the user's API key from the database on the server
export async function searchNews({
  query,
  userId,
  pageSize = 20,
  page = 1,
  sortBy = 'publishedAt',
}: SearchParamsWithUserId): Promise<NewsAPIResponse> {
  const params = new URLSearchParams({
    userId,
    q: query,
    pageSize: pageSize.toString(),
    page: page.toString(),
    sortBy,
  });

  try {
    const response = await fetch(`/api/news?${params}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch news');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Validate API key using the API route (server-side validation)
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });
    
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
