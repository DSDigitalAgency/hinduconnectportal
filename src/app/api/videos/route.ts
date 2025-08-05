import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

export async function GET(req: NextRequest) {
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    
    const skip = (page - 1) * limit;
    
    const filter: Record<string, unknown> = {};
    
    // Build search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Only add language filter if it's provided and not empty
    if (language && language.trim() !== '') {
      filter.language = language;
    }
    
    const total = await db.collection('videos').countDocuments(filter);
    const items = await db.collection('videos')
      .find(filter)
      .sort({ createddt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Add default language for videos that don't have it
    const processedItems = items.map(item => ({
      ...item,
      language: item.language || 'English' // Default to English for existing videos
    }));
    
    return NextResponse.json({ items: processedItems, total, page, limit });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ message: 'Error fetching videos', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest) {
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }
  
  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db(dbName);
    
    if (!body.videourl || !body.title || !body.category) {
      return NextResponse.json({ message: 'Video URL, title, and category are required' }, { status: 400 });
    }
    
    const doc = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videourl: body.videourl,
      title: body.title,
      category: body.category,
      language: body.language || 'English', // Default to English if not provided
      createddt: new Date().toISOString(),
      updateddt: new Date().toISOString()
    };
    
    const result = await db.collection('videos').insertOne(doc);
    const inserted = await db.collection('videos').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ message: 'Error creating video', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 