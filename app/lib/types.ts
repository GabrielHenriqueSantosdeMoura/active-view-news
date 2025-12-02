// News API Types
export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: NewsArticle[];
  code?: string;
  message?: string;
}

// User preferences
export interface UserPreferences {
  apiKey: string;
  favoriteTopics: string[];
  onboardingComplete: boolean;
  isAdmin?: boolean;
}

// Default topics
export const DEFAULT_TOPICS = [
  'Technology',
  'Crypto',
  'NFT',
  'AI',
  'Business',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
  'Politics',
];

// Admin API key
export const ADMIN_API_KEY = 'admin_api_key';

// Collection type for saved articles
export interface Collection {
  id: string;
  name: string;
  articles: NewsArticle[];
  createdAt: string;
}

// Storage keys
export const STORAGE_KEYS = {
  PREFERENCES: 'activeview_news_preferences',
  COLLECTIONS: 'activeview_news_collections',
  USER_ID: 'activeview_user_id',
  ADMIN_KEY: 'activeview_admin_key',
} as const;
