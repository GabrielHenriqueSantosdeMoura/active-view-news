// =============================================
// Database Types - Matches Supabase tables
// =============================================

// Users table
export interface DbUser {
  id: string;
  news_api: string;
  created_at?: string;
}

// Preferred topics table
export interface DbPreferredTopics {
  id: string;
  topics: string[];
}

// Saved articles table (id, articles array, collection_name)
export interface DbSavedArticles {
  id: string;
  articles: string[]; // JSON strings of SavedArticleData
  collection_name: string;
}

// Articles seen table
export interface DbArticlesSeen {
  id: string;
  articles: string[];
  clicks: number;
}

// =============================================
// Application Types
// =============================================

// User data returned to the client
export interface UserData {
  id: string;
  newsApiKey: string;
  preferredTopics: string[];
  articlesSeen: string[];
  totalClicks: number;
}

// Article data stored in the articles array (as JSON)
export interface SavedArticleData {
  url: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  source: string;
  publishedAt: string;
  savedAt: string;
}

// Collection with its articles
export interface CollectionData {
  collectionName: string;
  articles: SavedArticleData[];
}

// User stats
export interface UserStats {
  totalSaved: number;
  totalCollections: number;
  totalClicks: number;
  articlesSeenCount: number;
}
