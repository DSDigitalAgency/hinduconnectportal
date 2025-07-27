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
    
    // Build filter conditions
    const conditions: Record<string, unknown>[] = [];
    
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { text: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ],
      });
    }
    
    if (category) {
      conditions.push({ category: { $regex: category, $options: 'i' } });
    }

    if (conditions.length > 0) {
      filter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }
    
    const total = await db.collection('temples').countDocuments(filter);
    const items = await db.collection('temples').find(filter).skip(skip).limit(limit).toArray();
    
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching temples', error: String(error) }, { status: 500 });
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
    
    if (!body.title || !body.category || !body.text) {
      return NextResponse.json({ message: 'Title, category, and text are required' }, { status: 400 });
    }
    
    const doc = {
      title: body.title,
      category: body.category,
      text: body.text,
      createddt: new Date().toISOString(),
      updateddt: new Date().toISOString()
    };
    
    const result = await db.collection('temples').insertOne(doc);
    const inserted = await db.collection('temples').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 