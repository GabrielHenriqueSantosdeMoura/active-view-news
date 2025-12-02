-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_api TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_news_api ON users(news_api);

-- 2. PREFERRED TOPICS TABLE
CREATE TABLE IF NOT EXISTS preferred_topics (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  topics TEXT[] DEFAULT '{}'
);

-- 3. SAVED ARTICLES TABLE
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

-- 4. ARTICLES SEEN TABLE
CREATE TABLE IF NOT EXISTS articles_seen (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  articles TEXT[] DEFAULT '{}',  -- Array of article URLs
  clicks INTEGER DEFAULT 0
);
