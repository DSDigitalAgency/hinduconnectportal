"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Stotra {
  _id: string;
  title: string;
  text: string;
  lang: string;
  createddt: string;
  updateddt: string;
  subtitle?: string;
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
  // Floating menu state (viewport anchored for reliable positioning)
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
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
    router.push(`/stotras/edit/${stotra._id}`);
  };

  // Open three-dots menu near the trigger button using viewport coords
  const openMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 160;
    const gap = 8;
    const left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth));
    const top = Math.min(window.innerHeight - 120, rect.bottom + gap);
    setMenu({ id, top, left });
  };

  // Close menu on outside click, escape, or scroll
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (!menuRef.current) return;
      if (ev.target instanceof Node && menuRef.current.contains(ev.target)) return;
      setMenu(null);
    };
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setMenu(null);
    };
    const onScroll = () => setMenu(null);
    if (menu) {
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onEsc);
      window.addEventListener('scroll', onScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [menu]);

  const totalPages = Math.ceil(total / limit);

  // Static filter options - updated based on actual data
  const allLanguages = [
    'Devanagari', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Itrans'
  ];

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Stotras</h1>
        <button
          onClick={() => router.push('/stotras/add')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <span role="img" aria-label="add">➕</span> Add New Stotra
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
                className="w-full px-4 py-2 bg-orange-500 text-black font-semibold rounded hover:bg-orange-600"
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
        <div className="overflow-x-auto rounded-2xl shadow border bg-white">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-orange-100 z-10 rounded-t-2xl">
              <tr>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tl-2xl">Title</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold hidden md:table-cell">Subtitle</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold w-32">Language</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stotras.map((stotra, idx) => (
                <tr key={stotra._id} className={`transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[520px]" title={stotra.title}>{stotra.title}</div>
                    <div className="md:hidden text-xs text-gray-600 truncate max-w-[520px]" title={stotra.subtitle || ''}>{stotra.subtitle || '-'}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-700 truncate max-w-[520px]" title={stotra.subtitle || ''}>{stotra.subtitle || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {stotra.lang}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={(e) => openMenu(stotra._id, e)}
                      className="px-2 py-1 rounded hover:bg-orange-200"
                      aria-label="Actions"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating actions menu */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 rounded-md border bg-white shadow-lg"
          style={{ top: menu.top, left: menu.left }}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50"
            onClick={() => {
              const id = menu.id; setMenu(null); router.push(`/stotras/view/${id}`);
            }}
          >
            👁️ View
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50"
            onClick={() => {
              const st = stotras.find(s => s._id === menu.id);
              setMenu(null);
              if (st) handleEdit(st);
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-orange-50 disabled:opacity-50"
            onClick={() => { setMenu(null); handleDelete(menu.id); }}
            disabled={deleteLoading === menu.id}
          >
            🗑️ {deleteLoading === menu.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center justify-center mt-8">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
            >
              ← Previous
            </button>
            <span className="font-semibold text-base">Page {page} of {totalPages || 1} ({total} total stotras)</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
            >
              Next →
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); const num = parseInt(jumpToPage); if (!isNaN(num) && num >= 1 && num <= totalPages) setPage(num); }}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              placeholder="Page #"
              className="border px-2 py-2 rounded w-24"
            />
            <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-black font-bold shadow disabled:opacity-50" disabled={!jumpToPage}>
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 