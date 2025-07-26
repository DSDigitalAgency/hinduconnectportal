'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, BookOpen } from 'lucide-react';

interface Biography {
  _id: string;
  title: string;
  content: string;
  createddt: string;
  updateddt: string;
}

export default function EditBiographyPage() {
  const params = useParams();
  const router = useRouter();
  const [biography, setBiography] = useState<Biography | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        const response = await fetch(`/api/biographies/${params.id}`);
        if (!response.ok) {
          throw new Error('Biography not found');
        }
        const data = await response.json();
        setBiography(data);
        setTitle(data.title);
        setContent(data.content);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/biographies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update biography');
      }

      const data = await response.json();
      setBiography(data);
      setSuccess('Biography updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this biography? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/biographies/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete biography');
      }

      setSuccess('Biography deleted successfully!');
      
      // Redirect to biographies list after a short delay
      setTimeout(() => {
        router.push('/biographies');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (title !== biography?.title || content !== biography?.content) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        router.push(`/biographies/${params.id}`);
      }
    } else {
      router.push(`/biographies/${params.id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !biography) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Biography not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The biography you&apos;re trying to edit doesn&apos;t exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              href="/biographies"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Biographies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/biographies/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Biography
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Biography</h1>
        <p className="mt-2 text-gray-600">
          Update the biography for {biography?.title}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="text-green-800">{success}</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the biography title..."
            />
            <p className="mt-1 text-sm text-gray-500">
              The title will be used as the filename and display name
            </p>
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter the biography content in markdown format..."
            />
            <div className="mt-2 text-sm text-gray-500">
              <p>Use markdown formatting for better presentation:</p>
              <ul className="mt-1 space-y-1">
                <li>• <code className="bg-gray-100 px-1 rounded"># Heading</code> for main headings</li>
                <li>• <code className="bg-gray-100 px-1 rounded">## Subheading</code> for subheadings</li>
                <li>• <code className="bg-gray-100 px-1 rounded">**bold text**</code> for emphasis</li>
                <li>• <code className="bg-gray-100 px-1 rounded">*italic text*</code> for italics</li>
                <li>• <code className="bg-gray-100 px-1 rounded">- item</code> for bullet points</li>
              </ul>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Biography
                </>
              )}
            </button>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim() || !content.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Section */}
      {content && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="prose prose-sm max-w-none">
            <h1>{title || 'Untitled Biography'}</h1>
            <div className="whitespace-pre-wrap text-gray-700">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 