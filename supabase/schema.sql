-- =============================================
-- ActiveView News - Database Schema
-- =============================================
-- Run this SQL in Supabase SQL Editor to set up the database
-- =============================================

-- =============================================
-- 1. USERS TABLE
-- Stores user accounts with their News API key
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_api TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster API key lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_news_api ON users(news_api);

-- =============================================
-- 2. PREFERRED TOPICS TABLE
-- Stores user's favorite news topics
-- =============================================
CREATE TABLE IF NOT EXISTS preferred_topics (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  topics TEXT[] DEFAULT '{}'
);

-- =============================================
-- 3. SAVED ARTICLES TABLE
-- One row per user, articles array contains ALL saved articles
-- Each article JSON includes collectionName to group them
-- =============================================
CREATE TABLE IF NOT EXISTS saved_articles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  articles TEXT[] DEFAULT '{}'
  -- Each article in the array is a JSON string with structure:
  -- {
  --   "url": "https://...",
  --   "title": "Article Title",
  --   "description": "...",
  --   "urlToImage": "https://...",
  --   "source": "Source Name",
  --   "publishedAt": "2024-01-01T00:00:00Z",
  --   "savedAt": "2024-01-01T00:00:00Z",
  --   "collectionName": "My Collection"  <-- this groups articles into collections
  -- }
);

-- =============================================
-- 4. ARTICLES SEEN TABLE
-- Tracks which articles users have viewed and click counts
-- =============================================
CREATE TABLE IF NOT EXISTS articles_seen (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  articles TEXT[] DEFAULT '{}',  -- Array of article URLs
  clicks INTEGER DEFAULT 0
);
