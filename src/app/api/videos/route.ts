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
    const total = await db.collection('videos').countDocuments();
    const items = await db.collection('videos').find({}).skip(skip).limit(limit).sort({ createddt: -1 }).toArray();
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
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
    if (!body.videourl) {
      return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
    }
    // Generate a unique video id
    const generateVideoId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `video_${timestamp}_${randomStr}`;
    };
    const id = generateVideoId();
    const doc = {
      id,
      videourl: body.videourl,
      createddt: new Date(),
    };
    const result = await db.collection('videos').insertOne(doc);
    const inserted = await db.collection('videos').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating video', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 