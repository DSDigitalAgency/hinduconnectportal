# HinduConnect Database Schema

## Collection: `videos`

### Document Structure

Each video document will have the following structure:

```json
{
  "_id": "ObjectId",
  "id": "string",
  "videourl": "string",
  "title": "string",
  "category": "string",
  "createddt": "string (ISO date)",
  "updateddt": "string (ISO date)"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | ObjectId | MongoDB auto-generated unique identifier | `688b931a8189531120c0975c` |
| `id` | String | Auto-generated unique video identifier | `"video_mdrkzq24_u5ph0x"` |
| `videourl` | String | YouTube or other video platform URL | `"https://youtu.be/OnTcMuv2Tsk"` |
| `title` | String | Title of the video | `"Bhagavad Gita Chapter 1 - Arjuna Vishada Yoga"` |
| `category` | String | Category of the video content | `"Bhajans"`, `"Discourses"`, `"Temple Tours"` |
| `createddt` | String | Creation timestamp (ISO format) | `"2025-07-31T16:00:26.285Z"` |
| `updateddt` | String | Last update timestamp (ISO format) | `"2025-07-31T16:00:26.285Z"` |

### Categories

The videos are organized into the following categories:
- **General**: General videos
- **Antyesti**: Funeral rites and ceremonies
- **Ayurveda**: Traditional Indian medicine and wellness
- **Festivals**: Festival celebrations and events
- **Knowledge**: Educational and informative content
- **Nature**: Natural world and environmental content
- **Shastras**: Sacred texts and scriptures
- **Worship**: Religious worship and rituals
- **Yoga**: Yoga and physical practices
- **Music**: Musical content and performances
- **Movies**: Film and entertainment content
- **Pravachanas**: Spiritual discourses and lectures

### Example Document

```json
{
  "_id": ObjectId("688b931a8189531120c0975c"),
  "id": "video_mdrkzq24_u5ph0x",
  "videourl": "https://youtu.be/OnTcMuv2Tsk",
  "title": "Bhagavad Gita Chapter 1 - Arjuna Vishada Yoga",
  "category": "Shastras",
  "createddt": "2025-07-31T16:00:26.285Z",
  "updateddt": "2025-07-31T16:00:26.285Z"
}
```

### Database Operations

#### Insert New Video
```javascript
db.videos.insertOne({
  id: "video_timestamp_random",
  videourl: "https://youtu.be/example",
  title: "Video Title",
  category: "Shastras",
  createddt: new Date().toISOString(),
  updateddt: new Date().toISOString()
})
```

#### Find Videos by Category
```javascript
db.videos.find({ category: "Shastras" })
```

#### Find Videos by Title (Partial Match)
```javascript
db.videos.find({ title: { $regex: "Bhagavad", $options: "i" } })
```

#### Search in Title and Category
```javascript
db.videos.find({
  $or: [
    { title: { $regex: "yoga", $options: "i" } },
    { category: { $regex: "yoga", $options: "i" } }
  ]
})
```

#### Update Video
```javascript
db.videos.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      title: "Updated Title",
      category: "Worship",
      updateddt: new Date().toISOString()
    }
  }
)
```

#### Delete Video
```javascript
db.videos.deleteOne({ _id: ObjectId("...") })
```

### Indexes (Recommended)

```javascript
// Index on id for unique identification
db.videos.createIndex({ id: 1 }, { unique: true })

// Index on category for filtering
db.videos.createIndex({ category: 1 })

// Index on title for search functionality
db.videos.createIndex({ title: 1 })

// Text index for full-text search
db.videos.createIndex({ title: "text", category: "text" })

