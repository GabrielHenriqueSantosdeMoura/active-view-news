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

// GET - Get tracking stats
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

    const { data, error } = await supabase
      .from('articles_seen')
      .select('articles, clicks')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ seen: 0, clicks: 0 });
    }

    return NextResponse.json({
      seen: data?.articles?.length || 0,
      clicks: data?.clicks || 0,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ seen: 0, clicks: 0 });
  }
}

// POST - Track article click
export async function POST(request: NextRequest) {
  try {
    const { userId, articleUrl } = await request.json();

    if (!userId || !articleUrl) {
      return NextResponse.json(
        { error: 'User ID and article URL are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const { data, error: fetchError } = await supabase
      .from('articles_seen')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    const currentArticles = data?.articles || [];
    const currentClicks = data?.clicks || 0;

    // Only add if not already seen
    if (!currentArticles.includes(articleUrl)) {
      const { error: updateError } = await supabase
        .from('articles_seen')
        .update({
          articles: [...currentArticles, articleUrl],
          clicks: currentClicks + 1,
        })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Just increment clicks
      const { error: updateError } = await supabase
        .from('articles_seen')
        .update({ clicks: currentClicks + 1 })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking:', error);
    return NextResponse.json(
      { error: 'Failed to track' },
      { status: 500 }
    );
  }
}

