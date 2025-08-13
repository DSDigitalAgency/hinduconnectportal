"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface StotraDoc {
  _id: string;
  title: string;
  text: string;
  lang: string;
  subtitle?: string;
  createddt?: string;
  updateddt?: string;
}

export default function ViewStotraPage() {
  const params = useParams();
  const router = useRouter();
  const [stotra, setStotra] = useState<StotraDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchItem();
    }
  }, [params.id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/stotras/${params.id}`);
      if (!res.ok) {
        setError('Stotra not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStotra(data);
    } catch (e) {
      setError('Failed to load stotra');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">Loading stotra...</div>
        </div>
      </div>
    );
  }

  if (error || !stotra) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-red-600 mb-4">{error || 'Stotra not found'}</div>
            <button
              onClick={() => router.push('/stotras')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Back to Stotras
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
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">View Stotra</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/stotras/edit/${stotra._id}`)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Edit Stotra
            </button>
            <button
              onClick={() => router.push('/stotras')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Back to Stotras
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-50 px-8 py-6 border-b border-orange-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{stotra.title}</h2>
                {stotra.subtitle && (
                  <div className="text-gray-700">{stotra.subtitle}</div>
                )}
              </div>
              <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap h-fit">
                {stotra.lang}
              </span>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {formatDate(stotra.createddt)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(stotra.updateddt)}
              </div>
              <div>
                <span className="font-medium">ID:</span> {stotra._id}
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {stotra.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


