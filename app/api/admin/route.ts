import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getServerSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, key);
};

// Admin API key - in production, use environment variable
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// GET - Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const adminKey = request.nextUrl.searchParams.get('adminKey');

    // Verify admin key
    if (adminKey !== ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServerSupabase();

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, news_api, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get all articles_seen data
    const { data: articlesSeenData, error: seenError } = await supabase
      .from('articles_seen')
      .select('id, articles, clicks');

    if (seenError) {
      console.error('Error fetching articles seen:', seenError);
    }

    // Get preferred topics for all users
    const { data: topicsData, error: topicsError } = await supabase
      .from('preferred_topics')
      .select('id, topics');

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
    }

    // Calculate stats per user
    const userStats = users?.map((user) => {
      const seenData = articlesSeenData?.find((s) => s.id === user.id);
      const topicsInfo = topicsData?.find((t) => t.id === user.id);
      
      return {
        id: user.id,
        apiKey: user.news_api ? `${user.news_api.slice(0, 8)}...` : 'N/A',
        createdAt: user.created_at,
        clicks: seenData?.clicks || 0,
        articlesViewed: seenData?.articles?.length || 0,
        topics: topicsInfo?.topics || [],
      };
    }) || [];

    // Calculate total stats
    const totalClicks = userStats.reduce((sum, user) => sum + user.clicks, 0);
    const totalArticlesViewed = userStats.reduce((sum, user) => sum + user.articlesViewed, 0);
    const totalUsers = userStats.length;

    // Get top 10 most viewed articles
    const articleCounts = new Map<string, number>();
    
    articlesSeenData?.forEach((userData) => {
      (userData.articles || []).forEach((articleUrl: string) => {
        articleCounts.set(articleUrl, (articleCounts.get(articleUrl) || 0) + 1);
      });
    });

    const topArticles = Array.from(articleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, count]) => ({ url, viewCount: count }));

    return NextResponse.json({
      users: userStats,
      stats: {
        totalUsers,
        totalClicks,
        totalArticlesViewed,
      },
      topArticles,
    });
  } catch (error) {
    console.error('Error in admin route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}

// POST - Verify admin key
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (apiKey === ADMIN_API_KEY) {
      return NextResponse.json({ isAdmin: true });
    }

    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    console.error('Error verifying admin:', error);
    return NextResponse.json({ isAdmin: false });
  }
}

