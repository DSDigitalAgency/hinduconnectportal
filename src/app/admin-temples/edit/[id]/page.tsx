"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Temple {
  _id: string;
  templeId: string;
  basicInfo: {
    name: string;
    alternateName?: string;
    type?: string;
    primaryDeity?: string;
  };
  location: {
    address: {
      state: string;
      country: string;
      city?: string;
      district?: string;
      area?: string;
      street?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  deities?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  categories?: Array<{
    type: string;
    value: string;
    priority?: number;
  }>;
}

export default function EditTemplePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [temple, setTemple] = useState<Temple | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    alternateName: "",
    primaryDeity: "",
    state: "",
    country: "India",
    city: "",
    district: "",
    area: "",
    street: "",
    latitude: "",
    longitude: "",
    categoryType: "sacred_circuit",
    categoryValue: "general",
    categoryPriority: "1"
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

  // Fetch temple data
  useEffect(() => {
    if (templeId) {
      fetchTemple();
    }
  }, [templeId]);

  const fetchTemple = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/temples/${templeId}`);
      
      if (!res.ok) {
        setError(`Failed to fetch temple: ${res.status} ${res.statusText}`);
        setFetching(false);
        return;
      }

      const templeData = await res.json();
      setTemple(templeData);
      
      // Populate form data
      setFormData({
        name: templeData.basicInfo?.name || "",
        alternateName: templeData.basicInfo?.alternateName || "",
        primaryDeity: templeData.basicInfo?.primaryDeity || "",
        state: templeData.location?.address?.state || "",
        country: templeData.location?.address?.country || "India",
        city: templeData.location?.address?.city || "",
        district: templeData.location?.address?.district || "",
        area: templeData.location?.address?.area || "",
        street: templeData.location?.address?.street || "",
        latitude: templeData.location?.coordinates?.latitude?.toString() || "",
        longitude: templeData.location?.coordinates?.longitude?.toString() || "",
        categoryType: templeData.categories?.[0]?.type || "sacred_circuit",
        categoryValue: templeData.categories?.[0]?.value || "general",
        categoryPriority: templeData.categories?.[0]?.priority?.toString() || "1"
      });
    } catch (err) {
      console.error('Error fetching temple:', err);
      setError('Error fetching temple');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const templeData = {
        basicInfo: { 
          name: formData.name,
          alternateName: formData.alternateName || undefined,
          type: "temple",
          primaryDeity: formData.primaryDeity || undefined
        },
        location: { 
          address: { 
            state: formData.state, 
            country: formData.country,
            city: formData.city || undefined,
            district: formData.district || undefined,
            area: formData.area || undefined,
            street: formData.street || undefined
          },
          coordinates: (formData.latitude && formData.longitude) ? {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          } : undefined
        },
        deities: formData.primaryDeity ? [{ name: formData.primaryDeity, type: "primary" }] : undefined,
        categories: [{
          type: formData.categoryType,
          value: formData.categoryValue,
          priority: parseInt(formData.categoryPriority)
        }]
      };

      const res = await fetch(`/api/temples/${templeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templeData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to update temple');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      router.push('/admin-temples');
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (fetching) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block mr-2">🌀</div>
          <span>Loading temple data...</span>
        </div>
      </div>
    );
  }

  if (error && !temple) {
    return (
      <div className="p-4 sm:p-8 bg-[#fff7ed] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/admin-temples')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded"
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
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Edit Temple</h1>
          <button
            onClick={() => router.push('/admin-temples')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            ← Back to Temples
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Temple Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alternate Name</label>
                <input
                  type="text"
                  value={formData.alternateName}
                  onChange={(e) => handleInputChange('alternateName', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Primary Deity</label>
                <input
                  type="text"
                  value={formData.primaryDeity}
                  onChange={(e) => handleInputChange('primaryDeity', e.target.value)}
                  placeholder="e.g., Vishnu, Shiva, Devi"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select State</option>
                  <option value="Tamilnadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="108 Divya Desham">108 Divya Desham</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Street</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Coordinates (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 12.9716"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 77.5946"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Category Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Category Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category Type</label>
                <select
                  value={formData.categoryType}
                  onChange={(e) => handleInputChange('categoryType', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="sacred_circuit">Sacred Circuit</option>
                  <option value="pilgrimage">Pilgrimage</option>
                  <option value="heritage">Heritage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category Value</label>
                <select
                  value={formData.categoryValue}
                  onChange={(e) => handleInputChange('categoryValue', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">General</option>
                  <option value="108_divya_desham">108 Divya Desham</option>
                  <option value="jyotirlinga">Jyotirlinga</option>
                  <option value="shakti_peeth">Shakti Peeth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.categoryPriority}
                  onChange={(e) => handleInputChange('categoryPriority', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin-temples')}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 