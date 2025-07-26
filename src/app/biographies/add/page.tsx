'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';

export default function AddBiographyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/biographies', {
        method: 'POST',
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
        throw new Error(errorData.message || 'Failed to create biography');
      }

      const data = await response.json();
      setSuccess('Biography created successfully!');
      
      // Redirect to the new biography after a short delay
      setTimeout(() => {
        router.push(`/biographies/${data.item._id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        router.push('/biographies');
      }
    } else {
      router.push('/biographies');
    }
  };

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Biography</h1>
        <p className="mt-2 text-gray-600">
          Create a new biography for a Hindu saint, sage, or spiritual leader
        </p>
      </div>

      <div>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
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
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Biography
                  </>
                )}
              </button>
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
    </div>
  );
} 