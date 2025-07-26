"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stotra {
  _id: string;
  title: string;
  text: string;
  lang: string;
  createddt: string;
  updateddt: string;
}

export default function AdminStotrasPage() {
  const [stotras, setStotras] = useState<Stotra[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [jumpToPage, setJumpToPage] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    language: "",
  });

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

  const fetchStotras = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (filters.language) params.append("language", filters.language);
      
      const res = await fetch(`/api/stotras?${params}`);
      const data = await res.json();
      
      setStotras(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching stotras:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters, limit]);

  useEffect(() => {
    fetchStotras();
  }, [page, search, filters, fetchStotras]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStotras();
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= Math.ceil(total / limit)) {
      setPage(pageNum);
      setJumpToPage("");
    }
  };

  const handleDelete = async (stotraId: string) => {
    if (!confirm("Are you sure you want to delete this stotra?")) return;
    
    setDeleteLoading(stotraId);
    try {
      const res = await fetch(`/api/stotras/${stotraId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete stotra");
        return;
      }
      fetchStotras();
    } catch (err) {
      alert("Error deleting stotra");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (stotra: Stotra) => {
    router.push(`/admin-stotras/edit/${stotra._id}`);
  };

  const totalPages = Math.ceil(total / limit);

  // Static filter options - updated based on actual data
  const allLanguages = [
    'Devanagari', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Itrans'
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Stotras</h1>
        <button
          onClick={() => router.push('/admin-stotras/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Stotra
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or text..."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">All Languages</option>
                {allLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[400px] w-[400px]">TITLE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">LANGUAGE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stotras.map((stotra) => (
                <tr key={stotra._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 max-w-[400px] w-[400px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="truncate" title={stotra.title}>
                      {stotra.title}
                    </div>
                  </td>
                  <td className="px-4 py-4 w-[120px] text-sm text-gray-900 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {stotra.lang}
                    </span>
                  </td>
                  <td className="px-4 py-4 w-[100px] text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(stotra)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(stotra._id)} disabled={deleteLoading === stotra._id} className="text-red-600 hover:text-red-900 disabled:opacity-50">{deleteLoading === stotra._id ? "Deleting..." : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Go to page:</span>
              <form onSubmit={handleJumpToPage} className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  className="w-16 p-1 border border-gray-300 rounded text-sm"
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Go
                </button>
              </form>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 