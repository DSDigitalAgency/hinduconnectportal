import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const uri = process.env.MONGODB_URI as string;
const dbName = uri.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?]+)/)?.[1] || 'hinduconnect';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('admins').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    // Set a simple session cookie (user id)
    const res = NextResponse.json({ message: 'Login successful' });
    // Set cookie for 7 days
    res.cookies.set('token', user._id.toString(), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } finally {
    await client.close();
  }
} 