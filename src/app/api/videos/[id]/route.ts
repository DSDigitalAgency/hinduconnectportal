import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

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