// Index on creation date for sorting
db.videos.createIndex({ createddt: -1 })
```

### Expected Data Volume

Based on typical video content:
- **Total Videos**: 100+ videos across various categories
- **Categories**: 12 main categories covering different aspects of Hindu culture and spirituality
- **Content**: YouTube and other video platform URLs

### Benefits of This Structure

1. **Simple & Clean**: Minimal fields, easy to understand
2. **Organized**: Clear categorization for easy browsing
3. **Searchable**: Full-text search across titles and categories
4. **Scalable**: Easy to add more videos or categories
5. **Performance**: Lightweight documents, fast queries
6. **Compatible**: Works with existing frontend patterns

---

## Collection: `temples`

### Document Structure

Each temple document will have the following structure:

```json
{
  "_id": "ObjectId",
  "category": "string",
  "title": "string",
  "text": "string",
  "createddt": "string (ISO date)",
  "updateddt": "string (ISO date)"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | ObjectId | MongoDB auto-generated unique identifier | `686d3db5f85d5e5ed6ab0f2f` |
| `category` | String | Category/folder name from Temples directory | `"Andhra_Pradesh_Temples"`, `"Tamilnadu_Temples"` |
| `title` | String | Title extracted from filename (without .md extension) | `"1000 Pillar Temple Addanki Prakasam"` |
| `text` | String | Full markdown content of the temple file | `"**1000 Pillar Temple – Addanki, Prakasam District, Andhra Pradesh**\n\n___\n\n**1. Introduction**..."` |
| `createddt` | String | Creation timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |
| `updateddt` | String | Last update timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |

### Categories

The temples are organized into the following categories based on the Temples folder structure:
- **108_Divya_Desham_Temples**: 133 temples
- **108_Shiva_Temples_Kerala**: 106 temples  
- **12_Jyotirlingam_Temples**: 9 temples
- **51_Shakti_Peetham_Temples**: 58 temples
- **Andaman_Nicobar_Temples**: 1 temple
- **Andhra_Pradesh_Temples**: 352 temples
- **Arunachal_Pradesh_Temples**: 3 temples
- **Assam_Temples**: 42 temples
- **Bihar_Temples**: 114 temples
- **Chandigarh_Temples**: 2 temples
- **Chattisgarh_Temples**: 30 temples
- **Delhi_Temples**: 22 temples
- **Goa_Temples**: 27 temples
- **Gujarat_Temples**: 118 temples
- **Haryana_Temples**: 40 temples
- **Himachal_Pradesh_Temples**: 31 temples
- **International_Temples**: 71 temples
- **Jammu_Kashmir_Temples**: 37 temples
- **Jharkhand_Temples**: 23 temples
- **Karnataka_Temples**: 479 temples
- **Kerala_Temples**: 370 temples
- **Madhya_Pradesh_Temples**: 87 temples
- **Maharashtra_Temples**: 212 temples
- **Manipur_Temples**: 3 temples
- **Meghalaya_Temples**: 1 temple
- **Nagaland_Temples**: 1 temple
- **Nepal_Temples**: 7 temples
- **Odisha_Temples**: 291 temples
- **Puducherry_Temples**: 8 temples
- **Punjab_Temples**: 15 temples
- **Rajasthan_Temples**: 119 temples
- **Sikkim_Temples**: 3 temples
- **Tamilnadu_Temples**: 1362 temples
- **Telangana_Temples**: 406 temples
- **Tripura_Temples**: 3 temples
- **Uttar_Pradesh_Temples**: 164 temples
- **Uttarakhand_Temples**: 59 temples
- **West_Bengal_Temples**: 106 temples

### Example Document

```json
{
  "_id": ObjectId("686d3db5f85d5e5ed6ab0f2f"),
  "category": "Andhra_Pradesh_Temples",
  "title": "1000 Pillar Temple Addanki Prakasam",
  "text": "**1000 Pillar Temple – Addanki, Prakasam District, Andhra Pradesh**\n\n___\n\n**1. Introduction**\nThe 1000 Pillar Temple of Addanki, located in Prakasam district of Andhra Pradesh, is a historical and architectural marvel...",
  "createddt": "2025-01-26T19:25:12.766Z",
  "updateddt": "2025-01-26T19:25:12.766Z"
}
```

### Database Operations

#### Insert New Temple
```javascript
db.temples.insertOne({
  category: "Andhra_Pradesh_Temples",
  title: "Temple Name",
  text: "Full temple content...",
  createddt: new Date().toISOString(),
  updateddt: new Date().toISOString()
})
```

#### Find Temples by Category
```javascript
db.temples.find({ category: "Andhra_Pradesh_Temples" })
```

#### Find Temples by Title (Partial Match)
```javascript
db.temples.find({ title: { $regex: "Temple", $options: "i" } })
```

#### Search in Title and Text
```javascript
db.temples.find({
  $or: [
    { title: { $regex: "Shiva", $options: "i" } },
    { text: { $regex: "Shiva", $options: "i" } }
  ]
})
```

#### Update Temple
```javascript
db.temples.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      title: "Updated Title",
      text: "Updated content...",
      updateddt: new Date().toISOString()
    }
  }
)
```

#### Delete Temple
```javascript
db.temples.deleteOne({ _id: ObjectId("...") })
```

### Indexes (Recommended)

```javascript
// Index on category for faster queries
db.temples.createIndex({ category: 1 })

// Index on title for search functionality
db.temples.createIndex({ title: 1 })

// Text index for full-text search
db.temples.createIndex({ title: "text", text: "text" })

// Index on creation date for sorting
db.temples.createIndex({ createddt: -1 })
```

### Expected Data Volume

Based on the Temples folder structure:
- **Total Files**: 5,000+ temple markdown files
- **Categories**: 35+ categories covering all Indian states and special temple categories
- **Content**: Rich markdown content with detailed temple information

### Benefits of This Structure

1. **Simple & Clean**: Minimal fields, easy to understand
2. **Organized**: Clear categorization by state/region
3. **Searchable**: Full-text search across titles and content
4. **Scalable**: Easy to add more temples or categories
5. **Performance**: Lightweight documents, fast queries
6. **Compatible**: Works with existing frontend patterns

---

## Collection: `stotras`

### Document Structure

Each stotra document will have the following structure:

```json
{
  "_id": "ObjectId",
  "title": "string",
  "text": "string", 
  "lang": "string",
  "createddt": "string (ISO date)",
  "updateddt": "string (ISO date)"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | ObjectId | MongoDB auto-generated unique identifier | `686d3db5f85d5e5ed6ab0f2f` |
| `title` | String | Title of the stotra (extracted from filename) | `"ॐ नमो भगवति चामुण्डे"` |
| `text` | String | Full content of the stotra text | `"ॐ नमो भगवति चामुण्डे...\n[full text content]"` |
| `lang` | String | Language folder name | `"Devanagari"`, `"Tamil"`, `"Telugu"`, etc. |
| `createddt` | String | Creation timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |
| `updateddt` | String | Last update timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |

### Language Values

The `lang` field will contain one of these values based on the folder names:
- `"Devanagari"`
- `"Tamil"` 
- `"Telugu"`
- `"Malayalam"`
- `"Kannada"`
- `"Itrans"`

### Example Document

```json
{
  "_id": ObjectId("686d3db5f85d5e5ed6ab0f2f"),
  "title": "ॐ नमो भगवति चामुण्डे",
  "text": "ॐ नमो भगवति चामुण्डे\nनमो नीलसरस्वति\nस्वाहा स्वधा नमो नित्यं\nगणरूपाय वै नमः\n\n[rest of the stotra text...]",
  "lang": "Devanagari",
  "createddt": "2025-01-26T19:25:12.766Z",
  "updateddt": "2025-01-26T19:25:12.766Z"
}
```

### Database Operations

#### Insert New Stotra
```javascript
db.stotras.insertOne({
  title: "Stotra Title",
  text: "Full stotra content...",
  lang: "Devanagari",
  createddt: new Date().toISOString(),
  updateddt: new Date().toISOString()
})
```

#### Find Stotras by Language
```javascript
db.stotras.find({ lang: "Devanagari" })
```

#### Find Stotras by Title (Partial Match)
```javascript
db.stotras.find({ title: { $regex: "श्री", $options: "i" } })
```

#### Update Stotra
```javascript
db.stotras.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      title: "Updated Title",
      text: "Updated content...",
      updateddt: new Date().toISOString()
    }
  }
)
```

#### Delete Stotra
```javascript
db.stotras.deleteOne({ _id: ObjectId("...") })
```

### Indexes (Recommended)

```javascript
// Index on language for faster queries
db.stotras.createIndex({ lang: 1 })

