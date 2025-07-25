import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
}
const safeUri = uri;
function getDbNameFromUri(uri) {
    // Try to extract db name from URI, fallback to 'hinduconnect'
    const match = uri.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?]+)/);
    return match && match[1] ? match[1] : 'hinduconnect';
}
async function listCollections() {
    const client = new MongoClient(safeUri);
    try {
        await client.connect();
        const dbName = getDbNameFromUri(safeUri);
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map((c) => c.name));
    }
    finally {
        await client.close();
    }
}
listCollections().catch(console.error);
