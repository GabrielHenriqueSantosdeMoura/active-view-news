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
}

// Collections
export interface Collection {
  id: string;
  name: string;
  description?: string;
  articles: NewsArticle[];
  createdAt: string;
  updatedAt: string;
}

// App State
export interface AppState {
  preferences: UserPreferences;
  collections: Collection[];
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

// Storage keys
export const STORAGE_KEYS = {
  PREFERENCES: 'activeview_news_preferences',
  COLLECTIONS: 'activeview_news_collections',
} as const;

