"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Video {
  _id: string;
  id: string;
  videourl: string;
  title: string;
  category: string;
  createddt: string;
  updateddt?: string;
}

function AddVideoModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [videourl, setVideourl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videourl, title, category }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add video");
        setLoading(false);
        return;
      }
      setVideourl("");
      setTitle("");
      setCategory("General");
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Network error");
      } else {
        setError("An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Video</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              placeholder="Enter video title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="General">General</option>
              <option value="Antyesti">Antyesti</option>
              <option value="Ayurveda">Ayurveda</option>
              <option value="Festivals">Festivals</option>
              <option value="Knowledge">Knowledge</option>
              <option value="Nature">Nature</option>
              <option value="Shastras">Shastras</option>
              <option value="Worship">Worship</option>
              <option value="Yoga">Yoga</option>
              <option value="Music">Music</option>
              <option value="Movies">Movies</option>
              <option value="Pravachanas">Pravachanas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL *</label>
            <input
              type="url"
              value={videourl}
              onChange={e => setVideourl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? "Adding..." : "Add Video"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const router = useRouter();

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

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.append('search', search);
      if (filterCategory) params.append('category', filterCategory);
      
      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();
      setVideos(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterCategory]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    setDeleteLoading(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete video');
      } else {
        fetchVideos();
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const categoryOptions = [
    "General", "Antyesti", "Ayurveda", "Festivals", "Knowledge", 
    "Nature", "Shastras", "Worship", "Yoga", "Music", 
    "Movies", "Pravachanas"
  ];

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Manage Videos</h1>
          <p className="text-gray-600 mt-1">Total: {total} videos in database</p>
        </div>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => setShowAddModal(true)}
        >
          <span role="img" aria-label="add">➕</span> Add New Video
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-4 py-2 rounded transition"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setFilterCategory("");
              setPage(1);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-black font-bold px-3 py-2 rounded transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-x-auto rounded-2xl shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-orange-100 z-10 rounded-t-2xl">
            <tr>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tl-2xl">Video Info</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Category</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">URL</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Timestamps</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><span className="animate-spin inline-block mr-2">🌀</span>Loading...</td></tr>
            ) : videos.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12">No videos found.</td></tr>
            ) : (
              videos.map((video, idx) => (
                <tr key={video._id} className={
                  `transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}
                >
                  <td className="border-b px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{video.title}</div>
                      <div className="text-xs text-gray-500 font-mono" title={video.id}>
                        ID: {video.id}
                      </div>
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">{video.category}</div>
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-sm">
                      <a 
                        href={video.videourl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {video.videourl}
                      </a>
                      {getVideoId(video.videourl) && (
                        <div className="text-xs text-gray-500 mt-1">
                          🎥 Video ID: {getVideoId(video.videourl)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div className="text-gray-600">
                        📅 Created: {formatDate(video.createddt)}
                      </div>
                      {video.updateddt && (
                        <div className="text-gray-600">
                          🔄 Updated: {formatDate(video.updateddt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border-b px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-400 hover:bg-red-600 text-black font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        title="Delete"
                        onClick={() => handleDelete(video._id)}
                        disabled={deleteLoading === video._id}
                      >
                        {deleteLoading === video._id ? <span className="animate-spin">🗑️</span> : <span role="img" aria-label="delete">🗑️</span>} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 items-center justify-center mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
        >
          ← Previous
        </button>
        <span className="font-semibold text-base">Page {page} of {Math.ceil(total / limit) || 1} ({total} total videos)</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(total / limit)}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
        >
          Next →
        </button>
      </div>

      <AddVideoModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchVideos} 
      />
    </div>
  );
} 