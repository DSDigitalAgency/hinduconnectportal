import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

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
    await db.collection('temples').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );
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
    await db.collection('temples').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Temple deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting temple', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 