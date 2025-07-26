'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, BookOpen, Calendar, User } from 'lucide-react';

interface Biography {
  _id: string;
  title: string;
  content: string;
  createddt: string;
  updateddt: string;
}

interface BiographiesResponse {
  items: Biography[];
  total: number;
  page: number;
  limit: number;
}

export default function BiographiesPage() {
  const router = useRouter();
  const [biographies, setBiographies] = useState<Biography[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [jumpToPage, setJumpToPage] = useState("");

  const fetchBiographies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      
      const res = await fetch(`/api/biographies?${params}`);
      const data: BiographiesResponse = await res.json();
      
      setBiographies(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching biographies:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchBiographies();
  }, [page, search, fetchBiographies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBiographies();
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= Math.ceil(total / limit)) {
      setPage(pageNum);
      setJumpToPage("");
    }
  };

  const handleDelete = async (biographyId: string) => {
    if (!confirm("Are you sure you want to delete this biography?")) return;
    
    setDeleteLoading(biographyId);
    try {
      const res = await fetch(`/api/biographies/${biographyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete biography");
        return;
      }
      fetchBiographies();
    } catch (err) {
      alert("Error deleting biography");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (biography: Biography) => {
    router.push(`/biographies/edit/${biography._id}`);
  };

  const handleView = (biography: Biography) => {
    router.push(`/biographies/${biography._id}`);
  };

  const totalPages = Math.ceil(total / limit);

  const truncateContent = (content: string, maxLength: number = 100) => {
    const plainText = content.replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Biographies</h1>
        <button
          onClick={() => router.push('/biographies/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Biography
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or content..."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TITLE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PREVIEW</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {biographies.map((biography) => (
                <tr key={biography._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    <div className="truncate max-w-[300px]" title={biography.title}>
                      {biography.title}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="truncate max-w-[400px]" title={truncateContent(biography.content, 150)}>
                      {truncateContent(biography.content, 150)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(biography.createddt)}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(biography)} className="text-green-600 hover:text-green-900">View</button>
                      <button onClick={() => handleEdit(biography)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(biography._id)} disabled={deleteLoading === biography._id} className="text-red-600 hover:text-red-900 disabled:opacity-50">{deleteLoading === biography._id ? "Deleting..." : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <form onSubmit={handleJumpToPage} className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Page</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                className="w-16 p-1 border border-gray-300 rounded text-sm"
                placeholder={page.toString()}
              />
              <span className="text-sm text-gray-700">of {totalPages}</span>
              <button
                type="submit"
                className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Go
              </button>
            </form>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 