const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'hinduconnect';

async function createAdmin() {
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const adminsCollection = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ email: 'admin@hinduconnect.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      email: 'admin@hinduconnect.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createddt: new Date().toISOString(),
      updateddt: new Date().toISOString()
    };
    
    await adminsCollection.insertOne(adminUser);
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@hinduconnect.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
createAdmin().catch(console.error); 