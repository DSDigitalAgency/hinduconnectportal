import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid video ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });
    
    if (!video) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching video', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid video ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db(dbName);
    
    if (!body.videourl || !body.title || !body.category) {
      return NextResponse.json({ message: 'Video URL, title, and category are required' }, { status: 400 });
    }
    
    const updateDoc = {
      videourl: body.videourl,
      title: body.title,
      category: body.category,
      updateddt: new Date().toISOString()
    };
    
    const result = await db.collection('videos').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }
    
    const updated = await db.collection('videos').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating video', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uri) {
    return NextResponse.json({ message: 'MONGODB_URI not set' }, { status: 500 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid video ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const result = await db.collection('videos').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Video deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting video', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 