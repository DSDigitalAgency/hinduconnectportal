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

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid biography ID' }, { status: 400 });
    }

    const biography = await db.collection('biographies').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!biography) {
      return NextResponse.json({ message: 'Biography not found' }, { status: 404 });
    }

    return NextResponse.json(biography);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching biography', error: String(error) }, { status: 500 });
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

  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db(dbName);
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid biography ID' }, { status: 400 });
    }

    if (!body.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    if (!body.content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const updateDoc = {
      title: body.title,
      content: body.content,
      updateddt: new Date().toISOString(),
    };

    const result = await db.collection('biographies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Biography not found' }, { status: 404 });
    }

    const updated = await db.collection('biographies').findOne({ 
      _id: new ObjectId(id) 
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating biography', error: String(error) }, { status: 500 });
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

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid biography ID' }, { status: 400 });
    }

    const result = await db.collection('biographies').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Biography not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Biography deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting biography', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 