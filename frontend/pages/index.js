import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaCalendarAlt, FaSuitcase, FaMapMarkedAlt, FaArrowRight, FaPlus, FaBrain, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Force page refresh to update authentication state
    window.location.reload();
  };

  useEffect(() => {
    // TODO: Fetch recent itineraries and upcoming reservations
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Travel Planner - Your AI-Powered Travel Companion</title>
        <meta name="description" content="Plan your perfect trip with AI-powered itineraries, smart packing lists, and reservation management." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <FaPlane className="text-white text-xl flex-shrink-0" />
              <h1 className="text-xl font-bold text-white ml-2 hidden sm:block">AI Travel Companion</h1>
              <h1 className="text-lg font-bold text-white ml-2 sm:hidden">Travel</h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 min-w-0">
              {isAuthenticated() ? (
                <>
                  <Link href="/itineraries" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base">
                    <span className="hidden sm:inline">My Adventures</span>
                    <span className="sm:hidden">Adventures</span>
                  </Link>
                  <Link href="/reservations" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base hidden md:inline-block">
                    <span className="hidden lg:inline">Reservations</span>
                    <span className="lg:hidden">Bookings</span>
                  </Link>
                  <Link href="/account" className="text-white/90 hover:text-white text-xs sm:text-sm hidden lg:inline truncate transition-colors cursor-pointer hover:underline">
                    Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </Link>
                  <Link href="/account" className="text-white/90 hover:text-white text-xs sm:text-sm lg:hidden transition-colors cursor-pointer hover:underline">
                    Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 sm:px-3 rounded-md hover:bg-white/10 text-xs sm:text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-white text-blue-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base">
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Join</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080&h=1920&fit=crop&q=80"
            alt="Beautiful travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {/* Content */}
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
              Plan Your Perfect
              <span className="block text-blue-300 mt-2">Travel Adventure</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered travel planning that creates personalized itineraries, manages reservations, and suggests smart packing lists for your perfect trip.
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Link 
                href="/itineraries"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl text-lg w-full"
              >
                Start Planning
                <FaArrowRight className="ml-3" />
              </Link>
              <Link 
                href="/itineraries"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105 text-lg w-full"
              >
                View My Adventures
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive travel planning tools designed for the modern traveler
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Smart Itineraries */}
            <Link href="/itineraries" className="group relative block overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 h-96">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1539650116574-75c0c6d73901?w=540&h=960&fit=crop&q=80"
                  alt="Smart Itineraries"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black opacity-50 to-transparent group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-center p-6 text-center">
                <FaMapMarkedAlt className="text-white text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">Smart Itineraries</h3>
                <p className="text-gray-100 text-base md:text-lg leading-relaxed font-medium">
                  AI-powered travel planning that creates personalized day-by-day itineraries for your trips.
                </p>
              </div>
            </Link>

            {/* Reservation Management */}
            <Link href="/reservations" className="group relative block overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 h-96">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=540&h=960&fit=crop&q=80"
                  alt="Reservation Management"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black opacity-50 to-transparent group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-center p-6 text-center">
                <FaCalendarAlt className="text-white text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors duration-300">Reservations</h3>
                <p className="text-gray-100 text-base md:text-lg leading-relaxed font-medium">
                  Keep track of all your bookings - flights, hotels, restaurants, and activities in one place.
                </p>
              </div>
            </Link>

            {/* Smart Packing */}
            <Link href="/packing" className="group relative block overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 h-96">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=540&h=960&fit=crop&q=80"
                  alt="Smart Packing Lists"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black opacity-50 to-transparent group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-center p-6 text-center">
                <FaSuitcase className="text-white text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">Smart Packing</h3>
                <p className="text-gray-100 text-base md:text-lg leading-relaxed font-medium">
                  Get personalized packing suggestions based on your destination, weather, and activities.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>


      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaPlane className="text-blue-400 text-2xl mr-3" />
              <span className="text-2xl font-bold">AI Travel Companion</span>
            </div>
            <p className="text-gray-400">Your AI-powered travel adventure planner</p>
          </div>
        </div>
      </footer>
    </div>
  );
}