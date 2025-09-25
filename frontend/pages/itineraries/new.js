import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function NewItinerary() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: ''
  });
  const [vacationStyle, setVacationStyle] = useState({
    chillaxed: false,
    adventurous: false,
    busy: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVacationStyleChange = (style) => {
    setVacationStyle(prev => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Form submitted with data:', formData);
    console.log('User authenticated:', isAuthenticated());
    console.log('Current user:', user);
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Trip title is required');
      setLoading(false);
      return;
    }
    
    if (!formData.destination.trim()) {
      setError('Destination is required');
      setLoading(false);
      return;
    }
    
    if (!formData.startDate) {
      setError('Start date is required');
      setLoading(false);
      return;
    }
    
    if (!formData.endDate) {
      setError('End date is required');
      setLoading(false);
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // For demo mode, we'll make a direct fetch call with auth token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ...formData,
          vacationStyle: vacationStyle
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create itinerary');
      }
      
      const data = await response.json();
      console.log('Itinerary created successfully:', data);
      
      // Show success message
      alert(`Itinerary "${data.title}" created successfully!`);
      
      // Redirect to the itineraries list page
      router.push('/itineraries');
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError(err.message || 'Failed to create itinerary');
      alert('Error: ' + (err.message || 'Failed to create itinerary'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Head>
          <title>Create New Itinerary - Travel Planner</title>
          <meta name="description" content="Create a new travel itinerary" />
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
          <Link href="/itineraries" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to My Adventures
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">Create New Adventure</h2>
          
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Vacation Style Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vacation Style (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => handleVacationStyleChange('chillaxed')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                    vacationStyle.chillaxed 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏖️</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      vacationStyle.chillaxed 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {vacationStyle.chillaxed && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Chillaxed Vacation</h3>
                  <p className="text-sm text-gray-600">Relaxing activities, leisurely meals, scenic views, and plenty of downtime</p>
                </div>
                
                <div 
                  onClick={() => handleVacationStyleChange('adventurous')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                    vacationStyle.adventurous 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏔️</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      vacationStyle.adventurous 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {vacationStyle.adventurous && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Adventurous Vacation</h3>
                  <p className="text-sm text-gray-600">Hiking, outdoor activities, adventure sports, and active exploration</p>
                </div>
                
                <div 
                  onClick={() => handleVacationStyleChange('busy')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                    vacationStyle.busy 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏃</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      vacationStyle.busy 
                        ? 'border-orange-500 bg-orange-500' 
                        : 'border-gray-300'
                    }`}>
                      {vacationStyle.busy && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Busy Vacation</h3>
                  <p className="text-sm text-gray-600">Packed schedule with multiple activities, sightseeing, and cultural experiences</p>
                </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link 
                href="/itineraries"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.destination || !formData.startDate || !formData.endDate}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Itinerary'
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
