'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { UserPreferences, NewsArticle } from '../lib/types';
import { CollectionData } from '../lib/database.types';
import { searchNews } from '../lib/api';
import { getCurrentUserId, clearAuthData } from '../lib/supabase';
import {
  getCollections,
  saveArticle,
  removeArticle,
  removeCollection,
  trackArticleSeen,
  getArticlesSeenStats,
  getCollectionNames,
  isArticleInCollections,
  getTotalArticleCount,
} from '../lib/database.service';
import SearchBar from './SearchBar';
import ArticleCard from './ArticleCard';
import { ArticleSkeletonGrid } from './ArticleSkeleton';
import CollectionsPanel from './CollectionsPanel';
import { BookmarkIcon, SettingsIcon, NewspaperIcon, TrendingUpIcon } from './Icons';

interface DashboardProps {
  preferences: UserPreferences;
  onLogout: () => void;
}

export default function Dashboard({ preferences, onLogout }: DashboardProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [error, setError] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [showCollections, setShowCollections] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [stats, setStats] = useState({ seen: 0, clicks: 0 });

  const userId = getCurrentUserId();

  // Load collections and stats from database
  const loadCollectionsFromDB = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingCollections(true);
    try {
      const [collectionsData, statsData] = await Promise.all([
        getCollections(userId),
        getArticlesSeenStats(userId),
      ]);
      
      setCollections(collectionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingCollections(false);
    }
  }, [userId]);

  // Load data on mount
  useEffect(() => {
    loadCollectionsFromDB();
  }, [loadCollectionsFromDB]);

  // Load initial news based on first favorite topic
  useEffect(() => {
    if (preferences.favoriteTopics.length > 0 && !currentQuery) {
      handleSearch(preferences.favoriteTopics[0]);
    }
  }, [preferences.favoriteTopics]);

  const handleSearch = useCallback(async (query: string) => {
    setCurrentQuery(query);
    setIsLoading(true);
    setError('');

    try {
      const response = await searchNews({
        query,
        apiKey: preferences.apiKey,
        pageSize: 21,
      });

      setArticles(response.articles);
      setTotalResults(response.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [preferences.apiKey]);

  // Article click tracking
  const handleArticleClick = async (articleUrl: string) => {
    if (!userId) return;
    
    await trackArticleSeen(userId, articleUrl);
    // Refresh stats from DB
    const statsData = await getArticlesSeenStats(userId);
    setStats(statsData);
  };

  // Save article to collection
  const handleSaveToCollection = async (article: NewsArticle, collectionName: string) => {
    if (!userId) return;
    
    const success = await saveArticle(userId, article, collectionName);
    
    if (success) {
      // Refresh collections from DB
      await loadCollectionsFromDB();
    }
  };

  // Create new collection with article
  const handleCreateCollection = async (name: string, article?: NewsArticle) => {
    if (!userId || !article) return;
    await handleSaveToCollection(article, name);
  };

  // Remove article from collection
  const handleRemoveFromCollection = async (collectionName: string, articleUrl: string) => {
    if (!userId) return;
    
    const success = await removeArticle(userId, articleUrl, collectionName);
    
    if (success) {
      // Refresh collections from DB
      await loadCollectionsFromDB();
    }
  };

  // Delete collection
  const handleDeleteCollection = async (collectionName: string) => {
    if (!userId) return;
    
    const success = await removeCollection(userId, collectionName);
    
    if (success) {
      // Refresh collections from DB
      await loadCollectionsFromDB();
    }
  };

  // Check if article is saved
  const isArticleSaved = (articleUrl: string) => {
    return isArticleInCollections(collections, articleUrl);
  };

  const handleLogout = () => {
    clearAuthData();
    onLogout();
  };

  const collectionNames = getCollectionNames(collections);
  const totalSavedArticles = getTotalArticleCount(collections);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ActiveView News"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Collections button */}
              <button
                onClick={() => setShowCollections(true)}
                className="relative flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-xl transition-colors"
              >
                <BookmarkIcon size={20} />
                <span className="hidden sm:inline font-medium">Collections</span>
                {totalSavedArticles > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalSavedArticles > 99 ? '99+' : totalSavedArticles}
                  </span>
                )}
              </button>

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-xl transition-colors relative"
              >
                <SettingsIcon size={20} />
              </button>

              {/* Settings dropdown */}
              {showSettings && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute right-4 top-14 z-50 w-64 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="text-sm text-[var(--text-muted)]">API Key</p>
                      <p className="font-mono text-sm text-[var(--foreground)] truncate">
                        {preferences.apiKey.slice(0, 8)}...{preferences.apiKey.slice(-4)}
                      </p>
                    </div>
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="text-sm text-[var(--text-muted)]">User ID</p>
                      <p className="font-mono text-xs text-[var(--foreground)] truncate">
                        {userId || 'Not connected'}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Reset & Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section with search */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4">
            Stay <span className="text-[var(--primary)]">Informed</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
            Discover the latest news on your favorite topics. Save articles to your collections for later.
          </p>
          <SearchBar
            onSearch={handleSearch}
            favoriteTopics={preferences.favoriteTopics}
            currentQuery={currentQuery}
          />
        </section>

        {/* Results section */}
        <section>
          {currentQuery && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                <NewspaperIcon size={24} className="text-[var(--primary)]" />
                Results for &ldquo;{currentQuery}&rdquo;
                {!isLoading && totalResults > 0 && (
                  <span className="text-[var(--text-muted)] font-normal text-base">
                    ({totalResults.toLocaleString()} articles)
                  </span>
                )}
              </h2>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in">
              <p className="text-[var(--error)] font-medium mb-2">
                Something went wrong
              </p>
              <p className="text-[var(--text-muted)] text-sm">{error}</p>
              <button
                onClick={() => handleSearch(currentQuery)}
                className="mt-4 btn-primary"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <ArticleSkeletonGrid count={6} />}

          {/* Empty state */}
          {!isLoading && !error && articles.length === 0 && currentQuery && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-[var(--surface)] rounded-2xl flex items-center justify-center">
                <NewspaperIcon size={36} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-xl text-[var(--foreground)] font-medium mb-2">
                No articles found
              </p>
              <p className="text-[var(--text-muted)]">
                Try a different search term
              </p>
            </div>
          )}

          {/* Articles grid */}
          {!isLoading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <div
                  key={`${article.url}-${index}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ArticleCard
                    article={article}
                    collectionNames={collectionNames}
                    onSaveToCollection={handleSaveToCollection}
                    onCreateCollection={handleCreateCollection}
                    isInCollection={isArticleSaved}
                    onArticleClick={handleArticleClick}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--text-muted)]">
          <p>
            Powered by{' '}
            <a
              href="https://www.activeview.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              ActiveView
            </a>
            {' '}•{' '}
            News data from{' '}
            <a
              href="https://newsapi.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              NewsAPI
            </a>
          </p>
        </div>
      </footer>

      {/* Collections panel */}
      <CollectionsPanel
        collections={collections}
        isOpen={showCollections}
        onClose={() => setShowCollections(false)}
        onDeleteCollection={handleDeleteCollection}
        onRemoveFromCollection={handleRemoveFromCollection}
        isLoading={isLoadingCollections}
      />
    </div>
  );
}
