"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Temple {
  _id: string;
  templeId: string;
  basicInfo: {
    name: string;
  };
  location: {
    address: {
      state: string;
      country: string;
    };
  };
}

function AddTempleModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/temples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: { name },
          location: { address: { state, country } },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add temple");
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
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Add New Temple</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">State</label>
          <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Country</label>
          <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded transition" disabled={loading}>
          {loading ? "Adding..." : "Add Temple"}
        </button>
      </form>
    </div>
  );
}

function EditTempleModal({ open, onClose, onSuccess, temple }: { open: boolean; onClose: () => void; onSuccess: () => void; temple: Temple | null }) {
  // Always call hooks first
  const [name, setName] = useState(temple?.basicInfo?.name || "");
  const [state, setState] = useState(temple?.location?.address?.state || "");
  const [country, setCountry] = useState(temple?.location?.address?.country || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(temple?.basicInfo?.name || "");
    setState(temple?.location?.address?.state || "");
    setCountry(temple?.location?.address?.country || "");
  }, [temple]);

  if (!temple) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/temples/${temple._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: { name },
          location: { address: { state, country } },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update temple");
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
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Edit Temple</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">State</label>
          <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Country</label>
          <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded transition" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default function AdminTemplesPage() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemple, setEditTemple] = useState<Temple | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jumpPage, setJumpPage] = useState("");

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

  const fetchTemples = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('search', search);
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
  }, [page, limit, search]);

  const totalPages = Math.ceil(total / limit);

  const handleEdit = (temple: Temple) => {
    setEditTemple(temple);
    setShowEditModal(true);
  };

  const handleDelete = async (temple: Temple) => {
    if (!window.confirm(`Are you sure you want to delete temple: ${temple.basicInfo?.name}?`)) return;
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

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <AddTempleModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchTemples} />
      <EditTempleModal open={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchTemples} temple={editTemple} />
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Manage Temples</h1>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => setShowAddModal(true)}
        >
          <span role="img" aria-label="add">➕</span> Add New Temple
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
            placeholder="Search by name, state, or country..."
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
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Name</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Location</th>
              <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12"><span className="animate-spin inline-block mr-2">🌀</span>Loading...</td></tr>
            ) : temples.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12">No temples found.</td></tr>
            ) : (
              temples.map((temple, idx) => (
                <tr key={temple._id} className={
                  `transition ${idx % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'} hover:bg-orange-100`}
                >
                  <td className="border-b px-4 py-2 font-mono align-middle text-left" title={temple.templeId}>{temple.templeId?.slice(0, 8) || ''}…</td>
                  <td className="border-b px-4 py-2 font-medium align-middle text-left">{temple.basicInfo?.name}</td>
                  <td className="border-b px-4 py-2 align-middle text-left">{temple.location?.address?.state || ''}, {temple.location?.address?.country || ''}</td>
                  <td className="border-b px-4 py-2 align-middle text-center whitespace-nowrap">
                    <span className="inline-block">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1 mr-2 rounded bg-orange-400 hover:bg-orange-600 text-black font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        title="Edit"
                        onClick={() => handleEdit(temple)}
                      >
                        <span role="img" aria-label="edit">✏️</span> Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-400 hover:bg-red-600 text-black font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        title="Delete"
                        onClick={() => handleDelete(temple)}
                        disabled={deletingId === temple._id}
                      >
                        {deletingId === temple._id ? <span className="animate-spin">🗑️</span> : <span role="img" aria-label="delete">🗑️</span>} Delete
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