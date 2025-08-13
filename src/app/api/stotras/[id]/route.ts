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
    
    const stotra = await db.collection('stotras').findOne({ _id: new ObjectId(id) });
    
    if (!stotra) {
      return NextResponse.json({ message: 'Stotra not found' }, { status: 404 });
    }
    
    return NextResponse.json(stotra);
  } catch (error) {
    console.error('Error fetching stotra:', error);
    return NextResponse.json({ message: 'Error fetching stotra', error: String(error) }, { status: 500 });
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
    
    if (!body.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    if (!body.text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }
    
    if (!body.language) {
      return NextResponse.json({ message: 'Language is required' }, { status: 400 });
    }
    
    // Create the update document with simplified structure
    const updateDoc = {
      title: body.title,
      text: body.text,
      lang: body.language,
      ...(typeof body.subtitle === 'string' ? { subtitle: body.subtitle } : {}),
      updateddt: new Date().toISOString(),
    };
    
    const result = await db.collection('stotras').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Stotra not found' }, { status: 404 });
    }
    const updated = await db.collection('stotras').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating stotra', error: String(error) }, { status: 500 });
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
    const result = await db.collection('stotras').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Stotra not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Stotra deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting stotra', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 