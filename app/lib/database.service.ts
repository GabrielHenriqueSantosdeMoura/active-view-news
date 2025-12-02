import { CollectionData, SavedArticleData, UserData } from './database.types';
import { NewsArticle } from './types';

// =============================================
// USER OPERATIONS
// =============================================

export async function createOrLoginUser(newsApiKey: string): Promise<{ userId: string | null; isNewUser: boolean }> {
  try {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsApiKey }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error creating/logging in user:', data.error);
      return { userId: null, isNewUser: false };
    }

    return { 
      userId: data.userId, 
      isNewUser: data.isNewUser ?? true 
    };
  } catch (error) {
    console.error('Error creating/logging in user:', error);
    return { userId: null, isNewUser: false };
  }
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/user?userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Error getting user:', data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// =============================================
// PREFERRED TOPICS OPERATIONS
// =============================================

export async function updatePreferredTopics(userId: string, topics: string[]): Promise<boolean> {
  try {
    const response = await fetch('/api/user/topics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, topics }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating topics:', error);
    return false;
  }
}

// =============================================
// SAVED ARTICLES / COLLECTIONS OPERATIONS
// =============================================

export async function getCollections(userId: string): Promise<CollectionData[]> {
  try {
    const response = await fetch(`/api/articles?userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return data.collections || [];
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
}

export async function saveArticle(
  userId: string,
  article: NewsArticle,
  collectionName: string
): Promise<boolean> {
  try {
    console.log('saveArticle called:', { userId, collectionName, articleUrl: article.url });
    
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, article, collectionName }),
    });

    const data = await response.json();
    console.log('saveArticle response:', { ok: response.ok, data });

    return response.ok;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

export async function removeArticle(
  userId: string,
  articleUrl: string,
  collectionName: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/articles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, articleUrl, collectionName }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing article:', error);
    return false;
  }
}

export async function removeCollection(userId: string, collectionName: string): Promise<boolean> {
  try {
    const response = await fetch('/api/articles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, collectionName, deleteCollection: true }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing collection:', error);
    return false;
  }
}

// =============================================
// ARTICLE TRACKING OPERATIONS
// =============================================

export async function trackArticleSeen(userId: string, articleUrl: string): Promise<boolean> {
  try {
    const response = await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, articleUrl }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error tracking article:', error);
    return false;
  }
}

export async function getArticlesSeenStats(userId: string): Promise<{ seen: number; clicks: number }> {
  try {
    const response = await fetch(`/api/tracking?userId=${userId}`);
    const data = await response.json();

    return {
      seen: data.seen || 0,
      clicks: data.clicks || 0,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { seen: 0, clicks: 0 };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

// Get all articles from all collections (flattened)
export function getAllArticlesFromCollections(collections: CollectionData[]): SavedArticleData[] {
  return collections.flatMap(c => c.articles);
}

// Get collection names
export function getCollectionNames(collections: CollectionData[]): string[] {
  return collections.map(c => c.collectionName);
}

// Check if article is in any collection
export function isArticleInCollections(collections: CollectionData[], articleUrl: string): boolean {
  return collections.some(c => c.articles.some(a => a.url === articleUrl));
}

// Get total article count
export function getTotalArticleCount(collections: CollectionData[]): number {
  return collections.reduce((sum, c) => sum + c.articles.length, 0);
}
