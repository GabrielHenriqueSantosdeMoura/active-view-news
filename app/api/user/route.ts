import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side Supabase client (uses service role key)
const getServerSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, key);
};

// POST - Create new user or login existing
export async function POST(request: NextRequest) {
  try {
    const { newsApiKey } = await request.json();

    if (!newsApiKey) {
      return NextResponse.json(
        { error: 'News API key is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // First, check if user with this API key already exists
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('news_api', newsApiKey)
      .single();

    // If user exists, return their ID (login)
    if (existingUser && !searchError) {
      console.log('User found, logging in:', existingUser.id);
      return NextResponse.json({ 
        userId: existingUser.id,
        isNewUser: false 
      });
    }

    // If not found, create new user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({ news_api: newsApiKey })
      .select('id')
      .single();

    if (userError) {
      console.error('Error inserting user:', userError);
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    const userId = userData.id;
    console.log('New user created:', userId);

    // Initialize related tables for new user
    const [topicsRes, seenRes] = await Promise.all([
      supabase.from('preferred_topics').insert({ id: userId, topics: [] }),
      supabase.from('articles_seen').insert({ id: userId, articles: [], clicks: 0 }),
    ]);

    if (topicsRes.error) console.error('preferred_topics error:', topicsRes.error);
    if (seenRes.error) console.error('articles_seen error:', seenRes.error);

    return NextResponse.json({ 
      userId,
      isNewUser: true 
    });
  } catch (error) {
    console.error('Error in user route:', error);
    return NextResponse.json(
      { error: 'Failed to create/login user' },
      { status: 500 }
    );
  }
}

// GET - Get user data
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const [userRes, topicsRes, seenRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('preferred_topics').select('*').eq('id', userId).single(),
      supabase.from('articles_seen').select('*').eq('id', userId).single(),
    ]);

    if (userRes.error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userId,
      newsApiKey: userRes.data.news_api,
      preferredTopics: topicsRes.data?.topics || [],
      articlesSeen: seenRes.data?.articles || [],
      totalClicks: seenRes.data?.clicks || 0,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
