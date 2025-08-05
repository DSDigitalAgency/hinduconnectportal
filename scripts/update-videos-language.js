const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

async function updateVideosLanguage() {
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const videosCollection = db.collection('videos');
    
    // Find videos that don't have a language field
    const videosWithoutLanguage = await videosCollection.find({ 
      $or: [
        { language: { $exists: false } },
        { language: null }
      ]
    }).toArray();
    
    console.log(`Found ${videosWithoutLanguage.length} videos without language field`);
    
    if (videosWithoutLanguage.length === 0) {
      console.log('✅ All videos already have language field');
      return;
    }
    
    // Update videos to add language field
    const updatePromises = videosWithoutLanguage.map(video => 
      videosCollection.updateOne(
        { _id: video._id },
        { $set: { language: 'English', updateddt: new Date().toISOString() } }
      )
    );
    
    await Promise.all(updatePromises);
    
    console.log(`✅ Successfully updated ${videosWithoutLanguage.length} videos with language field`);
    
  } catch (error) {
    console.error('Error updating videos:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update script
updateVideosLanguage().catch(console.error); 