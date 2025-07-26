"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Blog {
  _id: string;
  blogId: string;
  basicInfo: {
    title: string;
    status: string;
    category: string;
    slug: string;
  };
  author: {
    authorName: string;
  };
  content: {
    body: string;
    language: string;
  };
  createddt: string;
  updateddt: string;
}

export default function ViewBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${params.id}`);
      if (!res.ok) {
        setError('Blog not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBlog(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load blog');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl">Loading blog...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-red-600 mb-4">{error || 'Blog not found'}</div>
            <button
              onClick={() => router.push('/admin-blogs')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Back to Blogs
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
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">View Blog</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/admin-blogs/edit/${blog._id}`)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg transition"
            >
              Edit Blog
            </button>
            <button
              onClick={() => router.push('/admin-blogs')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Back to Blogs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-50 px-8 py-6 border-b border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{blog.basicInfo?.title}</h2>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                blog.basicInfo?.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {blog.basicInfo?.status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium mr-2">Category:</span>
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                  {blog.basicInfo?.category}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Author:</span>
                <span>{blog.author?.authorName}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Language:</span>
                <span>{blog.content?.language}</span>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {formatDate(blog.createddt)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(blog.updateddt)}
              </div>
              <div>
                <span className="font-medium">Blog ID:</span> {blog.blogId}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {blog.content?.body}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 