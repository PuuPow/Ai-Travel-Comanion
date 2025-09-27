import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaPlane, FaStar, FaUtensils, FaCamera, FaFileExport, FaBell } from 'react-icons/fa';
import { format } from 'date-fns';
import DayPlanEditor from '../../components/DayPlanEditor';
import WeatherWidget from '../../components/WeatherWidget';
import ExportModal from '../../components/ExportModal';
import NotificationWidget from '../../components/NotificationWidget';

export default function ItineraryDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchItinerary();
    }
  }, [id]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
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
      setItinerary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries/${id}/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            budget: 'medium',
            interests: ['culture', 'food', 'sightseeing']
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      
      // Show success message with details
      if (data.daysCreated) {
        const message = [
          '🎉 AI Itinerary Generated Successfully!',
          '',
          `✅ Created ${data.daysCreated} days of activities`,
          `✨ Based on your destination: ${itinerary.destination}`,
          '📝 Tailored to your trip description'
        ];
        
        if (data.locationData && data.hasRealPlaces) {
          message.push('');
          message.push('🤖 AI Generated Material');
        }
        
        message.push('');
        message.push('Refresh the page to see your new day-by-day itinerary!');
        
        alert(message.join('\n'));
      } else {
        alert('AI itinerary generated successfully!');
      }
      
      // Refresh the itinerary to show new data
      await fetchItinerary();
      
    } catch (err) {
      alert('Error generating suggestions: ' + err.message);
    }
  };

  const handleNotificationAction = (action, notification) => {
    console.log('Notification action:', action, notification);
    
    switch (action) {
      case 'open_airline_website':
        // In a real app, this would open the specific airline website
        window.open('https://www.google.com/flights', '_blank');
        break;
      case 'set_departure_reminder':
        alert('Departure reminder set! You\'ll be notified 3 hours before your flight.');
        break;
      case 'check_traffic':
        window.open(`https://maps.google.com?q=${encodeURIComponent(itinerary.destination)}`, '_blank');
        break;
      case 'call_ride':
        alert('Opening ride booking options...');
        break;
      case 'view':
        // Scroll to relevant section or open details
        console.log('View notification details:', notification);
        break;
      case 'dismiss':
        console.log('Notification dismissed:', notification.title);
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested itinerary could not be found.'}</p>
          <Link href="/itineraries" className="text-blue-600 hover:text-blue-700">
            ← Back to Itineraries
          </Link>
        </div>
      </div>
    );
  }

  const duration = Math.ceil((new Date(itinerary.endDate) - new Date(itinerary.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>{itinerary.title} - Travel Planner</title>
        <meta name="description" content={`Itinerary for ${itinerary.destination}`} />
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
            <div className="flex items-center min-w-0">
              <Link href="/itineraries" className="text-white/90 hover:text-white transition-colors flex items-center text-sm sm:text-base">
                <FaArrowLeft className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Adventures</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Itinerary Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              {itinerary.title}
            </h2>
          </div>
          
          {/* Trip Details - Mobile Optimized Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-center sm:justify-start">
                <FaMapMarkerAlt className="text-blue-600 mr-3 text-lg" />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-blue-800">Destination</p>
                  <p className="font-bold text-blue-900 text-lg">{itinerary.destination}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-center sm:justify-start">
                <FaCalendarAlt className="text-purple-600 mr-3 text-lg" />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-purple-800">Dates</p>
                  <p className="font-bold text-purple-900 text-base sm:text-lg">
                    {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center sm:justify-start">
                <FaClock className="text-indigo-600 mr-3 text-lg" />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-indigo-800">Duration</p>
                  <p className="font-bold text-indigo-900 text-lg">{duration} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Centered */}
          {itinerary.description && (
            <div className="text-center mb-8">
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-700 text-lg leading-relaxed px-4">
                  {itinerary.description}
                </p>
              </div>
            </div>
          )}
          
          {/* Action Buttons - Enhanced with sharing and export */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={handleGenerateSuggestions}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              ✨ AI Suggestions
            </button>
            <Link
              href={`/itineraries/${id}/edit`}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <FaEdit className="mr-2" />
              Edit Adventure
            </Link>
            <button
              onClick={() => setExportModalOpen(true)}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-300"
            >
              <FaFileExport className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget 
            destination={itinerary.destination}
            startDate={itinerary.startDate}
            endDate={itinerary.endDate}
          />
        </div>

        {/* Notification Widget */}
        <div className="mb-8">
          <NotificationWidget 
            itinerary={itinerary}
            weatherData={weatherData}
            onNotificationAction={handleNotificationAction}
          />
        </div>

        {/* Days */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Day by Day Plan</h3>
          </div>

          {itinerary.days && itinerary.days.length > 0 ? (
            itinerary.days.map((day) => (
              <div key={day.id} className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Day {day.dayNumber} - {format(new Date(day.date), 'EEEE, MMMM d')}
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingDay(editingDay === day.id ? null : day.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  </div>

                  {editingDay === day.id ? (
                    <DayPlanEditor
                      day={day}
                      itineraryId={id}
                      onSave={(updatedDay) => {
                        // TODO: Update the day in the backend
                        setEditingDay(null);
                      }}
                      onCancel={() => setEditingDay(null)}
                    />
                  ) : (
                    <div>
                      {day.activities && day.activities.length > 0 ? (
                        <div className="space-y-4">
                          {day.activities.map((activity, index) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4 pb-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900">{activity.name || activity.activity}</p>
                                    {activity.rating && (
                                      <div className="flex items-center gap-1">
                                        <FaStar className="text-yellow-400 text-sm" />
                                        <span className="text-sm text-gray-600">{activity.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                  {activity.location && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                      <FaMapMarkerAlt className="text-blue-500" />
                                      {activity.location}
                                    </p>
                                  )}
                                  {(activity.duration || activity.cost) && (
                                    <div className="flex gap-4 mt-2">
                                      {activity.duration && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          ⏱️ {activity.duration}
                                        </span>
                                      )}
                                      {activity.cost && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          💰 {activity.cost}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {activity.time && (
                                  <span className="text-sm text-gray-500 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-medium">
                                    {activity.time}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* Meals section */}
                          {day.meals && day.meals.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FaUtensils className="text-green-600" />
                                Recommended Meals
                              </h5>
                              <div className="space-y-3">
                                {day.meals.map((meal, mealIndex) => (
                                  <div key={mealIndex} className="bg-green-50 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium text-green-800 capitalize">
                                            {meal.type}
                                          </span>
                                          {meal.rating && (
                                            <div className="flex items-center gap-1">
                                              <FaStar className="text-yellow-400 text-xs" />
                                              <span className="text-xs text-gray-600">{meal.rating}</span>
                                            </div>
                                          )}
                                        </div>
                                        <p className="font-medium text-gray-900">{meal.restaurant}</p>
                                        {meal.cuisine && (
                                          <p className="text-sm text-gray-600">{meal.cuisine}</p>
                                        )}
                                        {meal.location && (
                                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <FaMapMarkerAlt className="text-green-500" />
                                            {meal.location}
                                          </p>
                                        )}
                                      </div>
                                      {meal.priceRange && (
                                        <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                                          {meal.priceRange}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No activities planned for this day yet.</p>
                          <button
                            onClick={() => setEditingDay(day.id)}
                            className="text-blue-600 hover:text-blue-700 mt-2"
                          >
                            Add activities
                          </button>
                        </div>
                      )}

                      {day.notes && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {day.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-6 text-lg">No daily plans created yet.</p>
              <button
                onClick={handleGenerateSuggestions}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                ✨ Generate AI Itinerary
              </button>
            </div>
          )}
        </div>

        {/* Reservations */}
        {itinerary.reservations && itinerary.reservations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Reservations</h3>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {itinerary.reservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.title}</p>
                      <p className="text-sm text-gray-600">{reservation.type}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(reservation.date), 'MMM d, yyyy')}
                        {reservation.time && ` at ${reservation.time}`}
                      </p>
                    </div>
                    {reservation.confirmationNumber && (
                      <span className="text-sm text-gray-500">
                        Confirmation: {reservation.confirmationNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Generated Material Info */}
        {itinerary.days && itinerary.days.length > 0 && (
          <div className="mt-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">🤖 AI Generated Material</h4>
              <p className="text-sm text-blue-700">
                This itinerary was created using artificial intelligence and may contain suggestions that should be verified before your trip.
              </p>
            </div>
          </div>
        )}

        {/* Packing List */}
        {itinerary.packingList && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Packing List</h3>
              <Link
                href={`/packing/${itinerary.packingList.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                View Full List →
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">
                {itinerary.packingList.items?.length || 0} items in your packing list
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        itinerary={itinerary}
      />
    </div>
  );
}
