import { NewsAPIResponse } from './types';

const NEWS_API_BASE = 'https://newsapi.org/v2';

export interface SearchParams {
  query: string;
  apiKey: string;
  pageSize?: number;
  page?: number;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

export async function searchNews({
  query,
  apiKey,
  pageSize = 20,
  page = 1,
  sortBy = 'publishedAt',
}: SearchParams): Promise<NewsAPIResponse> {
  const params = new URLSearchParams({
    q: query,
    apiKey,
    pageSize: pageSize.toString(),
    page: page.toString(),
    sortBy,
    language: 'en',
  });

  try {
    const response = await fetch(`${NEWS_API_BASE}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch news');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export async function getTopHeadlines({
  apiKey,
  category,
  pageSize = 20,
}: {
  apiKey: string;
  category?: string;
  pageSize?: number;
}): Promise<NewsAPIResponse> {
  const params = new URLSearchParams({
    apiKey,
    pageSize: pageSize.toString(),
    country: 'us',
  });

  if (category) {
    params.append('category', category);
  }

  try {
    const response = await fetch(`${NEWS_API_BASE}/top-headlines?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch headlines');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Validate API key by making a small request
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      apiKey,
      q: 'test',
      pageSize: '1',
    });

    const response = await fetch(`${NEWS_API_BASE}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    return data.status === 'ok';
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

