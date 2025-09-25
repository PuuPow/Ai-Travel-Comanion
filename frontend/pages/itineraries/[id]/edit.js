import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaArrowLeft, FaSpinner, FaSave } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function EditItinerary() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (id) {
      fetchItinerary();
    }
  }, [id]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch itinerary');
      }
      
      const data = await response.json();
      
      // Format dates for HTML input
      const startDate = new Date(data.startDate).toISOString().split('T')[0];
      const endDate = new Date(data.endDate).toISOString().split('T')[0];
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        destination: data.destination || '',
        startDate: startDate,
        endDate: endDate
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Trip title is required');
      setSaving(false);
      return;
    }
    
    if (!formData.destination.trim()) {
      setError('Destination is required');
      setSaving(false);
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError('Both start and end dates are required');
      setSaving(false);
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update itinerary');
      }
      
      const data = await response.json();
      
      // Redirect back to the itinerary detail page
      router.push(`/itineraries/${id}`);
    } catch (err) {
      console.error('Error updating itinerary:', err);
      setError(err.message || 'Failed to update itinerary');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your adventure...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Head>
          <title>Edit Adventure - AI Travel Companion</title>
          <meta name="description" content="Edit your travel adventure" />
        </Head>

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Link href="/" className="flex items-center min-w-0">
                  <FaPlane className="text-white text-xl sm:text-2xl flex-shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-bold text-white ml-2 sm:ml-3 hidden sm:block">AI Travel Companion</h1>
                  <h1 className="text-lg font-bold text-white ml-2 sm:hidden">Travel</h1>
                </Link>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 min-w-0">
                <Link href="/itineraries" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base">
                  <span className="hidden sm:inline">My Adventures</span>
                  <span className="sm:hidden">Adventures</span>
                </Link>
                <Link href="/account" className="text-white/90 hover:text-white text-xs sm:text-sm md:text-base truncate transition-colors cursor-pointer hover:underline">
                  Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                </Link>
                <button
                  onClick={logout}
                  className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 sm:px-3 rounded-md hover:bg-white/10 text-xs sm:text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/itineraries/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <FaArrowLeft className="mr-2" />
              Back to Adventure
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">Edit Your Adventure</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Vacation in Europe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Paris, France"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us more about your trip..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link 
                  href={`/itineraries/${id}`}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !formData.title || !formData.destination || !formData.startDate || !formData.endDate}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}