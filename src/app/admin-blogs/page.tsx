"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Blog {
  _id: string;
  blogId: string;
  basicInfo: {
    title: string;
    status: string;
    category: string;
    slug: string;
  };
  author: {
    authorName: string;
  };
  content: {
    body: string;
    language: string;
  };
}

const CATEGORIES = [
  'Antyesti', 'Astrology', 'Ayurveda', 'Festivals', 'General', 
  'Knowledge', 'Nature', 'Shastras', 'Worship', 'Yoga'
];







export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jumpPage, setJumpPage] = useState("");

  // Session check
  React.useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/');
        }
      });
  }, [router]);

  const fetchBlogs = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('search', search);
    fetch(`/api/blogs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setBlogs(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blogs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, [page, limit, search]);

  const totalPages = Math.ceil(total / limit);

  // Placeholder handlers
  const handleEdit = (blog: Blog) => {
    router.push(`/admin-blogs/edit/${blog._id}`);
  };
  const handleDelete = async (blog: Blog) => {
    if (!window.confirm(`Are you sure you want to delete blog: ${blog.basicInfo?.title}?`)) return;
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete blog');
      } else {
        fetchBlogs();
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
        <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Manage Blogs</h1>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => router.push('/admin-blogs/add')}
        >
          <span role="img" aria-label="add">➕</span> Add New Blog
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search blogs by title, content, or author..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setSearch(searchInput)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => setSearch(searchInput)}
            className="px-6 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); }}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{total}</div>
          <div className="text-gray-600">Total Blogs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {blogs.filter(b => b.basicInfo?.status === 'published').length}
          </div>
          <div className="text-gray-600">Published</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {blogs.filter(b => b.basicInfo?.status === 'draft').length}
          </div>
          <div className="text-gray-600">Drafts</div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Language</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-orange-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">Loading blogs...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">No blogs found.</td></tr>
              ) : (
                blogs.map((blog, idx) => (
                  <tr key={blog._id} className={
                    `transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}
                  >
                    <td className="border-b px-4 py-2 font-mono align-middle text-left" title={blog.blogId}>{blog.blogId?.slice(0, 8) || ''}…</td>
                    <td className="border-b px-4 py-2 font-medium align-middle text-left">{blog.basicInfo?.title}</td>
                    <td className="border-b px-4 py-2 align-middle text-left">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {blog.basicInfo?.category}
                      </span>
                    </td>
                    <td className="border-b px-4 py-2 align-middle text-left">{blog.author?.authorName || ''}</td>
                    <td className="border-b px-4 py-2 align-middle text-left">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        blog.basicInfo?.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.basicInfo?.status}
                      </span>
                    </td>
                    <td className="border-b px-4 py-2 align-middle text-left">{blog.content?.language}</td>
                    <td className="border-b px-4 py-2 align-middle text-center whitespace-nowrap">
                      <span className="inline-block">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1 mr-2 rounded bg-blue-400 hover:bg-blue-600 text-white font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          title="View"
                          onClick={() => router.push(`/admin-blogs/view/${blog._id}`)}
                        >
                          <span role="img" aria-label="view">👁️</span> View
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1 mr-2 rounded bg-orange-400 hover:bg-orange-600 text-black font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          title="Edit"
                          onClick={() => handleEdit(blog)}
                        >
                          <span role="img" aria-label="edit">✏️</span> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-400 hover:bg-red-600 text-black font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                          title="Delete"
                          onClick={() => handleDelete(blog)}
                        >
                          <span role="img" aria-label="delete">🗑️</span> Delete
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setPage(parseInt(jumpPage) || 1)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Go to"
            />
            <button
              onClick={() => setPage(parseInt(jumpPage) || 1)}
              className="px-3 py-1 bg-orange-500 text-black text-sm rounded hover:bg-orange-600"
            >
              Go
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 