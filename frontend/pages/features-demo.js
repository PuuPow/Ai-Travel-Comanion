import React, { useState } from 'react';
import Head from 'next/head';
import { FaShare, FaFileExport, FaBell, FaPlane } from 'react-icons/fa';
import ShareTripModal from '../components/ShareTripModal';
import ExportModal from '../components/ExportModal';
import NotificationWidget from '../components/NotificationWidget';

export default function FeaturesDemo() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Sample itinerary data for testing
  const sampleItinerary = {
    id: 'demo-trip-123',
    title: 'Amazing Paris Adventure',
    destination: 'Paris, France',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    description: 'A romantic getaway exploring the City of Light with museums, cafes, and iconic landmarks.',
    activities: [
      {
        title: 'Visit Eiffel Tower',
        description: 'Iconic iron lattice tower and symbol of Paris',
        location: 'Champ de Mars, 5 Avenue Anatole France',
        date: '2024-03-16',
        time: '10:00 AM',
        duration: '2 hours',
        cost: '€25'
      },
      {
        title: 'Louvre Museum',
        description: 'World\'s largest art museum',
        location: 'Rue de Rivoli',
        date: '2024-03-17',
        time: '9:00 AM',
        duration: '4 hours',
        cost: '€17'
      },
      {
        title: 'Seine River Cruise',
        description: 'Romantic boat tour along the Seine',
        location: 'Port de Suffren',
        date: '2024-03-18',
        time: '7:00 PM',
        duration: '1.5 hours',
        cost: '€15'
      }
    ],
    meals: [
      {
        type: 'dinner',
        restaurant: 'Le Comptoir du Relais',
        cuisine: 'French Bistro',
        date: '2024-03-16',
        time: '8:00 PM',
        notes: 'Reservations recommended'
      },
      {
        type: 'lunch',
        restaurant: 'L\'As du Fallafel',
        cuisine: 'Middle Eastern',
        date: '2024-03-17',
        time: '12:30 PM',
        notes: 'Famous falafel in the Marais district'
      }
    ],
    weather: {
      temperature: 12,
      description: 'partly cloudy'
    },
    estimatedCost: 1200
  };

  const handleNotificationAction = (action, notification) => {
    console.log('Demo notification action:', action, notification);
    
    switch (action) {
      case 'open_airline_website':
        alert('Opening airline website... (Demo)');
        break;
      case 'set_departure_reminder':
        alert('Departure reminder set! (Demo)');
        break;
      case 'check_traffic':
        alert('Checking traffic conditions... (Demo)');
        break;
      case 'call_ride':
        alert('Opening ride booking options... (Demo)');
        break;
      case 'view':
        alert('Viewing notification details... (Demo)');
        break;
      case 'dismiss':
        alert('Notification dismissed! (Demo)');
        break;
      default:
        alert(`Unknown action: ${action} (Demo)`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>Features Demo - Travel Planner</title>
        <meta name="description" content="Test the new sharing, export, and notification features" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <FaPlane className="text-white text-2xl mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-white">Features Demo</h1>
              <p className="text-blue-100">Test all the new sharing, export, and notification features</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sample Trip Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {sampleItinerary.title}
            </h2>
            <p className="text-gray-600 text-lg">{sampleItinerary.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
              <h3 className="font-semibold text-blue-800 mb-1">Destination</h3>
              <p className="text-blue-900">{sampleItinerary.destination}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
              <h3 className="font-semibold text-purple-800 mb-1">Duration</h3>
              <p className="text-purple-900">7 days</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
              <h3 className="font-semibold text-green-800 mb-1">Activities</h3>
              <p className="text-green-900">{sampleItinerary.activities.length} planned</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaShare className="mr-2" />
              Test Share Features
            </button>
            
            <button
              onClick={() => setExportModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaFileExport className="mr-2" />
              Test Export Features
            </button>
          </div>
        </div>

        {/* Notification Widget Demo */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FaBell className="mr-3 text-blue-600" />
            Smart Notifications Demo
          </h3>
          <p className="text-gray-600 mb-6">
            This widget shows smart notifications based on your trip timing and details.
            It includes packing reminders, weather alerts, and travel preparation tips.
          </p>
          <NotificationWidget 
            itinerary={sampleItinerary}
            weatherData={null}
            onNotificationAction={handleNotificationAction}
          />
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🚀 New Features Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShare className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Trip Sharing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Generate shareable links</li>
                <li>• Social media integration</li>
                <li>• Collaborative planning</li>
                <li>• Beautiful trip cards</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileExport className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Export Options</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF itineraries</li>
                <li>• Calendar integration</li>
                <li>• JSON data export</li>
                <li>• Print-friendly formats</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBell className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Notifications</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Packing reminders</li>
                <li>• Weather alerts</li>
                <li>• Flight check-ins</li>
                <li>• Document reminders</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-2">📱 PWA Features</h5>
            <p className="text-blue-800 text-sm mb-3">
              This app is now a Progressive Web App with offline support, push notifications, and mobile optimization.
            </p>
            <ul className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-1">
              <li>• Install as mobile app</li>
              <li>• Offline itinerary access</li>
              <li>• Background notifications</li>
              <li>• File sharing integration</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ShareTripModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        itinerary={sampleItinerary}
      />
      
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        itinerary={sampleItinerary}
      />
    </div>
  );
}