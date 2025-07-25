"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Blog {
  _id: string;
  blogId: string;
  basicInfo: {
    title: string;
    status: string;
  };
  author: {
    authorName: string;
  };
  content: {
    body: string;
  };
}

function AddBlogModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
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
          basicInfo: { title, status },
          author: { authorName },
          content: { body: content },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add blog");
        setLoading(false);
        return;
      }
      setLoading(false);
      // Clear form fields
      setTitle("");
      setAuthorName("");
      setStatus("draft");
      setContent("");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-xl font-bold text-orange-600">×</button>
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Add New Blog</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Author Name</label>
          <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border px-3 py-2 rounded min-h-[100px]" required />
        </div>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded transition" disabled={loading}>
          {loading ? "Adding..." : "Add Blog"}
        </button>
      </form>
    </div>
  );
}

function EditBlogModal({ open, onClose, onSuccess, blog }: { open: boolean; onClose: () => void; onSuccess: () => void; blog: Blog | null }) {
  const [title, setTitle] = useState(blog?.basicInfo?.title || "");
  const [authorName, setAuthorName] = useState(blog?.author?.authorName || "");
  const [status, setStatus] = useState(blog?.basicInfo?.status || "draft");
  const [content, setContent] = useState(blog?.content?.body || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(blog?.basicInfo?.title || "");
    setAuthorName(blog?.author?.authorName || "");
    setStatus(blog?.basicInfo?.status || "draft");
    setContent(blog?.content?.body || "");
  }, [blog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blogs/${blog?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: { title, status },
          author: { authorName },
          content: { body: content },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update blog");
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-xl font-bold text-orange-600">×</button>
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Edit Blog</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Author Name</label>
          <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border px-3 py-2 rounded min-h-[100px]" required />
        </div>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded transition" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);

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
    setEditBlog(blog);
    setShowEditModal(true);
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
      <AddBlogModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchBlogs} />
      <EditBlogModal open={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchBlogs} blog={editBlog} />
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Manage Blogs</h1>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => setShowAddModal(true)}
        >
          <span role="img" aria-label="add">➕</span> Add New Blog
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <form
          onSubmit={e => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Search by title, content, or author..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-64"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-4 py-2 rounded transition">Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="bg-gray-200 hover:bg-gray-300 text-black font-bold px-3 py-2 rounded transition">Clear</button>
          )}
        </form>
        <form
          onSubmit={e => {
            e.preventDefault();
            const num = Number(jumpPage);
            if (num >= 1 && num <= totalPages) setPage(num);
          }}
          className="flex gap-2 items-center"
        >
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={e => setJumpPage(e.target.value)}
            placeholder="Page #"
            className="border px-2 py-2 rounded w-20"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-3 py-2 rounded transition">Go</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-orange-100 z-10 rounded-t-2xl">
            <tr>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tl-2xl">ID</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Title</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Author</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Status</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><span className="animate-spin inline-block mr-2">🌀</span>Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12">No blogs found.</td></tr>
            ) : (
              blogs.map((blog, idx) => (
                <tr key={blog._id} className={
                  `transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}
                >
                  <td className="border-b px-4 py-2 font-mono align-middle text-left" title={blog.blogId}>{blog.blogId?.slice(0, 8) || ''}…</td>
                  <td className="border-b px-4 py-2 font-medium align-middle text-left">{blog.basicInfo?.title}</td>
                  <td className="border-b px-4 py-2 align-middle text-left">{blog.author?.authorName || ''}</td>
                  <td className="border-b px-4 py-2 align-middle text-left">{blog.basicInfo?.status || ''}</td>
                  <td className="border-b px-4 py-2 align-middle text-center whitespace-nowrap">
                    <span className="inline-block">
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
      <div className="flex gap-2 items-center justify-center mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
        >
          ← Previous
        </button>
        <span className="font-semibold text-base">Page {page} of {totalPages || 1}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
        >
          Next →
        </button>
      </div>
    </div>
  );
} 