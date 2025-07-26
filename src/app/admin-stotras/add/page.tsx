"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StotraFormData {
  title: string;
  text: string;
  lang: string;
}

export default function AddStotraPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<StotraFormData>({
    title: "",
    text: "",
    lang: "Devanagari"
  });

  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/stotras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          text: formData.text,
          language: formData.lang
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to add stotra');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      router.push('/admin-stotras');
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  const languages = [
    'Devanagari', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Itrans'
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Stotra</h1>
        <button
          onClick={() => router.push('/admin-stotras')}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back to Stotras
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stotra Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language *</label>
              <select
                value={formData.lang}
                onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stotra Text</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Text Content *</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter the stotra text here..."
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin-stotras')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Stotra"}
          </button>
        </div>
      </form>
    </div>
  );
} 