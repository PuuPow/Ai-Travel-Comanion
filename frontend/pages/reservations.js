import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaPlus, FaBrain } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AIBookingAssistant from '../components/AIBookingAssistant';
import ManualBookingEntry from '../components/ManualBookingEntry';
import BookingConfirmation from '../components/BookingConfirmation';

export default function Reservations() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedItineraryForBooking, setSelectedItineraryForBooking] = useState(null);
  
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

  // Load bookings from localStorage (in a real app, this would be from an API)
  useEffect(() => {
    const savedBookings = localStorage.getItem('travel_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
  }, []);

  // Save bookings to localStorage (in a real app, this would be to an API)
  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem('travel_bookings', JSON.stringify(newBookings));
  };

  const handleAddBooking = async (booking) => {
    const newBookings = [...bookings, booking];
    saveBookings(newBookings);
  };

  const handleEditBooking = (booking) => {
    setSelectedItineraryForBooking(
      itineraries.find(it => it.id === booking.itineraryId)
    );
    // In a real app, you'd pre-populate the edit form with the booking data
    setShowManualBooking(true);
  };

  const handleDeleteBooking = (bookingId) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      const newBookings = bookings.filter(b => b.id !== bookingId);
      saveBookings(newBookings);
    }
  };

  const getBookingsForItinerary = (itineraryId) => {
    return bookings.filter(booking => booking.itineraryId === itineraryId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Head>
          <title>Reservations - Travel Planner</title>
          <meta name="description" content="Manage your travel reservations" />
        </Head>

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <FaPlane className="text-white text-xl mr-2" />
                  <h1 className="text-xl font-bold text-white">AI Travel Companion</h1>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/itineraries" className="text-white/90 hover:text-white font-medium transition-colors">
                  My Trips
                </Link>
                <Link href="/reservations" className="text-white font-medium">
                  Reservations
                </Link>
                <Link href="/packing" className="text-white/90 hover:text-white font-medium transition-colors">
                  Packing
                </Link>
                <Link href="/account" className="text-white/90 hover:text-white transition-colors cursor-pointer hover:underline">
                  Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                </Link>
                <button
                  onClick={logout}
                  className="text-white/90 hover:text-red-200 font-medium transition-colors"
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
              <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
              <p className="text-gray-600 mt-2">AI-powered booking assistance for your travel adventures</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowAIAssistant(!showAIAssistant);
                  if (!showAIAssistant && itineraries.length > 0) {
                    setSelectedItinerary(itineraries[0]);
                  }
                }}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg transition-colors ${
                  showAIAssistant 
                    ? 'text-white bg-purple-600 hover:bg-purple-700' 
                    : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <FaBrain className="mr-2" />
                AI Booking Assistant
              </button>
              <Link
                href="/itineraries/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="mr-2" />
                New Trip
              </Link>
            </div>
          </div>

          {/* AI Booking Assistant Section */}
          {showAIAssistant && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBrain className="text-purple-600 mr-3" />
                  AI Booking Assistant
                </h2>
                
                {itineraries.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select a trip for booking recommendations:
                    </label>
                    <select
                      value={selectedItinerary?.id || ''}
                      onChange={(e) => {
                        const selected = itineraries.find(it => it.id === e.target.value);
                        setSelectedItinerary(selected);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-64"
                    >
                      <option value="">Choose a trip...</option>
                      {itineraries.map((itinerary) => (
                        <option key={itinerary.id} value={itinerary.id}>
                          {itinerary.title} - {itinerary.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <AIBookingAssistant 
                itinerary={selectedItinerary} 
                guests={2} 
                rooms={1} 
              />
            </div>
          )}

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
              <FaCalendarAlt className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No reservations yet</h3>
              <p className="text-gray-600 mb-6">Create your first itinerary to start adding reservations!</p>
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
                Showing reservation opportunities from your {itineraries.length} trip{itineraries.length > 1 ? 's' : ''}
              </div>
              
              {itineraries.map((itinerary) => (
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
                            <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
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
                    
                    {itinerary.reservations && itinerary.reservations.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Existing Reservations ({itinerary.reservations.length})</h4>
                        <div className="space-y-2">
                          {itinerary.reservations.map((reservation) => (
                            <div key={reservation.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div>
                                <p className="font-medium text-green-900">{reservation.title}</p>
                                <p className="text-sm text-green-700">{reservation.type}</p>
                              </div>
                              {reservation.confirmationNumber && (
                                <span className="text-sm text-green-600 font-mono">
                                  {reservation.confirmationNumber}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {/* Show actual bookings if any */}
                        {getBookingsForItinerary(itinerary.id).length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Your Bookings ({getBookingsForItinerary(itinerary.id).length})</h4>
                              <button
                                onClick={() => {
                                  setSelectedItineraryForBooking(itinerary);
                                  setShowManualBooking(true);
                                }}
                                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                              >
                                <FaPlus className="inline mr-1" /> Add Booking
                              </button>
                            </div>
                            {getBookingsForItinerary(itinerary.id).map((booking) => (
                              <BookingConfirmation
                                key={booking.id}
                                booking={booking}
                                onEdit={handleEditBooking}
                                onDelete={handleDeleteBooking}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-blue-900 font-medium">Ready for Reservations!</p>
                              <button
                                onClick={() => {
                                  setSelectedItineraryForBooking(itinerary);
                                  setShowManualBooking(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                              >
                                <FaPlus className="mr-2" /> Add First Booking
                              </button>
                            </div>
                            <p className="text-blue-700 text-sm mb-3">
                              Add your confirmed bookings for flights, hotels, and activities.
                            </p>
                            <div className="space-y-2 text-sm text-blue-600">
                              <div>• ✈️ Flights to {itinerary.destination}</div>
                              <div>• 🏨 Hotels and accommodations</div>
                              <div>• 🎯 Activities and dining</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Booking Entry Modal */}
        {showManualBooking && selectedItineraryForBooking && (
          <ManualBookingEntry
            itinerary={selectedItineraryForBooking}
            onBookingAdded={handleAddBooking}
            onClose={() => {
              setShowManualBooking(false);
              setSelectedItineraryForBooking(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
