"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Video {
  _id: string;
  id: string;
  videourl: string;
  createddt: string;
}

function AddVideoModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [videourl, setVideourl] = useState("");
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
        body: JSON.stringify({ videourl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add video");
        setLoading(false);
        return;
      }
      setVideourl("");
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
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      setVideos(data.items || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // handle error
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchVideos(); }, [page, fetchVideos]);

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    
    setDeleteLoading(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete video");
        return;
      }
      fetchVideos();
    } catch (err) {
      alert("Error deleting video");
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Videos</h1>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add New Video</button>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 underline max-w-[320px] overflow-hidden text-ellipsis truncate">
                    <a href={video.videourl} target="_blank" rel="noopener noreferrer">{video.videourl}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(video.createddt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(video._id)} 
                      disabled={deleteLoading === video._id} 
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteLoading === video._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Previous</button>
            <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
      <AddVideoModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchVideos} />
    </div>
  );
} 