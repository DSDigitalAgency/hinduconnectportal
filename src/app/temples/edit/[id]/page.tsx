"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Temple {
  _id: string;
  category: string;
  title: string;
  text: string;
  createddt: string;
  updateddt: string;
}

export default function EditTemplePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [temple, setTemple] = useState<Temple | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Andhra_Pradesh_Temples",
    text: ""
  });

  const router = useRouter();
  const params = useParams();
  const templeId = params.id as string;

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

  const fetchTemple = async () => {
    try {
      const response = await fetch(`/api/temples/${templeId}`);
      if (!response.ok) {
        throw new Error('Temple not found');
      }
      const templeData = await response.json();
      setTemple(templeData);
      setFormData({
        title: templeData.title || "",
        category: templeData.category || "Andhra_Pradesh_Temples",
        text: templeData.text || ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch temple');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (templeId) {
      fetchTemple();
    }
  }, [templeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!formData.title.trim() || !formData.category.trim() || !formData.text.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    
    try {
      const templeData = {
        title: formData.title.trim(),
        category: formData.category,
        text: formData.text.trim()
      };

      const response = await fetch(`/api/temples/${templeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update temple');
      }

      const result = await response.json();
      alert('Temple updated successfully!');
      router.push('/temples');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Category options
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

  const getCategoryDisplayName = (category: string) => {
    return category.replace(/_/g, ' ').replace('Temples', '');
  };

  if (fetching) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="animate-spin inline-block mr-2 text-2xl">🌀</span>
          <p className="text-lg">Loading temple...</p>
        </div>
      </div>
    );
  }

  if (error && !temple) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={() => router.push('/temples')}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            ← Back to Temples
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Edit Temple</h1>
            <p className="text-gray-600 mt-1">Update temple information</p>
            {temple && (
              <p className="text-sm text-gray-500 mt-1">
                ID: {temple._id} | Created: {new Date(temple.createddt).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/temples')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            ← Back to Temples
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temple Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter temple title..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temple Content (Markdown) *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={20}
                placeholder="Enter temple content in markdown format..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use markdown formatting like **bold**, *italic*, # headings, etc.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-black font-bold py-3 px-6 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">🌀</span>
                    Updating...
                  </span>
                ) : (
                  'Update Temple'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/temples')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 