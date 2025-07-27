import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: NextRequest, context: any) {
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const { id } = context.params;
    
    const temple = await db.collection('temples').findOne({ _id: new ObjectId(id) });
    
    if (!temple) {
      return NextResponse.json({ message: 'Temple not found' }, { status: 404 });
    }
    
    return NextResponse.json(temple);
  } catch (error) {
    console.error('Error fetching temple:', error);
    return NextResponse.json({ message: 'Error fetching temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, context: any) {
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }
  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db(dbName);
    const { id } = context.params;
    
    if (!body.title || !body.category || !body.text) {
      return NextResponse.json({ message: 'Title, category, and text are required' }, { status: 400 });
    }
    
    // Create the update document with proper structure
    const updateDoc = {
      title: body.title,
      category: body.category,
      text: body.text,
      updateddt: new Date().toISOString(),
    };
    
    const result = await db.collection('temples').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Temple not found' }, { status: 404 });
    }
    
    const updated = await db.collection('temples').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const { id } = context.params;
    const result = await db.collection('temples').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Temple not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Temple deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 