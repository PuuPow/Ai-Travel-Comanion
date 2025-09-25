import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaSuitcase, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaPlus, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Packing() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch itineraries
  useEffect(() => {
    const fetchItineraries = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoading(true);
        
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch itineraries');
        }
        
        const data = await response.json();
        setItineraries(data);
        setError('');
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        if (err.response?.status === 401) {
          logout();
          router.push('/login');
        } else {
          setError('Failed to load itineraries');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [isAuthenticated, logout, router]);

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

  // Sample packing suggestions based on destination and duration
  const getPackingSuggestions = (destination, days) => {
    const base = [
      'Underwear (' + days + ' pairs)',
      'Socks (' + days + ' pairs)',
      'T-shirts (' + Math.ceil(days/2) + ')',
      'Pants/Shorts (' + Math.ceil(days/3) + ' pairs)',
      'Phone charger',
      'Toothbrush & toothpaste',
      'Shampoo & body wash',
      'Camera'
    ];
    
    // Add destination-specific items
    if (destination.toLowerCase().includes('beach') || destination.toLowerCase().includes('hawaii') || destination.toLowerCase().includes('florida')) {
      base.push('Swimwear', 'Sunscreen', 'Sunglasses', 'Beach towel');
    }
    if (destination.toLowerCase().includes('europe') || destination.toLowerCase().includes('mountain')) {
      base.push('Warm jacket', 'Comfortable walking shoes', 'Umbrella');
    }
    if (days > 7) {
      base.push('Laundry detergent pods', 'Extra shoes');
    }
    
    return base;
  };

  if (authLoading || (!isAuthenticated() && !authLoading)) {
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Smart Packing - Travel Planner</title>
          <meta name="description" content="Manage your travel packing lists" />
        </Head>

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <FaPlane className="text-blue-600 text-xl mr-2" />
                  <h1 className="text-xl font-bold text-gray-900">Travel Planner</h1>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/itineraries" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Trips
                </Link>
                <Link href="/reservations" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Reservations
                </Link>
                <Link href="/packing" className="text-blue-600 font-medium">
                  Packing
                </Link>
                <Link href="/account" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer hover:underline">
                  Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Packing Lists</h1>
              <p className="text-gray-600 mt-2">AI-powered packing suggestions for your trips</p>
            </div>
            <Link
              href="/itineraries/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FaPlus className="mr-2" />
              New Trip
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-12">
              <FaSuitcase className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No packing lists yet</h3>
              <p className="text-gray-600 mb-6">Create your first itinerary to get smart packing suggestions!</p>
              <Link
                href="/itineraries/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="mr-2" />
                Create Your First Trip
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-gray-500 mb-4">
                Smart packing suggestions for your {itineraries.length} trip{itineraries.length > 1 ? 's' : ''}
              </div>
              
              {itineraries.map((itinerary) => {
                const days = calculateDays(itinerary.startDate, itinerary.endDate);
                const suggestions = getPackingSuggestions(itinerary.destination, days);
                const hasExistingList = itinerary.packingList && itinerary.packingList.items?.length > 0;
                
                return (
                  <div
                    key={itinerary.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {itinerary.title}
                          </h3>
                          <div className="flex items-center text-gray-600 space-x-4 text-sm">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-1" />
                              <span>{itinerary.destination}</span>
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)} ({days} days)</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/itineraries/${itinerary.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <FaEye className="mr-1.5" />
                          View Trip
                        </Link>
                      </div>
                      
                      {hasExistingList ? (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <FaCheckCircle className="text-green-500 mr-2" />
                            Your Packing List ({itinerary.packingList.items.length} items)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {itinerary.packingList.items.slice(0, 9).map((item, index) => (
                              <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-green-900">{item.name || item}</span>
                              </div>
                            ))}
                            {itinerary.packingList.items.length > 9 && (
                              <div className="text-gray-500 p-2">
                                +{itinerary.packingList.items.length - 9} more items...
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FaSuitcase className="text-purple-500 mr-2" />
                            Smart Packing Suggestions for {itinerary.destination}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-4">
                            {suggestions.map((item, index) => (
                              <div key={index} className="flex items-center p-2 bg-purple-50 border border-purple-200 rounded">
                                <FaCircle className="text-purple-400 mr-2 text-xs" />
                                <span className="text-purple-900">{item}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-900 font-medium mb-1">AI-Powered Suggestions Ready!</p>
                            <p className="text-blue-700 text-sm">
                              These suggestions are based on your destination ({itinerary.destination}) and trip duration ({days} days).
                              Visit your trip details to customize your packing list.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
