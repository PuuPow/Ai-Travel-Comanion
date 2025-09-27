import React, { useState, useEffect } from 'react';
import { 
  FaBrain, 
  FaHotel, 
  FaPlane, 
  FaExternalLinkAlt, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaUsers, 
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa';
import {
  getAllBookingOptions,
  getAccommodationRecommendations,
  estimateAccommodationPrices,
  getTravelInsuranceRecommendations
} from '../lib/bookingUtils';

const AIBookingAssistant = ({ itinerary, guests: initialGuests = 2, rooms: initialRooms = 1 }) => {
  const [bookingOptions, setBookingOptions] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insuranceRecommendations, setInsuranceRecommendations] = useState(null);
  const [priceEstimates, setPriceEstimates] = useState({});
  const [selectedAccommodationType, setSelectedAccommodationType] = useState('hotel');
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    accommodations: false,
    flights: false,
    carRentals: false,
    activities: false,
    insurance: false,
    prices: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (itinerary) {
      analyzeItinerary();
    }
  }, [itinerary, guests, rooms, selectedAccommodationType]);

  const analyzeItinerary = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Get booking options
      const options = getAllBookingOptions(itinerary, guests, rooms);
      setBookingOptions(options);

      // Get AI recommendations
      const recs = getAccommodationRecommendations(itinerary);
      setRecommendations(recs);

      // Get travel insurance recommendations
      const insuranceRecs = getTravelInsuranceRecommendations(itinerary, guests);
      setInsuranceRecommendations(insuranceRecs);

      // Get price estimates for different accommodation types
      const estimates = {};
      const accommodationTypes = ['hotel', 'apartment', 'bnb', 'luxury'];
      
      accommodationTypes.forEach(type => {
        estimates[type] = estimateAccommodationPrices(
          itinerary.destination,
          itinerary.startDate,
          itinerary.endDate,
          type
        );
      });
      
      setPriceEstimates(estimates);
    } catch (error) {
      console.error('Error analyzing itinerary:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate URL for recommendation platform
  const getPlatformUrl = (platform, accommodationType = 'hotel') => {
    if (!itinerary) return '#';
    
    const { destination, startDate, endDate } = itinerary;
    
    switch (platform.toLowerCase()) {
      case 'booking':
        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${startDate}&checkout=${endDate}&group_adults=${guests}&no_rooms=${rooms}`;
      case 'expedia':
        const checkInFormatted = new Date(startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const checkOutFormatted = new Date(endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${checkInFormatted}&endDate=${checkOutFormatted}&adults=${guests}&rooms=${rooms}`;
      case 'hotels':
        return `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(destination)}&q-check-in=${startDate}&q-check-out=${endDate}&q-rooms=${rooms}&q-room-0-adults=${guests}`;
      default:
        return `https://www.google.com/search?q=${encodeURIComponent(destination + ' hotels')}`;
    }
  };


  if (!itinerary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <FaInfoCircle className="mx-auto text-gray-400 text-2xl mb-2" />
        <p className="text-gray-600">Select a trip to see AI booking recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <FaBrain className={`text-2xl mr-3 ${isAnalyzing ? 'animate-pulse' : ''}`} />
          <div>
            <h3 className="text-xl font-bold">AI Booking Assistant</h3>
            <p className="text-purple-100">
              {isAnalyzing ? 'Analyzing your trip...' : 'Smart recommendations for your adventure'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
          </div>
          <div className="flex items-center">
            <FaUsers className="mr-2" />
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num} className="text-gray-900">{num} guest{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <FaHotel className="mr-2" />
            <select
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value))}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num} className="text-gray-900">{num} room{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing destination trends and finding the best deals...</p>
        </div>
      ) : (
        <>
          {/* AI Recommendations */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
              onClick={() => toggleSection('recommendations')}
            >
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-3" />
                <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
                <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI Powered
                </span>
              </div>
              {expandedSections.recommendations ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.recommendations && (
              <div className="p-4">
                <div className="grid gap-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                        <div className="flex items-center mb-3 sm:mb-0">
                          <span className="text-2xl mr-3 flex-shrink-0">{rec.icon}</span>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-medium text-gray-900">{rec.title}</h5>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:space-x-1">
                          {rec.platforms.map((platform) => (
                            <a
                              key={platform}
                              href={getPlatformUrl(platform, rec.type)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 hover:text-blue-900 px-2 py-1 rounded whitespace-nowrap transition-colors cursor-pointer inline-flex items-center"
                            >
                              {platform === 'booking' ? 'Booking.com' : 
                               platform === 'expedia' ? 'Expedia' : 
                               platform === 'hotels' ? 'Hotels.com' : 
                               platform.charAt(0).toUpperCase() + platform.slice(1)}
                              <FaExternalLinkAlt className="ml-1 text-xs opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Estimates */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
              onClick={() => toggleSection('prices')}
            >
              <div className="flex items-center">
                <FaDollarSign className="text-green-500 mr-3" />
                <h4 className="font-semibold text-gray-900">Price Estimates</h4>
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {priceEstimates[selectedAccommodationType]?.nights} nights
                </span>
              </div>
              {expandedSections.prices ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.prices && (
              <div className="p-4">
                <div className="mb-4">
                  <select
                    value={selectedAccommodationType}
                    onChange={(e) => setSelectedAccommodationType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="hotel">Hotels</option>
                    <option value="apartment">Apartments</option>
                    <option value="bnb">Bed & Breakfasts</option>
                    <option value="luxury">Luxury Stays</option>
                  </select>
                </div>

                {priceEstimates[selectedAccommodationType] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['budget', 'midRange', 'luxury'].map((tier) => (
                      <div key={tier} className="border border-gray-200 rounded-lg p-4 text-center">
                        <h5 className="font-medium text-gray-900 capitalize mb-2">{tier === 'midRange' ? 'Mid-Range' : tier}</h5>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                          {formatPrice(priceEstimates[selectedAccommodationType].total[tier])}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(priceEstimates[selectedAccommodationType].perNight[tier])}/night
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accommodation Options */}
          {bookingOptions && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => toggleSection('accommodations')}
              >
                <div className="flex items-center">
                  <FaHotel className="text-blue-500 mr-3" />
                  <h4 className="font-semibold text-gray-900">Accommodation Options</h4>
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {bookingOptions.accommodations.length} platforms
                  </span>
                </div>
                {expandedSections.accommodations ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.accommodations && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookingOptions.accommodations.map((platform, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="text-2xl mr-3 flex-shrink-0">{platform.logo}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900">{platform.name}</h5>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto flex-shrink-0"
                          >
                            Search
                            <FaExternalLinkAlt className="ml-2 text-xs" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flight Options */}
          {bookingOptions && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => toggleSection('flights')}
              >
                <div className="flex items-center">
                  <FaPlane className="text-indigo-500 mr-3" />
                  <h4 className="font-semibold text-gray-900">Flight Options</h4>
                  <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {bookingOptions.flights.length} platforms
                  </span>
                </div>
                {expandedSections.flights ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.flights && (
                <div className="p-4">
                  <div className="grid gap-4">
                    {bookingOptions.flights.map((platform, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="text-2xl mr-3 flex-shrink-0">{platform.logo}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900">{platform.name}</h5>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto flex-shrink-0"
                          >
                            Search Flights
                            <FaExternalLinkAlt className="ml-2 text-xs" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Car Rental Options */}
          {bookingOptions && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => toggleSection('carRentals')}
              >
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">🚗</span>
                  <h4 className="font-semibold text-gray-900">Car Rental Options</h4>
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {bookingOptions.carRentals.length} platforms
                  </span>
                </div>
                {expandedSections.carRentals ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.carRentals && (
                <div className="p-4">
                  <div className="grid gap-4">
                    {bookingOptions.carRentals.map((platform, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="text-2xl mr-3 flex-shrink-0">{platform.logo}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900">{platform.name}</h5>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto flex-shrink-0"
                          >
                            Search Cars
                            <FaExternalLinkAlt className="ml-2 text-xs" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activities & Tours Options */}
          {bookingOptions && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => toggleSection('activities')}
              >
                <div className="flex items-center">
                  <span className="text-purple-500 mr-3 text-xl">🎭</span>
                  <h4 className="font-semibold text-gray-900">Activities & Tours</h4>
                  <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {bookingOptions.activities.length} platforms
                  </span>
                </div>
                {expandedSections.activities ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.activities && (
                <div className="p-4">
                  <div className="grid gap-4">
                    {bookingOptions.activities.map((platform, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="text-2xl mr-3 flex-shrink-0">{platform.logo}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900">{platform.name}</h5>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto flex-shrink-0"
                          >
                            Browse Activities
                            <FaExternalLinkAlt className="ml-2 text-xs" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Travel Insurance Options */}
          {bookingOptions && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => toggleSection('insurance')}
              >
                <div className="flex items-center">
                  <FaShieldAlt className="text-orange-500 mr-3" />
                  <h4 className="font-semibold text-gray-900">Travel Insurance</h4>
                  <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {bookingOptions.insurance.length} providers
                  </span>
                </div>
                {expandedSections.insurance ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.insurance && (
                <div className="p-4">
                  {/* Insurance Recommendations */}
                  {insuranceRecommendations && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FaStar className="text-yellow-500 mr-2" />
                        Recommended Coverage
                      </h5>
                      <div className="grid gap-3 mb-4">
                        {insuranceRecommendations.recommendations.filter(rec => rec.recommended).map((rec, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <h6 className="font-medium text-orange-900 mb-1">{rec.title}</h6>
                            <p className="text-sm text-orange-700 mb-2">{rec.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.coverage.map((item, idx) => (
                                <span key={idx} className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Insurance Tips */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <h6 className="font-medium text-blue-900 mb-2 flex items-center">
                          <FaInfoCircle className="mr-2" />
                          Insurance Tips
                        </h6>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {insuranceRecommendations.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Insurance Platforms */}
                  <div className="grid gap-4">
                    {bookingOptions.insurance.map((platform, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="text-2xl mr-3 flex-shrink-0">{platform.logo}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900">{platform.name}</h5>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors w-full sm:w-auto flex-shrink-0"
                          >
                            Get Quote
                            <FaExternalLinkAlt className="ml-2 text-xs" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <div className="flex items-start">
              <FaInfoCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 mb-1">
                  <strong>Legal Disclosure:</strong> We may earn commissions from bookings made through these links.
                </p>
                <p className="text-yellow-700">
                  Prices are estimates and may vary. Always verify final prices and terms on the booking platform.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIBookingAssistant;