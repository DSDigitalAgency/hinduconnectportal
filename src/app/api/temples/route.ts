import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function randomString(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len);
}

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
          { 'basicInfo.name': { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } },
        ],
      };
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
    let templeId = body.templeId;
    if (!templeId && body.basicInfo?.name) {
      templeId = slugify(body.basicInfo.name) + '_' + randomString(5);
    }
    const doc = { ...body, templeId, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('temples').insertOne(doc);
    const inserted = await db.collection('temples').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 