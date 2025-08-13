import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const AKSHARAMUKHA_BASE = 'https://aksharamukha.hinduconnect.app';

export async function convertOne({ source, target, text, postOptions = [] }) {
  const res = await fetch(`${AKSHARAMUKHA_BASE}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target, text, nativize: false, preOptions: [], postOptions })
  });
  if (!res.ok) {
    throw new Error(`Aksharamukha error: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

export function toPlainEnglish(romanized) {
  if (!romanized) return '';
  let s = romanized;
  s = s
    .replaceAll('ś', 'sh').replaceAll('Ś', 'Sh')
    .replaceAll('ṣ', 'sh').replaceAll('Ṣ', 'Sh')
    .replaceAll('ç', 'ch').replaceAll('Ç', 'Ch')
    .replaceAll('ñ', 'ny').replaceAll('Ñ', 'Ny')
    .replaceAll('ṅ', 'ng').replaceAll('Ṅ', 'Ng')
    .replaceAll('ṇ', 'n').replaceAll('Ṇ', 'N')
    .replaceAll('ṭ', 't').replaceAll('Ṭ', 'T')
    .replaceAll('ḍ', 'd').replaceAll('Ḍ', 'D')
    .replaceAll('ḥ', 'h').replaceAll('Ḥ', 'H')
    .replaceAll('ṃ', 'm').replaceAll('ṁ', 'm').replaceAll('Ṃ', 'M')
    .replaceAll('ṛ', 'ri').replaceAll('ṝ', 'ri').replaceAll('Ṛ', 'Ri').replaceAll('Ṝ', 'Ri')
    .replaceAll('ā', 'a').replaceAll('Ā', 'A')
    .replaceAll('ī', 'i').replaceAll('Ī', 'I')
    .replaceAll('ū', 'u').replaceAll('Ū', 'U')
    .replaceAll('ē', 'e').replaceAll('Ē', 'E')
    .replaceAll('ō', 'o').replaceAll('Ō', 'O')
    .replaceAll('’', "'").replaceAll('‘', "'").replaceAll('“', '"').replaceAll('”', '"');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.split(' ').map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(' ');
  return s;
}

export async function transliterateToEnglish(source, text) {
  try {
    // Prefer Roman target with post options for plain English
    const out = await convertOne({ source, target: 'Roman', text, postOptions: ['remove_diacritics', 'title_case'] });
    const cleaned = String(out).trim();
    if (cleaned && /[A-Za-z]/.test(cleaned)) return cleaned;
  } catch {}
  try {
    const out = await convertOne({ source, target: 'Latin', text, postOptions: ['remove_diacritics', 'title_case'] });
    const cleaned = String(out).trim();
    if (cleaned && /[A-Za-z]/.test(cleaned)) return cleaned;
  } catch {}
  // Fallback: no post options, then clean locally
  try {
    const out = await convertOne({ source, target: 'Latin', text });
    const cleaned = toPlainEnglish(String(out).trim());
    if (cleaned) return cleaned;
  } catch {}
  return '';
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}

export async function processLanguage({ sourceLang }) {
  const { client, db } = await getDb();
  try {
    const query = {
      lang: { $regex: `^${sourceLang}$`, $options: 'i' },
      $or: [
        { subtitle: { $exists: false } },
        { subtitle: null },
        { subtitle: '' }
      ]
    };
    const total = await db.collection('stotras').countDocuments(query);
    const batchSize = 200;
    console.log(`[${sourceLang}] Pending stotras without subtitle: ${total}. Batches of ${batchSize}.`);
    let updatedCount = 0;
    for (let skip = 0; skip < total; skip += batchSize) {
      console.log(`\n==== [${sourceLang}] Batch ${Math.floor(skip / batchSize) + 1} (skip=${skip}) ====`);
      const batch = await db.collection('stotras').find(query, { projection: { _id: 1, title: 1 } }).skip(skip).limit(batchSize).toArray();
      let batchUpdated = 0;
      for (let i = 0; i < batch.length; i++) {
        const doc = batch[i];
        const title = (doc?.title || '').trim();
        if (!title) { console.log(`- ${i + 1}/${batch.length}: ⏭️ Empty title`); continue; }
        try {
          const english = await transliterateToEnglish(sourceLang, title);
          if (!english) { console.log(`- ${i + 1}/${batch.length}: ❗ No transliteration for '${title}'`); continue; }
          const r = await db.collection('stotras').updateOne({ _id: doc._id }, { $set: { subtitle: english, updateddt: new Date().toISOString() } });
          if (r.modifiedCount > 0) { updatedCount++; batchUpdated++; console.log(`- ${i + 1}/${batch.length}: ✅ '${title}' -> '${english}'`); }
          else { console.log(`- ${i + 1}/${batch.length}: ↔️ No change for '${title}'`); }
        } catch (err) {
          console.error(`- ${i + 1}/${batch.length}: ❌ Error for '${title}':`, err?.message || err);
        }
      }
      console.log(`Batch updated ${batchUpdated}. Total updated so far ${updatedCount}.`);
    }
    console.log(`\n✅ Done [${sourceLang}]. Total updated: ${updatedCount}.`);
  } finally {
    await client.close();
  }
}


