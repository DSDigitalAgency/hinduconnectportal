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
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const search = url.searchParams.get('search')?.trim();
    const category = url.searchParams.get('category')?.trim();
    let filter: Record<string, unknown> = {};
    
    const conditions: Record<string, unknown>[] = [];
    
    if (search) {
      conditions.push({
        $or: [
          { 'basicInfo.title': { $regex: search, $options: 'i' } },
          { 'content.body': { $regex: search, $options: 'i' } },
          { 'author.authorName': { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    if (category) {
      conditions.push({ 'basicInfo.category': category });
    }
    
    if (conditions.length > 0) {
      filter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }
    
    const total = await db.collection('blogs').countDocuments(filter);
    const items = await db.collection('blogs').find(filter).skip(skip).limit(limit).sort({ createddt: -1 }).toArray();
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blogs', error: String(error) }, { status: 500 });
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
    
    if (!body.basicInfo?.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    if (!body.basicInfo?.category) {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }
    
    if (!body.content?.body) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }
    
    // Generate a unique blog ID
    const generateBlogId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `blog_${timestamp}_${randomStr}`;
    };
    
    // Create slug from title
    const slugify = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
    };
    
    const doc = {
      blogId: generateBlogId(),
      basicInfo: {
        title: body.basicInfo.title,
        slug: slugify(body.basicInfo.title),
        status: body.basicInfo.status || 'draft',
        category: body.basicInfo.category
      },
      author: {
        authorName: body.author?.authorName || 'Hindu Connect'
      },
      content: {
        body: body.content.body,
        language: body.content?.language || 'English'
      },
      createddt: new Date().toISOString(),
      updateddt: new Date().toISOString()
    };
    
    const result = await db.collection('blogs').insertOne(doc);
    const inserted = await db.collection('blogs').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating blog', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 