import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlane, FaCalendarAlt, FaMapMarkerAlt, FaPlus, FaEye, FaEdit, FaTrash, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

export default function Itineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const { user, isAuthenticated, loading: authLoading, initialized, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔐 Auth redirect check:', { authLoading, initialized, isAuthenticated: isAuthenticated() });
    if (initialized && !isAuthenticated()) {
      console.log('🚑 Redirecting to login - user not authenticated');
      router.push('/login');
    } else if (initialized && isAuthenticated()) {
      console.log('✅ User is authenticated, staying on page');
    }
  }, [authLoading, initialized, isAuthenticated, router]);

  // Fetch itineraries
  useEffect(() => {
    const fetchItineraries = async () => {
      console.log('🔍 Fetching itineraries...');
      console.log('Authentication status:', isAuthenticated());
      console.log('Auth loading:', authLoading);
      console.log('Initialized:', initialized);
      console.log('User:', user);
      
      if (!initialized) {
        console.log('⏳ AuthContext not initialized yet, waiting...');
        return;
      }
      
      if (!isAuthenticated()) {
        console.log('❌ Not authenticated, skipping itineraries fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the auth token from localStorage
        const token = localStorage.getItem('auth_token');
        console.log('🔧 API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('🔧 Has auth token:', !!token);
        console.log('🔧 Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        // Make direct fetch call with auth token for demo mode
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error:', response.status, errorData);
          throw new Error(errorData.error || `Failed to fetch itineraries (${response.status})`);
        }
        
        const data = await response.json();
        console.log('✅ Fetched itineraries:', data.length, 'items');
        console.log('📊 Itineraries data:', data);
        setItineraries(data);
        setError('');
        console.log('✨ Itineraries state updated successfully');
      } catch (err) {
        console.error('😱 Error fetching itineraries:', err);
        console.error('📝 Error details:', {
          message: err.message,
          status: err.response?.status,
          url: `${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`
        });
        
        if (err.response?.status === 401) {
          console.log('🚪 Token expired, logging out and redirecting...');
          // Token might be expired, logout and redirect
          logout();
          router.push('/login');
        } else {
          console.log('😞 Setting error state');
          setError('Failed to load itineraries');
        }
      } finally {
        console.log('🏁 Fetch attempt completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [initialized, isAuthenticated, logout, router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDelete = async (itineraryId) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries/${itineraryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }
      
      // Remove from local state
      setItineraries(prev => prev.filter(item => item.id !== itineraryId));
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('Failed to delete itinerary');
    } finally {
      setDeleting(false);
    }
  };

  const getDestinationColor = (destination) => {
    // Generate colors based on destination
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-red-600',
      'from-teal-500 to-green-600'
    ];
    const hash = destination.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!initialized || (initialized && !isAuthenticated() && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>My Itineraries - Travel Planner</title>
        <meta name="description" content="View and manage your travel itineraries" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <Link href="/" className="flex items-center min-w-0">
                <FaPlane className="text-white text-xl flex-shrink-0" />
                <h1 className="text-xl font-bold text-white ml-2 hidden sm:block">AI Travel Companion</h1>
                <h1 className="text-lg font-bold text-white ml-2 sm:hidden">Travel</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link href="/account" className="text-white/90 hover:text-white text-sm sm:text-base truncate transition-colors cursor-pointer hover:underline">
                Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
              </Link>
              <button
                onClick={logout}
                className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 sm:px-3 rounded-md hover:bg-white/10 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">My Travel Adventures</h1>
          <p className="text-gray-700 text-lg mb-6">Discover, plan, and manage your incredible journeys</p>
          <Link
            href="/itineraries/new"
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <FaPlus className="mr-2" />
            Create New Adventure
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your adventures...</p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-500 bg-gray-100 rounded p-2 inline-block">
                  Debug: Auth={isAuthenticated() ? 'Yes' : 'No'}, API={process.env.NEXT_PUBLIC_API_URL}
                </div>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <FaPlane className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready for your first adventure?</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Create your first itinerary and let our AI help you discover amazing places!</p>
            <Link
              href="/itineraries/new"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <FaPlus className="mr-2" />
              Start Your Journey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Top color banner */}
                <div className={`h-2 bg-gradient-to-r ${getDestinationColor(itinerary.destination)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {itinerary.title}
                    </h3>
                    {/* Quick badge */}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {calculateDays(itinerary.startDate, itinerary.endDate)} days
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-2 text-blue-600" />
                      <span className="text-sm font-medium">{itinerary.destination}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt className="mr-2 text-purple-600" />
                      <span className="text-sm font-medium">
                        {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                      </span>
                    </div>
                    
                    {itinerary.days?.length > 0 && (
                      <div className="text-xs text-gray-500 bg-gray-50 inline-flex px-2 py-1 rounded-md border border-gray-200">
                        {itinerary.days.length} planned day{itinerary.days.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {itinerary.description && (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {itinerary.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/itineraries/${itinerary.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <FaEye className="mr-1.5" />
                      View
                    </Link>
                    <Link
                      href={`/itineraries/${itinerary.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      <FaEdit className="mr-1.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(itinerary.id)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                      aria-label="Delete trip"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Delete confirmation drawer */}
                {deleteConfirm === itinerary.id && (
                  <div className="px-6 pb-6">
                    <div className="mt-3 p-4 border rounded-lg bg-red-50 border-red-200">
                      <p className="text-sm text-red-800 font-medium mb-3">Delete this trip? This action cannot be undone.</p>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <FaTimes className="mr-1" /> Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(itinerary.id)}
                          disabled={deleting}
                          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                        >
                          {deleting ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-1" />}
                          {deleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}