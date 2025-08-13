/*
  Script: Update subtitles for Telugu stotras by converting from Devanagari titles
  - Fetch Devanagari titles from DB
  - Convert title to Telugu and Latin (English) using Aksharamukha API
  - Find Telugu stotra with the Telugu title and set subtitle to the English (Latin) title
*/

import 'dotenv/config';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const AKSHARAMUKHA_BASE = 'https://aksharamukha.hinduconnect.app';

async function convertViaAksharamukha(source: string, targets: string[], text: string): Promise<Record<string, string>> {
  const res = await fetch(`${AKSHARAMUKHA_BASE}/api/convert_loop_tgt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, targets, text, nativize: true, preOptions: [], postOptions: [] }),
  });
  if (!res.ok) {
    throw new Error(`Aksharamukha error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as Record<string, string>;
}

async function main() {
  const uri = process.env.MONGODB_URI as string;
  const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // 1) Load all Devanagari stotras (lang contains 'Devanagari')
  const devanagariStotras = await db
    .collection('stotras')
    .find({ lang: { $regex: 'Devanagari', $options: 'i' } }, { projection: { _id: 0, title: 1 } })
    .toArray();

  console.log(`Found ${devanagariStotras.length} Devanagari stotras to convert`);

  let updatedCount = 0;
  for (const s of devanagariStotras) {
    const title = (s as { title?: string }).title?.trim();
    if (!title) continue;

    try {
      // 2) Convert this Devanagari title to Telugu and Latin
      const results = await convertViaAksharamukha('Devanagari', ['Telugu', 'Latin'], title);
      const teluguTitle = results['Telugu']?.trim();
      const englishTitle = results['Latin']?.trim();
      if (!teluguTitle || !englishTitle) continue;

      // 3) Find the Telugu stotra by the converted Telugu title
      const teluguDoc = await db.collection('stotras').findOne({ lang: { $regex: '^Telugu$', $options: 'i' }, title: teluguTitle });
      if (!teluguDoc) {
        continue; // No Telugu counterpart
      }

      // 4) Update subtitle with the English converted title
      const result = await db.collection('stotras').updateOne(
        { _id: teluguDoc._id },
        { $set: { subtitle: englishTitle, updateddt: new Date().toISOString() } }
      );
      if (result.modifiedCount > 0) {
        updatedCount += 1;
        console.log(`Updated telugu stotra '${teluguTitle}' with subtitle '${englishTitle}'`);
      }
    } catch (err) {
      console.error('Conversion/Update error for title:', title, err);
    }
  }

  console.log(`Done. Updated ${updatedCount} Telugu stotras with subtitles.`);
  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


