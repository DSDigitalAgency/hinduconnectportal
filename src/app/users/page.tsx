"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FirebaseUserRow {
  id: string;
  email: string;
  displayName: string;
  createdAt?: string;
  phone?: string;
  location?: string;
  pincode?: string;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<FirebaseUserRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [nextToken, setNextToken] = useState<string | null>(null);
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

  const fetchUsers = (p = 1, token?: string | null) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search) params.set('search', search);
    if (token) params.set('pageToken', token);
    fetch(`/api/firebase-users?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.items || []);
        setNextToken(data.nextPageToken || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const totalPages = total ? Math.ceil(total / limit) : page + (nextToken ? 1 : 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate" title={u.displayName}>{u.displayName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate" title={u.email}>{u.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate" title={u.phone}>{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate" title={u.location}>{u.location || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate" title={u.pincode}>{u.pincode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">Page {page}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!nextToken}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}