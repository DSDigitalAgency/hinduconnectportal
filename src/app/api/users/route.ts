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
          { 'basicInfo.name': { $regex: search, $options: 'i' } },
          { 'email': { $regex: search, $options: 'i' } },
        ],
      };
    }
    const total = await db.collection('users').countDocuments(filter);
    const items = await db.collection('users').find(filter).skip(skip).limit(limit).toArray();
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users', error: String(error) }, { status: 500 });
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
    if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
      return NextResponse.json({ message: 'Valid email required' }, { status: 400 });
    }
    const exists = await db.collection('users').findOne({ email: body.email });
    if (exists) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }
    const doc = { ...body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('users').insertOne(doc);
    const inserted = await db.collection('users').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 