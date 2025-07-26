'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, User, BookOpen } from 'lucide-react';

interface Biography {
  _id: string;
  title: string;
  content: string;
  createddt: string;
  updateddt: string;
}

export default function BiographyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        const response = await fetch(`/api/biographies/${params.id}`);
        if (!response.ok) {
          throw new Error('Biography not found');
        }
        const data = await response.json();
        setBiography(data);
        setError('');
      } catch (err) {
        setError('Failed to load biography');
        console.error('Error fetching biography:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBiography();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for basic formatting
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{line.substring(2)}</h1>;
        }
        
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          const elements = parts.map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
          );
          return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{elements}</p>;
        }
        
        // Italic text
        if (line.includes('*') && !line.includes('**')) {
          const parts = line.split('*');
          const elements = parts.map((part, i) => 
            i % 2 === 1 ? <em key={i} className="italic">{part}</em> : part
          );
          return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{elements}</p>;
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2 text-gray-700">{line.substring(2)}</li>;
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{line}</p>;
        }
        
        return null;
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !biography) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Biography not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The biography you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div className="mt-6">
              <Link
                href="/biographies"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Biographies
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/biographies"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Biographies
        </Link>
      </div>

      {/* Biography Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {biography.title}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(biography.createddt)}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Biography
                </div>
                {biography.updateddt !== biography.createddt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Updated: {formatDate(biography.updateddt)}
                  </div>
                )}
              </div>
            </div>
            <Link
              href={`/biographies/edit/${biography._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="prose prose-lg max-w-none">
            {renderMarkdown(biography.content)}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/biographies"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Biographies
        </Link>
        <Link
          href={`/biographies/edit/${biography._id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Biography
        </Link>
      </div>
    </div>
  );
} 