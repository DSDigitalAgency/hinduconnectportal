"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Temple {
  _id: string;
  category: string;
  title: string;
  text: string;
  createddt: string;
  updateddt: string;
}

export default function AdminTemplesPage() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const router = useRouter();
  // Floating actions menu like Stotras page
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const fetchTemples = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('search', search);
    if (filterCategory) params.append('category', filterCategory);
    
    fetch(`/api/temples?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTemples(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching temples:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTemples();
    // eslint-disable-next-line
  }, [page, limit, search, filterCategory]);

  const totalPages = Math.ceil(total / limit);

  const handleEdit = (temple: Temple) => {
    router.push(`/temples/edit/${temple._id}`);
  };

  const handleDelete = async (temple: Temple) => {
    if (!window.confirm(`Are you sure you want to delete temple: ${temple.title}?`)) return;
    setDeletingId(temple._id);
    try {
      const res = await fetch(`/api/temples/${temple._id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete temple');
      } else {
        fetchTemples();
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setDeletingId(null);
    }
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

  const getCategoryDisplayName = (category: string) => {
    return category.replace(/_/g, ' ').replace('Temples', '');
  };

  const getTextPreview = (text: string) => {
    // Remove markdown formatting and get first 100 characters
    const plainText = text.replace(/\*\*/g, '').replace(/#{1,6}\s/g, '').replace(/\n/g, ' ');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Category options for filter
  const categoryOptions = [
    "108_Divya_Desham_Temples",
    "108_Shiva_Temples_Kerala", 
    "12_Jyotirlingam_Temples",
    "51_Shakti_Peetham_Temples",
    "Andaman_Nicobar_Temples",
    "Andhra_Pradesh_Temples",
    "Arunachal_Pradesh_Temples",
    "Assam_Temples",
    "Bihar_Temples",
    "Chandigarh_Temples",
    "Chattisgarh_Temples",
    "Delhi_Temples",
    "Goa_Temples",
    "Gujarat_Temples",
    "Haryana_Temples",
    "Himachal_Pradesh_Temples",
    "International_Temples",
    "Jammu_Kashmir_Temples",
    "Jharkhand_Temples",
    "Karnataka_Temples",
    "Kerala_Temples",
    "Madhya_Pradesh_Temples",
    "Maharashtra_Temples",
    "Manipur_Temples",
    "Meghalaya_Temples",
    "Nagaland_Temples",
    "Nepal_Temples",
    "Odisha_Temples",
    "Puducherry_Temples",
    "Punjab_Temples",
    "Rajasthan_Temples",
    "Sikkim_Temples",
    "Tamilnadu_Temples",
    "Telangana_Temples",
    "Tripura_Temples",
    "Uttarakhand_Temples",
    "Uttar_Pradesh_Temples",
    "West_Bengal_Temples"
  ];

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Temples</h1>
          <p className="text-gray-600 mt-1">Total: {total} temples in database</p>
        </div>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => router.push('/temples/add')}
        >
          <span role="img" aria-label="add">➕</span> Add New Temple
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title or content..."
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
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
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
          <form
            onSubmit={e => {
              e.preventDefault();
              const num = Number(jumpPage);
              if (num >= 1 && num <= totalPages) setPage(num);
            }}
            className="flex gap-2 items-center ml-auto"
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
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-3 py-2 rounded transition">
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-x-auto rounded-2xl shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-orange-100 z-10 rounded-t-2xl">
            <tr>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tl-2xl">Temple Info</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Category</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Content Preview</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Timestamps</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><span className="animate-spin inline-block mr-2">🌀</span>Loading...</td></tr>
            ) : temples.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12">No temples found.</td></tr>
            ) : (
              temples.map((temple, idx) => (
                <tr key={temple._id} className={
                  `transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}
                >
                  <td className="border-b px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{temple.title}</div>
                      <div className="text-xs text-gray-500 font-mono" title={temple._id}>
                        ID: {temple._id.slice(-12)}...
                      </div>
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">{getCategoryDisplayName(temple.category)}</div>
                      <div className="text-xs text-gray-500">{temple.category}</div>
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-sm">
                      <div className="text-gray-700">{getTextPreview(temple.text)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        📄 {temple.text.length.toLocaleString()} characters
                      </div>
                    </div>
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div className="text-gray-600">
                        📅 Created: {formatDate(temple.createddt)}
                      </div>
                      <div className="text-gray-600">
                        🔄 Updated: {formatDate(temple.updateddt)}
                      </div>
                    </div>
                  </td>
                  <td className="border-b px-2 py-3 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={(e) => openMenu(temple._id, e)}
                      className="px-2 py-1 rounded hover:bg-orange-200"
                      aria-label="Actions"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating actions menu */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 rounded-md border bg-white shadow-lg"
          style={{ top: menu.top, left: menu.left }}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50"
            onClick={() => { const id = menu.id; setMenu(null); router.push(`/temples/view/${id}`); }}
          >
            👁️ View
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50"
            onClick={() => {
              const item = temples.find(t => t._id === menu.id);
              setMenu(null);
              if (item) handleEdit(item);
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-orange-50 disabled:opacity-50"
            onClick={() => { const item = temples.find(t => t._id === menu.id); setMenu(null); if (item) handleDelete(item); }}
            disabled={deletingId === menu.id}
          >
            🗑️ {deletingId === menu.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex gap-2 items-center justify-center mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold disabled:opacity-50 shadow"
        >
          ← Previous
        </button>
        <span className="font-semibold text-base">Page {page} of {totalPages || 1} ({total} total temples)</span>
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