import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getServerSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase config:', { url: !!url, key: !!key });
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, key);
};

// Article stored in DB includes collectionName
interface StoredArticle {
  url: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  source: string;
  publishedAt: string;
  savedAt: string;
  collectionName: string;
}

// GET - Get saved articles for a user
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

    // Get user's saved articles row
    const { data, error } = await supabase
      .from('saved_articles')
      .select('articles')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting articles:', error);
      return NextResponse.json({ collections: [] });
    }

    if (!data || !data.articles) {
      return NextResponse.json({ collections: [] });
    }

    // Parse articles from JSON strings
    const allArticles: StoredArticle[] = (data.articles || [])
      .map((articleJson: string) => {
        try {
          return JSON.parse(articleJson);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Group by collection name
    const collectionsMap = new Map<string, StoredArticle[]>();
    for (const article of allArticles) {
      const existing = collectionsMap.get(article.collectionName) || [];
      collectionsMap.set(article.collectionName, [...existing, article]);
    }

    // Convert to array format
    const collections = Array.from(collectionsMap.entries()).map(([name, articles]) => ({
      collectionName: name,
      articles: articles,
    }));

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json(
      { error: 'Failed to get articles' },
      { status: 500 }
    );
  }
}

// POST - Save article to collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, article, collectionName } = body;

    if (!userId || !article || !collectionName) {
      return NextResponse.json(
        { error: 'User ID, article, and collection name are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Get current user's saved articles
    const { data: existingData, error: selectError } = await supabase
      .from('saved_articles')
      .select('articles')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching articles:', selectError);
      return NextResponse.json(
        { error: selectError.message },
        { status: 500 }
      );
    }

    // Create article data object to store as JSON (includes collectionName)
    const articleData: StoredArticle = {
      url: article.url,
      title: article.title,
      description: article.description,
      urlToImage: article.urlToImage,
      source: article.source?.name || article.source,
      publishedAt: article.publishedAt,
      savedAt: new Date().toISOString(),
      collectionName: collectionName,
    };

    if (existingData) {
      // User has existing row - update it
      const currentArticles = existingData.articles || [];
      
      // Parse existing articles
      const parsedArticles: StoredArticle[] = currentArticles
        .map((a: string) => {
          try { return JSON.parse(a); } catch { return null; }
        })
        .filter(Boolean);

      // Check if article already exists in this collection
      const alreadyExists = parsedArticles.some(
        (a) => a.url === article.url && a.collectionName === collectionName
      );

      if (alreadyExists) {
        return NextResponse.json({ success: true, alreadyExists: true });
      }

      // Add new article
      const updatedArticles = [...currentArticles, JSON.stringify(articleData)];

      const { error: updateError } = await supabase
        .from('saved_articles')
        .update({ articles: updatedArticles })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating articles:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // User has no row yet - create one
      const { error: insertError } = await supabase
        .from('saved_articles')
        .insert({
          id: userId,
          articles: [JSON.stringify(articleData)],
        });

      if (insertError) {
        console.error('Error inserting articles:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json(
      { error: 'Failed to save article' },
      { status: 500 }
    );
  }
}

// DELETE - Remove article or collection
export async function DELETE(request: NextRequest) {
  try {
    const { userId, articleUrl, collectionName, deleteCollection } = await request.json();

    if (!userId || !collectionName) {
      return NextResponse.json(
        { error: 'User ID and collection name are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Get current articles
    const { data, error: fetchError } = await supabase
      .from('saved_articles')
      .select('articles')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError || !data) {
      return NextResponse.json(
        { error: 'No articles found' },
        { status: 404 }
      );
    }

    const currentArticles = data.articles || [];
    let updatedArticles: string[];

    if (deleteCollection) {
      // Remove all articles from this collection
      updatedArticles = currentArticles.filter((articleJson: string) => {
        try {
          const article = JSON.parse(articleJson);
          return article.collectionName !== collectionName;
        } catch {
          return true;
        }
      });
    } else {
      // Remove specific article from collection
      updatedArticles = currentArticles.filter((articleJson: string) => {
        try {
          const article = JSON.parse(articleJson);
          return !(article.url === articleUrl && article.collectionName === collectionName);
        } catch {
          return true;
        }
      });
    }

    // Update the row
    const { error: updateError } = await supabase
      .from('saved_articles')
      .update({ articles: updatedArticles })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
