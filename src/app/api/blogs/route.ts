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
    let filter: Record<string, unknown> = {};
    if (search) {
      filter = {
        $or: [
          { 'basicInfo.title': { $regex: search, $options: 'i' } },
          { 'content.body': { $regex: search, $options: 'i' } },
          { 'author.authorName': { $regex: search, $options: 'i' } },
        ],
      };
    }
    const total = await db.collection('blogs').countDocuments(filter);
    const items = await db.collection('blogs').find(filter).skip(skip).limit(limit).toArray();
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
    
    // Generate a unique blog ID
    const generateBlogId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `blog_${timestamp}_${randomStr}`;
    };
    
    const blogId = generateBlogId();
    const doc = { 
      ...body, 
      blogId,
      createdAt: new Date(), 
      updatedAt: new Date() 
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