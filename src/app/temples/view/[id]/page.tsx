"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TempleDoc {
  _id: string;
  title: string;
  category: string;
  text: string;
  createddt?: string;
  updateddt?: string;
}

export default function ViewTemplePage() {
  const params = useParams();
  const router = useRouter();
  const [temple, setTemple] = useState<TempleDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) fetchItem();
  }, [params.id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/temples/${params.id}`);
      if (!res.ok) {
        setError('Temple not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTemple(data);
    } catch (e) {
      setError('Failed to load temple');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => category.replace(/_/g, ' ').replace('Temples', '');
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">Loading temple...</div>
        </div>
      </div>
    );
  }

  if (error || !temple) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-red-600 mb-4">{error || 'Temple not found'}</div>
            <button
              onClick={() => router.push('/temples')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Back to Temples
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">View Temple</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/temples/edit/${temple._id}`)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Edit Temple
            </button>
            <button
              onClick={() => router.push('/temples')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Back to Temples
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-50 px-8 py-6 border-b border-orange-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{temple.title}</h2>
                <div className="text-gray-700">{getCategoryDisplayName(temple.category)}</div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {formatDate(temple.createddt)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(temple.updateddt)}
              </div>
              <div>
                <span className="font-medium">ID:</span> {temple._id}
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {temple.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


