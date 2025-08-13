import { NextRequest, NextResponse } from 'next/server';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_USERS_COLLECTION = process.env.FIREBASE_USERS_COLLECTION || 'users';

type FirestorePrimitive = {
  stringValue?: string;
  integerValue?: string; // Firestore REST returns numbers as strings
  doubleValue?: number | string;
  booleanValue?: boolean;
  timestampValue?: string;
};

type FirestoreFields = Record<string, FirestorePrimitive | string | number | boolean>;

type FirestoreDocument = {
  name: string;
  fields?: FirestoreFields;
  createTime?: string;
  updateTime?: string;
};

function getStringField(fields: FirestoreFields | undefined, key: string): string | undefined {
  if (!fields || !fields[key]) return undefined;
  const v = fields[key] as FirestorePrimitive | string | number | boolean;
  // Handle common Firestore value types we might use
  if (typeof v === 'object' && v !== null) {
    const obj = v as FirestorePrimitive;
    if (obj.stringValue !== undefined) return obj.stringValue;
    if (obj.integerValue !== undefined) return String(obj.integerValue);
    if (obj.doubleValue !== undefined) return String(obj.doubleValue);
    if (obj.booleanValue !== undefined) return String(obj.booleanValue);
    if (obj.timestampValue !== undefined) return obj.timestampValue;
  }
  return String(v);
}

export async function GET(req: NextRequest) {
  try {
    if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
      return NextResponse.json({ message: 'FIREBASE_API_KEY or FIREBASE_PROJECT_ID not set' }, { status: 500 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/(default)/documents/${encodeURIComponent(FIREBASE_USERS_COLLECTION)}`;

    const apiUrl = new URL(base);
    apiUrl.searchParams.set('pageSize', String(limit));
    if (pageToken) apiUrl.searchParams.set('pageToken', pageToken);
    apiUrl.searchParams.set('key', FIREBASE_API_KEY);

    // For deep pagination we step page-1 times using nextPageToken to keep implementation simple
    let token: string | undefined = undefined;
    let documents: FirestoreDocument[] = [];
    for (let i = 0; i < page; i++) {
      const u = new URL(apiUrl.toString());
      if (token) u.searchParams.set('pageToken', token);
      const res = await fetch(u.toString());
      if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json({ message: 'Error fetching firebase users', error: txt }, { status: 500 });
      }
      const data = await res.json();
      documents = data.documents || [];
      token = data.nextPageToken;
      if (!token) break;
    }

    // Map and filter
    const mapped = (documents || []).map((doc: FirestoreDocument) => {
      const fields = doc.fields || {};
      const pathParts = (doc.name || '').split('/');
      const id = pathParts[pathParts.length - 1];
      const email = getStringField(fields, 'email') || '';
      const displayName = getStringField(fields, 'displayName') || getStringField(fields, 'name') || '';
      const provider = getStringField(fields, 'provider') || getStringField(fields, 'providerId') || '';
      const createdAt = getStringField(fields, 'createdAt') || doc.createTime || '';
      const phone =
        getStringField(fields, 'phoneNumber') ||
        getStringField(fields, 'phone') ||
        getStringField(fields, 'mobile') ||
        getStringField(fields, 'contact') ||
        '';
      const city = getStringField(fields, 'city') || '';
      const state = getStringField(fields, 'state') || '';
      const country = getStringField(fields, 'country') || '';
      const locField = getStringField(fields, 'location') || '';
      const locationParts = [locField, [city, state, country].filter(Boolean).join(', ')].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts[locationParts.length - 1] : '';
      const pincode =
        getStringField(fields, 'pincode') ||
        getStringField(fields, 'pin') ||
        getStringField(fields, 'zip') ||
        getStringField(fields, 'zipcode') ||
        getStringField(fields, 'postalCode') ||
        getStringField(fields, 'postcode') ||
        '';
      return { id, email, displayName, provider, createdAt, phone, location, pincode };
    });

    const filtered = search
      ? mapped.filter(u =>
          (u.email || '').toLowerCase().includes(search) ||
          (u.displayName || '').toLowerCase().includes(search) ||
          (u.phone || '').toLowerCase().includes(search) ||
          (u.location || '').toLowerCase().includes(search) ||
          (u.pincode || '').toLowerCase().includes(search)
        )
      : mapped;

    return NextResponse.json({ items: filtered, page, limit, nextPageToken: token || null });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching firebase users', error: String(error) }, { status: 500 });
  }
}


