"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stotra {
  _id: string;
  stotraId: string;
  basicInfo: {
    title: string;
    category: string;
    deity: string;
    tradition: string;
    significance?: string;
  };
  content: {
    verses: number;
    length: string;
    difficulty: string;
  };
  authorship: {
    author?: string;
    period?: string;
    tradition?: string;
  };
  analytics: {
    viewCount: number;
    searchCount: number;
    favoriteCount: number;
    downloadCount: number;
  };
  languages: {
    devanagari?: unknown;
    sanskrit?: unknown;
    hindi?: unknown;
    english?: unknown;
  };
  version: {
    current: number;
    createdAt: string;
    updatedAt: string;
    changeLog: string[];
  };
}

interface AddStotraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editStotra?: Stotra | null;
}

function AddStotraModal({ isOpen, onClose, onSuccess, editStotra }: AddStotraModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "stotra",
    deity: "Universal",
    tradition: "Universal",
    significance: "",
    verses: 1,
    length: "short",
    difficulty: "beginner",
    author: "",
    period: "",
  });

  // Reset form when editStotra changes
  useEffect(() => {
    if (editStotra) {
      setFormData({
        title: editStotra.basicInfo.title,
        category: editStotra.basicInfo.category,
        deity: editStotra.basicInfo.deity,
        tradition: editStotra.basicInfo.tradition,
        significance: editStotra.basicInfo.significance || "",
        verses: editStotra.content.verses,
        length: editStotra.content.length,
        difficulty: editStotra.content.difficulty,
        author: editStotra.authorship.author || "",
        period: editStotra.authorship.period || "",
      });
    } else {
      setFormData({
        title: "",
        category: "stotra",
        deity: "Universal",
        tradition: "Universal",
        significance: "",
        verses: 1,
        length: "short",
        difficulty: "beginner",
        author: "",
        period: "",
      });
    }
  }, [editStotra]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = editStotra ? `/api/stotras/${editStotra._id}` : "/api/stotras";
      const method = editStotra ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: {
            title: formData.title,
            category: formData.category,
            deity: formData.deity,
            tradition: formData.tradition,
            significance: formData.significance || null,
          },
          content: {
            verses: formData.verses,
            structure: null,
            meter: null,
            length: formData.length,
            difficulty: formData.difficulty,
          },
          authorship: {
            author: formData.author || null,
            period: formData.period || null,
            tradition: formData.tradition || null,
            historicalContext: null,
          },
          analytics: {
            viewCount: editStotra?.analytics.viewCount || 0,
            searchCount: editStotra?.analytics.searchCount || 0,
            favoriteCount: editStotra?.analytics.favoriteCount || 0,
            downloadCount: editStotra?.analytics.downloadCount || 0,
            lastAccessed: null,
          },
          languages: {
            devanagari: {},
          },
          metadata: {
            sourceFiles: [],
            dataQuality: "medium",
            verified: false,
            transcriptionNote: null,
            completeness: 50,
          },
          pronunciation: {
            guide: null,
            audioUrl: null,
            phoneticTransliteration: null,
            accentMarks: null,
            specialInstructions: [],
          },
          references: {
            scripture: null,
            chapter: null,
            verse: null,
            tradition: null,
            relatedTexts: [],
          },
          related: {
            similarStotras: [],
            deityStotras: [],
            categoryStotras: [],
            complementaryTexts: [],
          },
          search: {
            keywords: [formData.title],
            firstLine: formData.title,
            searchableText: formData.title,
            phoneticSearch: [],
            deityKeywords: [],
          },
          usage: {
            occasions: ["general"],
            benefits: [],
            spiritualBenefits: [],
            materialBenefits: [],
            rules: [],
          },
          version: {
            current: editStotra ? editStotra.version.current + 1 : 1,
            createdAt: editStotra ? editStotra.version.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: "admin",
            changeLog: editStotra ? [...editStotra.version.changeLog, "Updated by admin"] : ["Initial creation"],
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || `Failed to ${editStotra ? 'update' : 'add'} stotra`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editStotra ? 'Edit Stotra' : 'Add New Stotra'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="stotra">Stotra</option>
                <option value="mantra">Mantra</option>
                <option value="sloka">Sloka</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deity</label>
              <input
                type="text"
                value={formData.deity}
                onChange={(e) =>
                  setFormData({ ...formData, deity: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tradition</label>
              <input
                type="text"
                value={formData.tradition}
                onChange={(e) =>
                  setFormData({ ...formData, tradition: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verses</label>
              <input
                type="number"
                value={formData.verses}
                onChange={(e) =>
                  setFormData({ ...formData, verses: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Significance</label>
            <textarea
              value={formData.significance}
              onChange={(e) =>
                setFormData({ ...formData, significance: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (editStotra ? "Updating..." : "Adding...") : (editStotra ? "Update Stotra" : "Add Stotra")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStotrasPage() {
  const [stotras, setStotras] = useState<Stotra[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStotra, setEditStotra] = useState<Stotra | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [jumpToPage, setJumpToPage] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    language: "",
  });

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
    setEditStotra(stotra);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditStotra(null);
  };

  const totalPages = Math.ceil(total / limit);

  // Get unique values for filters
  const uniqueLanguages = Array.from(new Set(stotras.map(s => s.languages?.devanagari ? 'Devanagari' : 'Other').filter(Boolean)));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Stotras</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Stotra
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stotras by title or content..."
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={filters.language}
              onChange={(e) => {
                setFilters({ ...filters, language: e.target.value });
                setPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Languages</option>
              <option value="devanagari">Devanagari</option>
              <option value="sanskrit">Sanskrit</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={() => {
              setFilters({ language: "" });
              setPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[220px] w-[220px]">TITLE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px] w-[120px]">DEITY</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[100px] w-[100px]">LANGUAGE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">VERSES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">DIFFICULTY</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[70px]">VIEWS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">CREATED</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stotras.map((stotra) => (
                <tr key={stotra._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 max-w-[220px] w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>{stotra.basicInfo.title}</div>
                    <div className="text-xs text-gray-500 truncate">{stotra.basicInfo.category}</div>
                  </td>
                  <td className="px-4 py-4 max-w-[120px] w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">
                    {stotra.basicInfo.deity}
                  </td>
                  <td className="px-4 py-4 max-w-[100px] w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">
                    {stotra.languages?.devanagari ? "Devanagari" : 
                     stotra.languages?.sanskrit ? "Sanskrit" :
                     stotra.languages?.hindi ? "Hindi" :
                     stotra.languages?.english ? "English" : "Unknown"}
                  </td>
                  <td className="px-4 py-4 w-[80px] text-sm text-gray-900 whitespace-nowrap">{stotra.content.verses}</td>
                  <td className="px-4 py-4 w-[110px] whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stotra.content.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      stotra.content.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stotra.content.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-4 w-[70px] text-sm text-gray-900 whitespace-nowrap">{stotra.analytics.viewCount}</td>
                  <td className="px-4 py-4 w-[100px] text-sm text-gray-500 whitespace-nowrap">{new Date(stotra.version.createdAt).toLocaleDateString()}</td>
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
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {totalPages}
            </span>
            <form onSubmit={handleJumpToPage} className="flex items-center space-x-2">
              <input
                type="number"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                placeholder="Page #"
                min="1"
                max={totalPages}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Go
              </button>
            </form>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AddStotraModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSuccess={fetchStotras}
        editStotra={editStotra}
      />
    </div>
  );
} 