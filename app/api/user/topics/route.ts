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

// PUT - Update preferred topics
export async function PUT(request: NextRequest) {
  try {
    const { userId, topics } = await request.json();

    if (!userId || !topics) {
      return NextResponse.json(
        { error: 'User ID and topics are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const { error } = await supabase
      .from('preferred_topics')
      .update({ topics })
      .eq('id', userId);

    if (error) {
      console.error('Error updating topics:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating topics:', error);
    return NextResponse.json(
      { error: 'Failed to update topics' },
      { status: 500 }
    );
  }
}