// Index on title for search functionality
db.stotras.createIndex({ title: 1 })

// Text index for full-text search
db.stotras.createIndex({ title: "text", text: "text" })

// Index on creation date for sorting
db.stotras.createIndex({ createddt: -1 })
```

### Expected Data Volume

Based on the folder structure:
- **Devanagari**: ~100+ files
- **Tamil**: Multiple files
- **Telugu**: Multiple files  
- **Malayalam**: Multiple files
- **Kannada**: Multiple files
- **Itrans**: Multiple files

**Total**: Expected several hundred stotra documents

### Benefits of This Structure

1. **Simple & Clean**: Minimal fields, easy to understand
2. **Language Organization**: Clear separation by language
3. **Searchable**: Text content can be searched
4. **Scalable**: Easy to add more languages or fields later
5. **Performance**: Lightweight documents, fast queries
6. **Compatible**: Works with existing frontend code

---

## Collection: `biographies`

### Document Structure

Each biography document will have the following structure:

```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string", 
  "createddt": "string (ISO date)",
  "updateddt": "string (ISO date)"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | ObjectId | MongoDB auto-generated unique identifier | `686d3db5f85d5e5ed6ab0f2f` |
| `title` | String | Title of the biography (extracted from filename) | `"A.C. Bhaktivedanta Swami Prabhupada"` |
| `content` | String | Full markdown content of the biography | `"**A.C. Bhaktivedanta Swami Prabhupada: A Detailed Biography**\n\n___\n\n### Early Life and Background..."` |
| `createddt` | String | Creation timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |
| `updateddt` | String | Last update timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |

