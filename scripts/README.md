# Database Import Scripts

This directory contains scripts for importing data into the HinduConnect MongoDB database.

## Biography Import Script

### Overview
The `import-biographies.js` script imports all biography markdown files from the `biographies/` folder into the MongoDB database.

### Prerequisites
1. Node.js installed
2. MongoDB connection string in `.env.local` file
3. `mongodb` npm package installed

### Setup
1. Make sure your `.env.local` file contains:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=hinduconnect
   ```

2. Install dependencies if not already installed:
   ```bash
   npm install mongodb dotenv
   ```

### Usage
Run the import script from the project root:

```bash
node scripts/import-biographies.js
```

### What the script does:
1. **Connects** to MongoDB using the connection string from environment variables
2. **Clears** the existing `biographies` collection (to avoid duplicates)
3. **Reads** all `.md` files from the `biographies/` folder
4. **Extracts** the title from the filename (removes `.md` extension)
5. **Reads** the full markdown content of each file
6. **Creates** a document with:
   - `title`: Filename without extension
   - `content`: Full markdown content
   - `createddt`: Current timestamp
   - `updateddt`: Current timestamp
7. **Inserts** each document into the `biographies` collection
8. **Creates** indexes for better performance:
   - Index on `title` field
   - Text index on `title` and `content` for full-text search
   - Index on `createddt` for sorting

### Output
The script will show:
- Number of files found
- Progress updates every 50 imports
- Final count of successful imports and errors
- Confirmation of index creation

### Example Output
```
Connected to MongoDB
Cleared existing biographies collection
Found 537 biography files
Imported 50 biographies...
Imported 100 biographies...
...
Import completed!
Successfully imported: 537 biographies
Errors: 0
Created indexes for better performance
Disconnected from MongoDB
```

### Error Handling
- If a file can't be read, it will log the error and continue with other files
- If MongoDB connection fails, the script will exit with an error message
- The script will always close the database connection properly

### Database Schema
After import, each biography document will have this structure:
```json
{
  "_id": "ObjectId",
  "title": "A.C. Bhaktivedanta Swami Prabhupada",
  "content": "**A.C. Bhaktivedanta Swami Prabhupada: A Detailed Biography**\n\n___\n\n### Early Life and Background...",
  "createddt": "2025-01-26T19:25:12.766Z",
  "updateddt": "2025-01-26T19:25:12.766Z"
}
```

### API Access
Once imported, biographies can be accessed via the API:
- `GET /api/biographies` - List all biographies with pagination
- `GET /api/biographies?search=swami` - Search biographies
- `POST /api/biographies` - Create new biography (admin only)

## Blog Management

**Note:** Blog import functionality has been integrated into the admin interface. You can now:

1. **Import Blogs**: Use the "Import Blogs" button in the admin-blogs page (`/admin-blogs`) to import all markdown files from the `posts/` directory
2. **Clear Blogs**: Use the "Clear All" button in the import modal to remove all existing blogs
3. **Manage Blogs**: Add, edit, delete, and manage individual blogs through the admin interface

The blog import functionality is now available through the web interface at `/admin-blogs` and no longer requires running separate scripts. 