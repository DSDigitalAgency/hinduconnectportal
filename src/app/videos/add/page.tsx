"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddVideoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    videourl: "",
    title: "",
    category: "General",
    language: "English",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Session check
  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/');
        }
      });
  }, [router]);

  const categories = [
    "General", "Antyesti", "Ayurveda", "Festivals", "Knowledge",
    "Nature", "Shastras", "Worship", "Yoga", "Music",
    "Movies", "Pravachanas"
  ];

  const languages = [
    "English", "Hindi", "Sanskrit", "Tamil", "Telugu", "Malayalam",
    "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi",
    "Odia", "Assamese", "Urdu"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videourl: form.videourl,
          title: form.title,
          category: form.category,
          language: form.language,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add video');
      }
      router.push('/videos');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Add Video</h1>
          <button
            onClick={() => router.push('/videos')}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            Back to Videos
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language *</label>
                <select
                  value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Video URL *</label>
              <input
                type="url"
                value={form.videourl}
                onChange={e => setForm({ ...form, videourl: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.push('/videos')} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add Video'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