### Example Document

```json
{
  "_id": ObjectId("686d3db5f85d5e5ed6ab0f2f"),
  "title": "A.C. Bhaktivedanta Swami Prabhupada",
  "content": "**A.C. Bhaktivedanta Swami Prabhupada: A Detailed Biography**\n\n___\n\n### Early Life and Background\n\n**Birth Name**: Abhay Charanaravinda Bhaktivedanta Swami Prabhupada...",
  "createddt": "2025-01-26T19:25:12.766Z",
  "updateddt": "2025-01-26T19:25:12.766Z"
}
```

### Database Operations

#### Insert New Biography
```javascript
db.biographies.insertOne({
  title: "Biography Title",
  content: "Full biography content...",
  createddt: new Date().toISOString(),
  updateddt: new Date().toISOString()
})
```

#### Find Biographies by Title (Partial Match)
```javascript
db.biographies.find({ title: { $regex: "Swami", $options: "i" } })
```

#### Find Biographies by Content Search
```javascript
db.biographies.find({ content: { $regex: "Krishna", $options: "i" } })
```

#### Update Biography
```javascript
db.biographies.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      title: "Updated Title",
      content: "Updated content...",
      updateddt: new Date().toISOString()
    }
  }
)
```

#### Delete Biography
```javascript
db.biographies.deleteOne({ _id: ObjectId("...") })
```

### Indexes (Recommended)

```javascript
// Index on title for faster queries
db.biographies.createIndex({ title: 1 })

// Text index for full-text search
db.biographies.createIndex({ title: "text", content: "text" })

// Index on creation date for sorting
db.biographies.createIndex({ createddt: -1 })
```

### Expected Data Volume

Based on the biographies folder structure:
- **Total Files**: 537+ biography markdown files
- **Content**: Rich markdown content with detailed biographical information
- **Categories**: Includes saints, deities, historical figures, and spiritual leaders

### Benefits of This Structure

1. **Simple & Clean**: Minimal fields, easy to understand
2. **Rich Content**: Preserves all markdown formatting and structure
3. **Searchable**: Full-text search across titles and content
4. **Scalable**: Easy to add more biographies or fields later
5. **Performance**: Optimized with proper indexes
6. **Compatible**: Works with existing frontend patterns

---

## Collection: `blogs`

### Document Structure

Each blog document will have the following structure:

