"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Antyesti', 'Astrology', 'Ayurveda', 'Festivals', 'General', 
  'Knowledge', 'Nature', 'Shastras', 'Worship', 'Yoga'
];

export default function AddBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState("draft");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: { title, status, category },
          author: { authorName },
          content: { body: content, language },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add blog");
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/blogs');
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Add New Blog</h1>
          <button
            onClick={() => router.push('/blogs')}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            Back to Blogs
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Category *</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Author Name *</label>
                <input 
                  type="text" 
                  value={authorName} 
                  onChange={e => setAuthorName(e.target.value)} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Language</label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div className="mb-8">
              <label className="block mb-2 font-medium text-gray-700">Content *</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-orange-500" 
                required 
                placeholder="Write your blog content here..."
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-6 rounded-lg transition disabled:opacity-50" 
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Blog"}
              </button>
              <button 
                type="button"
                onClick={() => router.push('/blogs')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 