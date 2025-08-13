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
    const language = url.searchParams.get('language')?.trim();
    let filter: Record<string, unknown> = {};
    
    // Build filter conditions
    const conditions: Record<string, unknown>[] = [];
    if (search) {
      conditions.push({
        $or: [
          { 'title': { $regex: search, $options: 'i' } },
          { 'text': { $regex: search, $options: 'i' } },
        ],
      });
    }
    if (language) {
      conditions.push({ 'lang': { $regex: language, $options: 'i' } });
    }

    if (conditions.length > 0) {
      filter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }
    
    const total = await db.collection('stotras').countDocuments(filter);
    const items = await db.collection('stotras').find(filter).skip(skip).limit(limit).toArray();
    
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching stotras', error: String(error) }, { status: 500 });
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
    
    if (!body.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    if (!body.text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }
    
    if (!body.language) {
      return NextResponse.json({ message: 'Language is required' }, { status: 400 });
    }
    
    // Create the document with simplified structure
    const doc = {
      title: body.title,
      text: body.text,
      lang: body.language,
      subtitle: body.subtitle || '',
      createddt: new Date().toISOString(),
      updateddt: new Date().toISOString(),
    };
    
    const result = await db.collection('stotras').insertOne(doc);
    const inserted = await db.collection('stotras').findOne({ _id: result.insertedId });
    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating stotra', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 