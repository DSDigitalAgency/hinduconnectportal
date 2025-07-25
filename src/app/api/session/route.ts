import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token');
  if (token && token.value) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
} 