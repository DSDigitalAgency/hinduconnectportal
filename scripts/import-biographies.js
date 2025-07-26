const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

async function importBiographies() {
  if (!uri) {
    console.error('MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('biographies');
    
    // Clear existing biographies collection
    await collection.deleteMany({});
    console.log('Cleared existing biographies collection');
    
    // Read biographies directory
    const biographiesDir = path.join(__dirname, '..', 'biographies');
    const files = fs.readdirSync(biographiesDir);
    
    console.log(`Found ${files.length} biography files`);
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        try {
          const filePath = path.join(biographiesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Extract title from filename (remove .md extension)
          const title = file.replace(/\.md$/, '');
          
          // Create document
          const doc = {
            title: title,
            content: content,
            createddt: new Date().toISOString(),
            updateddt: new Date().toISOString(),
          };
          
          // Insert into database
          await collection.insertOne(doc);
          importedCount++;
          
          if (importedCount % 50 === 0) {
            console.log(`Imported ${importedCount} biographies...`);
          }
          
        } catch (error) {
          console.error(`Error importing ${file}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\nImport completed!`);
    console.log(`Successfully imported: ${importedCount} biographies`);
    console.log(`Errors: ${errorCount}`);
    
    // Create indexes for better performance
    await collection.createIndex({ title: 1 });
    await collection.createIndex({ title: "text", content: "text" });
    await collection.createIndex({ createddt: -1 });
    console.log('Created indexes for better performance');
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importBiographies().catch(console.error); 