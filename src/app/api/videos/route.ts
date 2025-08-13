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
    
    // Build filter using $and blocks to avoid any casts
    let filter: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (category) {
      andConditions.push({ category });
    }

    if (language && language.trim() !== '') {
      andConditions.push({ $or: [{ language }, { lang: language }] });
    }

    if (andConditions.length === 1) {
      filter = andConditions[0];
    } else if (andConditions.length > 1) {
      filter = { $and: andConditions };
    }
    
    const total = await db.collection('videos').countDocuments(filter);
    const items = await db.collection('videos')
      .find(filter)
      .sort({ createddt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Normalize output: expose 'language' for UI and keep original fields
    type VideoDoc = { language?: string; lang?: string };
    const processedItems = items.map((item) => {
      const doc = item as unknown as VideoDoc;
      return {
        ...item,
        language: doc.language ?? doc.lang ?? 'English',
      };
    });
    
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
      // Store under 'lang' to avoid MongoDB text-index language override conflicts
      lang: body.language || 'English',
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