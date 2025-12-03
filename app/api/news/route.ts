import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

const getServerSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, key);
};

// GET - Search news using user's API key from database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const query = searchParams.get('q');
    const pageSize = searchParams.get('pageSize') || '20';
    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sortBy') || 'publishedAt';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Get user's API key from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('news_api')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const apiKey = user.news_api;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'User has no API key configured' },
        { status: 400 }
      );
    }

    // Call News API
    const url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(
      query
    )}&pageSize=${pageSize}&page=${page}&language=en&sortBy=${sortBy}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      console.error('News API error:', data.message);
      return NextResponse.json(
        { error: data.message || 'Failed to fetch news' },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in news route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - Validate API key
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Test the API key with a simple request
    const url = `${NEWS_API_BASE_URL}/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: data.message || 'Invalid API key' 
      });
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}

