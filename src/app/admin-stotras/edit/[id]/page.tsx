"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface StotraFormData {
  title: string;
  text: string;
  lang: string;
}

export default function EditStotraPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<StotraFormData>({
    title: "",
    text: "",
    lang: "Devanagari"
  });

  const router = useRouter();
  const params = useParams();
  const stotraId = params.id as string;

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

  // Fetch stotra data
  useEffect(() => {
    if (stotraId) {
      fetchStotra();
    }
  }, [stotraId]);

  const fetchStotra = async () => {
    try {
      console.log('🔍 Fetching stotra with ID:', stotraId);
      
      const res = await fetch(`/api/stotras/${stotraId}`);
      
      if (!res.ok) {
        console.error('❌ API Response Error:', res.status, res.statusText);
        setError(`Failed to fetch stotra: ${res.status} ${res.statusText}`);
        setFetching(false);
        return;
      }
      
      const stotra = await res.json();
      
      console.log('📥 Raw API Response:', stotra);
      console.log('📊 Raw stotra data structure:', {
        keys: Object.keys(stotra),
        hasTitle: 'title' in stotra,
        hasText: 'text' in stotra,
        hasLanguage: 'language' in stotra,
        hasLang: 'lang' in stotra,
        titleValue: stotra.title,
        textValue: stotra.text,
        languageValue: stotra.language,
        langValue: stotra.lang,
        fullObject: stotra
      });
      
      // Transform the data to match our form structure
      const transformedData = {
        title: stotra.title || "",
        text: stotra.text || "",
        lang: stotra.language || stotra.lang || "Devanagari" // Try both language and lang fields
      };
      
      console.log('🔄 Transformed form data:', transformedData);
      console.log('📋 Final form data being set:', {
        title: transformedData.title,
        textLength: transformedData.text?.length || 0,
        textPreview: transformedData.text?.substring(0, 100) + '...',
        language: transformedData.lang
      });
      
      setFormData(transformedData);
    } catch (err) {
      console.error('❌ Error fetching stotra:', err);
      setError('Error fetching stotra');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const submitData = {
      title: formData.title,
      text: formData.text,
      language: formData.lang
    };
    
    console.log('📤 Submitting form data:', submitData);
    console.log('📊 Form data details:', {
      title: submitData.title,
      titleLength: submitData.title.length,
      textLength: submitData.text.length,
      textPreview: submitData.text.substring(0, 100) + '...',
      language: submitData.language
    });
    
    try {
      const res = await fetch(`/api/stotras/${stotraId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      
      console.log('📥 API Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const data = await res.json();
        console.error('❌ API Error response:', data);
        setError(data.message || 'Failed to update stotra');
        setLoading(false);
        return;
      }
      
      const responseData = await res.json();
      console.log('✅ API Success response:', responseData);
      
      setLoading(false);
      router.push('/admin-stotras');
    } catch (err) {
      console.error('❌ Network error during submission:', err);
      setError("Network error");
      setLoading(false);
    }
  };

  const languages = [
    'Devanagari', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Itrans'
  ];

  if (fetching) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading stotra data...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Stotra</h1>
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
            {loading ? "Updating..." : "Update Stotra"}
          </button>
        </div>
      </form>
    </div>
  );
} 