```json
{
  "_id": "ObjectId",
  "blogId": "string",
  "basicInfo": {
    "title": "string",
    "slug": "string",
    "status": "string",
    "category": "string"
  },
  "author": {
    "authorName": "string"
  },
  "content": {
    "body": "string",
    "language": "string"
  },
  "createddt": "string (ISO date)",
  "updateddt": "string (ISO date)"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | ObjectId | MongoDB auto-generated unique identifier | `686d3db5f85d5e5ed6ab0f2f` |
| `blogId` | String | Unique identifier for the blog | `"blog_abc123"` |
| `basicInfo.title` | String | Title of the blog post | `"Akshaya Tritiya Festival"` |
| `basicInfo.slug` | String | URL-friendly slug generated from title | `"akshaya-tritiya-festival"` |
| `basicInfo.status` | String | Publication status | `"published"`, `"draft"` |
| `basicInfo.category` | String | Category/folder name | `"Festivals"`, `"Knowledge"`, `"General"` |
| `author.authorName` | String | Author name | `"Hindu Connect"` |
| `content.body` | String | Full markdown content of the blog post | `"**Akshaya Tritiya Festival...**"` |
| `content.language` | String | Language of the content | `"English"`, `"Hindi"`, `"Sanskrit"` |
| `createddt` | String | Creation timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |
| `updateddt` | String | Last update timestamp (ISO format) | `"2025-01-26T19:25:12.766Z"` |

### Categories

The blogs are organized into the following categories based on the posts folder structure:
- **Antyesti**: Funeral rites and ceremonies
- **Astrology**: Astrological concepts and practices
- **Ayurveda**: Traditional Indian medicine
- **Festivals**: Hindu festivals and celebrations
- **General**: General topics and concepts
- **Knowledge**: Philosophical and spiritual knowledge
- **Nature**: Natural elements and sacred geography
- **Shastras**: Sacred texts and scriptures
- **Worship**: Worship practices and rituals
- **Yoga**: Yoga philosophy and practices

### Example Document

```json
{
  "_id": ObjectId("686d3db5f85d5e5ed6ab0f2f"),
  "blogId": "blog_abc123",
  "basicInfo": {
    "title": "Akshaya Tritiya Festival",
    "slug": "akshaya-tritiya-festival",
    "status": "published",
    "category": "Festivals"
  },
  "author": {
    "authorName": "Hindu Connect"
  },
  "content": {
    "body": "**Akshaya Tritiya Festival – A Detailed Scriptural, Symbolic, and Philosophical Exposition**\n\n___\n\n### 🔱 **Etymology and Meaning**\n\n**Akshaya Tritiya** is a sacred and highly auspicious festival...",
    "language": "English"
  },
  "createddt": "2025-01-26T19:25:12.766Z",
  "updateddt": "2025-01-26T19:25:12.766Z"
}
```

### Database Operations

#### Insert New Blog
```javascript
db.blogs.insertOne({
  blogId: "blog_abc123",
  basicInfo: {
    title: "Sample Blog",
    slug: "sample-blog",
    status: "draft",
    category: "General"
  },
  author: {
    authorName: "Hindu Connect"
  },
  content: {
    body: "Sample markdown content...",
    language: "English"
  },
  createddt: new Date().toISOString(),
  updateddt: new Date().toISOString()
})
```

#### Find Blogs by Category
```javascript
db.blogs.find({ "basicInfo.category": "Festivals" })
```

#### Find Blogs by Author
```javascript
db.blogs.find({ "author.authorName": "Hindu Connect" })
```

#### Find Published Blogs
```javascript
db.blogs.find({ "basicInfo.status": "published" })
```

#### Search in Title and Content
```javascript
db.blogs.find({
  $or: [
    { "basicInfo.title": { $regex: "festival", $options: "i" } },
    { "content.body": { $regex: "festival", $options: "i" } }
  ]
})
```

#### Update Blog
```javascript
db.blogs.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      "basicInfo.title": "Updated Title",
      "basicInfo.slug": "updated-title",
      "content.body": "Updated content...",
      "updateddt": new Date().toISOString()
    }
  }
)
```

#### Delete Blog
```javascript
db.blogs.deleteOne({ _id: ObjectId("...") })
```

### Indexes (Recommended)

```javascript
// Index on blogId for unique identification
db.blogs.createIndex({ blogId: 1 }, { unique: true })

// Index on title for faster queries
db.blogs.createIndex({ "basicInfo.title": 1 })

// Index on category for filtering
db.blogs.createIndex({ "basicInfo.category": 1 })

// Index on status for filtering published/draft blogs
db.blogs.createIndex({ "basicInfo.status": 1 })

// Index on slug for URL routing
db.blogs.createIndex({ "basicInfo.slug": 1 }, { unique: true })

// Index on author for filtering
db.blogs.createIndex({ "author.authorName": 1 })

// Index on creation date for sorting
db.blogs.createIndex({ createddt: -1 })

// Text search index for title and content
db.blogs.createIndex({ "basicInfo.title": "text", "content.body": "text" })
```

### Expected Data Volume

Based on the posts folder structure:
- **Total Files**: 288+ blog markdown files across 10 categories
- **Content**: Rich markdown content with detailed articles
- **Categories**: 10 main categories covering various aspects of Hindu culture and spirituality

### Benefits of This Structure

1. **Organized**: Clear categorization for easy navigation
2. **Rich Content**: Preserves all markdown formatting and structure
3. **Searchable**: Full-text search across titles and content
4. **Author Attribution**: Clear author information
5. **Language Support**: Ready for multilingual content
6. **Status Management**: Draft/published status for content management
7. **URL-Friendly**: Automatic slug generation for clean URLs
8. **Performance**: Optimized with proper indexes 