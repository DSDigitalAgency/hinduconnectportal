'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
// removed unused imports to satisfy linter

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

  // Floating actions menu like other modules
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const openMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 160;
    const gap = 8;
    const left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth));
    const top = Math.min(window.innerHeight - 120, rect.bottom + gap);
    setMenu({ id, top, left });
  };

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (!menuRef.current) return;
      if (ev.target instanceof Node && menuRef.current.contains(ev.target)) return;
      setMenu(null);
    };
    const onEsc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setMenu(null); };
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

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Biographies</h1>
        <button
          onClick={() => router.push('/biographies/add')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <span role="img" aria-label="add">➕</span> Add New Biography
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
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-orange-100 z-10 rounded-t-2xl">
              <tr>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Title</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Preview</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Created</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {biographies.map((biography, idx) => (
                <tr key={biography._id} className={`transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}>
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
                  <td className="px-2 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={(e) => openMenu(biography._id, e)}
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
            onClick={() => { const id = menu.id; setMenu(null); router.push(`/biographies/${id}`); }}
          >
            👁️ View
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50"
            onClick={() => { const id = menu.id; setMenu(null); router.push(`/biographies/edit/${id}`); }}
          >
            ✏️ Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-orange-50 disabled:opacity-50"
            onClick={() => { const id = menu.id; setMenu(null); handleDelete(id); }}
            disabled={deleteLoading === menu.id}
          >
            🗑️ {deleteLoading === menu.id ? 'Deleting...' : 'Delete'}
          </button>
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