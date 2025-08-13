"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Video {
  _id: string;
  id: string;
  videourl: string;
  title: string;
  category: string;
  language: string;
  createddt: string;
  updateddt?: string;
}

// Removed AddVideoModal. Add flow moved to a dedicated page.

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  // legacy modal state removed; keep none to satisfy linter
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const router = useRouter();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

     // Session check
   React.useEffect(() => {
     fetch('/api/session')
       .then(res => res.json())
       .then(data => {
         console.log('Session check result:', data);
         if (!data.authenticated) {
           router.replace('/');
         }
       })
       .catch(error => {
         console.error('Session check error:', error);
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
       if (filterLanguage) params.append('language', filterLanguage);
       
       const url = `/api/videos?${params.toString()}`;
       console.log('Fetching videos from:', url);
       
       const res = await fetch(url);
       const data = await res.json();
       console.log('Videos response:', data);
       setVideos(data.items || []);
       setTotal(data.total || 0);
     } catch (err) {
       console.error('Error fetching videos:', err);
     } finally {
       setLoading(false);
     }
  }, [page, limit, search, filterCategory, filterLanguage]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleEdit = (videoId: string) => {
    router.push(`/videos/edit/${videoId}`);
  };

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

  const languageOptions = [
    "English", "Hindi", "Sanskrit", "Tamil", "Telugu", "Malayalam", 
    "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi", 
    "Odia", "Assamese", "Urdu"
  ];

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
        <div>
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Videos</h1>
          <p className="text-gray-600 mt-1">Total: {total} videos in database</p>
        </div>
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => router.push('/videos/add')}
        >
          <span role="img" aria-label="add">➕</span> Add New Video
        </button>
      </div>

             {/* Search and Filters */}
       <div className="bg-white rounded-lg shadow p-6 mb-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
           <div>
             <label className="block text-sm font-medium mb-1">Search</label>
             <input
               type="text"
               placeholder="Search by title, category, or language..."
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
           <div>
             <label className="block text-sm font-medium mb-1">Language</label>
             <select
               value={filterLanguage}
               onChange={e => setFilterLanguage(e.target.value)}
               className="w-full border px-3 py-2 rounded"
             >
               <option value="">All Languages</option>
               {languageOptions.map(language => (
                 <option key={language} value={language}>{language}</option>
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
               setFilterLanguage("");
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
               <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Language</th>
               <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">URL</th>
               <th className="border-b px-4 py-3 text-left text-orange-700 font-bold">Timestamps</th>
                <th className="border-b px-4 py-3 text-left text-orange-700 font-bold rounded-tr-2xl w-16">Actions</th>
             </tr>
           </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><span className="animate-spin inline-block mr-2">🌀</span>Loading...</td></tr>
                         ) : videos.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-12">No videos found.</td></tr>
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
                       <div className="font-medium text-green-600">{video.language}</div>
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
                  <td className="border-b px-2 py-3 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={(e) => openMenu(video._id, e)}
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
            onClick={() => { const id = menu.id; setMenu(null); handleEdit(id); }}
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
      {/* AddVideoModal removed */}
    </div>
  );
} 