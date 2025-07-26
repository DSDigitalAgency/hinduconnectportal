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
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) });
    
    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blog', error: String(error) }, { status: 500 });
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
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db(dbName);
    
    if (!body.basicInfo?.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    if (!body.basicInfo?.category) {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }
    
    if (!body.content?.body) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }
    
    // Create slug from title
    const slugify = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
    };
    
    const updateDoc = {
      'basicInfo.title': body.basicInfo.title,
      'basicInfo.slug': slugify(body.basicInfo.title),
      'basicInfo.status': body.basicInfo.status || 'draft',
      'basicInfo.category': body.basicInfo.category,
      'author.authorName': body.author?.authorName || 'Hindu Connect',
      'content.body': body.content.body,
      'content.language': body.content?.language || 'English',
      updateddt: new Date().toISOString(),
    };
    
    const result = await db.collection('blogs').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
    
    const updatedBlog = await db.collection('blogs').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updatedBlog);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating blog', error: String(error) }, { status: 500 });
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
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting blog', error: String(error) }, { status: 500 });
  } finally {
    await client.close();
  }
} 