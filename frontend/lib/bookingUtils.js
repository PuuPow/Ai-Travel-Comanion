/**
 * Booking Platform Integration Utilities
 * Generates optimized search URLs for major booking platforms
 * Includes affiliate link support (requires partner setup)
 */

// Affiliate IDs - Replace with your actual affiliate IDs once approved
const AFFILIATE_CONFIG = {
  booking: {
    aid: 'YOUR_BOOKING_AFFILIATE_ID', // Replace with actual Booking.com affiliate ID
    label: 'travel-planner-app'
  },
  expedia: {
    TPID: 'YOUR_EXPEDIA_TPID', // Replace with actual Expedia TPID
    EAPID: 'YOUR_EXPEDIA_EAPID' // Replace with actual Expedia EAPID
  },
  kayak: {
    a: 'YOUR_KAYAK_AFFILIATE_ID' // Replace with actual Kayak affiliate ID
  },
  rentalcars: {
    aid: 'YOUR_RENTALCARS_AFFILIATE_ID' // Replace with actual RentalCars.com affiliate ID
  },
  getyourguide: {
    partner_id: 'YOUR_GETYOURGUIDE_PARTNER_ID' // Replace with actual GetYourGuide partner ID
  },
  travelinsurance: {
    affiliate_id: 'YOUR_TRAVELINSURANCE_AFFILIATE_ID' // Replace with actual TravelInsurance.com affiliate ID
  },
  insuremytrip: {
    affiliate_id: 'YOUR_INSUREMYTRIP_AFFILIATE_ID' // Replace with actual InsureMyTrip.com affiliate ID
  }
};

/**
 * Format date for booking platforms
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Calculate number of nights between dates
 */
const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
};

/**
 * Generate Booking.com search URL
 */
export const generateBookingUrl = (destination, checkIn, checkOut, guests = 2, rooms = 1) => {
  // For now, just go to homepage until affiliate partnership is set up
  return 'https://www.booking.com/';
};


/**
 * Generate Expedia search URL
 */
export const generateExpediaUrl = (destination, checkIn, checkOut, guests = 2) => {
  // For now, just go to homepage until affiliate partnership is set up
  return 'https://www.expedia.com/';
};


/**
 * Generate RentalCars.com homepage URL
 */
export const generateRentalCarsUrl = () => {
  return 'https://www.rentalcars.com/';
};

/**
 * Generate Enterprise car rental homepage URL
 */
export const generateEnterpriseUrl = () => {
  return 'https://www.enterprise.com/';
};


/**
 * Generate GetYourGuide activities URL
 */
export const generateGetYourGuideUrl = (destination, date = null) => {
  const params = new URLSearchParams({
    q: destination,
    partner_id: AFFILIATE_CONFIG.getyourguide.partner_id
  });

  if (date) {
    params.append('date', formatDate(date));
  }

  return `https://www.getyourguide.com/s?${params.toString()}`;
};

/**
 * Generate TravelInsurance.com search URL
 */
export const generateTravelInsuranceUrl = (destination, startDate, endDate, travelers = 1, tripCost = null) => {
  // For now, just go to homepage until affiliate partnership is set up
  return 'https://www.travelinsurance.com/';
};

/**
 * Generate InsureMyTrip.com search URL
 */
export const generateInsureMyTripUrl = (destination, startDate, endDate, travelers = 1, tripCost = null, age = null) => {
  // For now, just go to homepage until affiliate partnership is set up
  return 'https://www.insuremytrip.com/';
};


/**
 * Generate Kayak flight search URL
 */
export const generateKayakFlightUrl = (destination, departDate, returnDate = null, passengers = 1) => {
  // Use Kayak's search URL format that pre-fills destination
  const departureDateFormatted = formatDate(departDate);
  const returnDateFormatted = returnDate ? formatDate(returnDate) : '';
  
  const params = new URLSearchParams({
    origin: '', // Leave empty for user to fill
    destination: destination,
    depart: departureDateFormatted,
    return: returnDateFormatted,
    passengers: passengers,
    a: AFFILIATE_CONFIG.kayak.a
  });

  return `https://www.kayak.com/flights?${params.toString()}`;
};

/**
 * Generate Skyscanner flight search URL
 */
export const generateSkyscannerUrl = (destination, departDate, returnDate = null, passengers = 1) => {
  // Use Skyscanner's search format
  const departureDateFormatted = formatDate(departDate);
  const returnDateFormatted = returnDate ? formatDate(returnDate) : '';
  
  const params = new URLSearchParams({
    adults: passengers,
    children: 0,
    infants: 0,
    cabinclass: 'economy',
    rtn: returnDate ? '1' : '0',
    ref: 'travel-planner-app',
    iym: departureDateFormatted.substring(0, 7), // YYYY-MM format
    oym: returnDateFormatted ? returnDateFormatted.substring(0, 7) : '',
    destinationentity: destination
  });
  
  return `https://www.skyscanner.com/?${params.toString()}#flights/search/to/${encodeURIComponent(destination)}/${departureDateFormatted}${returnDateFormatted ? '/' + returnDateFormatted : ''}/${passengers}/0/0`;
};

/**
 * Get travel insurance recommendations based on trip details
 */
export const getTravelInsuranceRecommendations = (itinerary, travelers = 1, estimatedTripCost = null) => {
  const { destination, startDate, endDate, description } = itinerary;
  const nights = calculateNights(startDate, endDate);
  const isInternational = destination && !destination.toLowerCase().includes('united states');
  const isLongTrip = nights >= 14;
  const isExpensiveTrip = estimatedTripCost && estimatedTripCost > 5000;
  const isAdventureTrip = description?.toLowerCase().includes('adventure') || 
                         description?.toLowerCase().includes('hiking') ||
                         description?.toLowerCase().includes('extreme');

  const recommendations = [];

  // Base recommendation
  recommendations.push({
    type: 'comprehensive',
    title: 'Comprehensive Travel Insurance',
    description: 'Complete coverage including medical, trip cancellation, and baggage protection',
    coverage: ['Medical emergencies', 'Trip cancellation/interruption', 'Baggage loss', 'Travel delays'],
    priority: 1,
    recommended: true
  });

  if (isInternational) {
    recommendations.push({
      type: 'medical',
      title: 'International Medical Coverage',
      description: 'Essential medical coverage for international travel',
      coverage: ['Emergency medical', 'Medical evacuation', 'Prescription drugs'],
      priority: 1,
      recommended: true
    });
  }

  if (isLongTrip || isExpensiveTrip) {
    recommendations.push({
      type: 'cancel_any_reason',
      title: 'Cancel for Any Reason (CFAR)',
      description: 'Maximum flexibility with trip cancellation coverage',
      coverage: ['Cancel for any reason', 'Up to 75% trip cost refund', 'No questions asked'],
      priority: 1,
      recommended: true
    });
  }

  if (isAdventureTrip) {
    recommendations.push({
      type: 'adventure',
      title: 'Adventure Sports Coverage',
      description: 'Specialized coverage for adventure and extreme sports',
      coverage: ['Adventure sports accidents', 'Equipment coverage', 'Search and rescue'],
      priority: 1,
      recommended: true
    });
  }

  // Standard options
  recommendations.push({
    type: 'basic',
    title: 'Basic Travel Protection',
    description: 'Essential coverage at an affordable price',
    coverage: ['Trip cancellation', 'Medical emergencies', 'Baggage delay'],
    priority: 2,
    recommended: false
  });

  return {
    recommendations: recommendations.sort((a, b) => a.priority - b.priority),
    tips: [
      'Purchase insurance within 14 days of your initial trip payment for full coverage',
      'Review your existing health insurance and credit card benefits',
      'Consider the total cost of your trip when selecting coverage limits',
      isInternational ? 'International travel requires medical coverage' : null,
      isAdventureTrip ? 'Verify adventure activities are covered' : null
    ].filter(Boolean)
  };
};

/**
 * AI-powered accommodation type recommendations
 */
export const getAccommodationRecommendations = (itinerary) => {
  const { destination, startDate, endDate, description } = itinerary;
  const nights = calculateNights(startDate, endDate);
  const isLongStay = nights >= 7;
  const isBusiness = description?.toLowerCase().includes('business') || description?.toLowerCase().includes('work');
  const isFamily = description?.toLowerCase().includes('family') || description?.toLowerCase().includes('kids');
  const isRomantic = description?.toLowerCase().includes('romantic') || description?.toLowerCase().includes('honeymoon');
  
  const recommendations = [];

  if (isLongStay) {
    recommendations.push({
      type: 'apartment',
      title: 'Vacation Rentals & Apartments',
      description: 'Perfect for longer stays with kitchen facilities and more space',
      platforms: ['booking'],
      priority: 1,
      icon: '🏠'
    });
  }

  if (isBusiness) {
    recommendations.push({
      type: 'business_hotel',
      title: 'Business Hotels',
      description: 'Professional amenities, WiFi, meeting facilities',
      platforms: ['booking', 'expedia', 'hotels'],
      priority: 1,
      icon: '🏢'
    });
  }

  if (isFamily) {
    recommendations.push({
      type: 'family_friendly',
      title: 'Family-Friendly Accommodations',
      description: 'Kid-friendly amenities, connecting rooms, pools',
      platforms: ['booking', 'expedia'],
      priority: 1,
      icon: '👨‍👩‍👧‍👦'
    });
  }

  if (isRomantic) {
    recommendations.push({
      type: 'romantic',
      title: 'Romantic Hotels & Resorts',
      description: 'Couples retreats, spa services, romantic dining',
      platforms: ['booking', 'expedia'],
      priority: 1,
      icon: '💕'
    });
  }

  // Default recommendations
  recommendations.push({
    type: 'hotel',
    title: 'Hotels',
    description: 'Traditional hotel accommodations with full service',
    platforms: ['booking', 'expedia', 'hotels'],
    priority: 2,
    icon: '🏨'
  });

  recommendations.push({
    type: 'bnb',
    title: 'Bed & Breakfasts',
    description: 'Local hospitality with breakfast included',
    platforms: ['booking'],
    priority: 3,
    icon: '🏡'
  });

  return recommendations.sort((a, b) => a.priority - b.priority);
};

/**
 * Generate price estimates based on destination and dates
 */
export const estimateAccommodationPrices = (destination, checkIn, checkOut, accommodationType = 'hotel') => {
  // This would ideally connect to a real price estimation API
  // For now, we'll provide general estimates based on destination patterns
  
  const nights = calculateNights(checkIn, checkOut);
  
  // Base prices per night (in USD) - these are rough estimates
  const basePrices = {
    'hotel': { low: 80, mid: 150, high: 300 },
    'apartment': { low: 60, mid: 120, high: 250 },
    'bnb': { low: 50, mid: 100, high: 200 },
    'luxury': { low: 200, mid: 400, high: 800 }
  };

  // Destination multipliers (rough estimates)
  const destinationMultipliers = {
    // High-cost destinations
    'New York': 1.8,
    'London': 1.6,
    'Paris': 1.5,
    'Tokyo': 1.7,
    'San Francisco': 1.9,
    'Zurich': 2.0,
    
    // Medium-cost destinations  
    'Barcelona': 1.2,
    'Rome': 1.3,
    'Berlin': 1.1,
    'Amsterdam': 1.4,
    
    // Lower-cost destinations
    'Prague': 0.7,
    'Budapest': 0.6,
    'Bangkok': 0.4,
    'Mexico City': 0.5
  };

  const multiplier = destinationMultipliers[destination] || 1.0;
  const prices = basePrices[accommodationType] || basePrices.hotel;

  return {
    perNight: {
      budget: Math.round(prices.low * multiplier),
      midRange: Math.round(prices.mid * multiplier),
      luxury: Math.round(prices.high * multiplier)
    },
    total: {
      budget: Math.round(prices.low * multiplier * nights),
      midRange: Math.round(prices.mid * multiplier * nights),
      luxury: Math.round(prices.high * multiplier * nights)
    },
    currency: 'USD',
    nights
  };
};

/**
 * Get all booking platforms with their search URLs
 */
export const getAllBookingOptions = (itinerary, guests = 2, rooms = 1) => {
  const { destination, startDate, endDate } = itinerary;
  
  return {
    accommodations: [
      {
        name: 'Booking.com',
        description: 'Largest selection of hotels worldwide',
        url: generateBookingUrl(destination, startDate, endDate, guests, rooms),
        logo: '🏨',
        features: ['Free cancellation', 'No booking fees', 'Verified reviews']
      },
      {
        name: 'Hotels.com',
        description: 'Collect nights, get free stays with Hotels.com Rewards',
        url: 'https://www.hotels.com/',
        logo: '🏩',
        features: ['Rewards program', 'Secret prices', 'Best price guarantee']
      },
      {
        name: 'Expedia',
        description: 'Bundle deals and rewards program',
        url: generateExpediaUrl(destination, startDate, endDate, guests),
        logo: '✈️',
        features: ['Package deals', 'Rewards points', 'Mobile exclusive deals']
      }
    ],
    flights: [
      {
        name: 'Kayak',
        description: 'Compare flight prices across airlines',
        url: generateKayakFlightUrl(destination, startDate, endDate, guests),
        logo: '🛩️',
        features: ['Price comparison', 'Price alerts', 'Flexible dates']
      },
      {
        name: 'Skyscanner',
        description: 'Find cheap flights anywhere',
        url: generateSkyscannerUrl(destination, startDate, endDate, guests),
        logo: '✈️',
        features: ['Whole month search', 'Price alerts', 'Flexible destinations']
      }
    ],
    carRentals: [
      {
        name: 'RentalCars.com',
        description: 'Compare prices from major car rental companies',
        url: generateRentalCarsUrl(),
        logo: '🚗',
        features: ['Price comparison', 'Free cancellation', 'No hidden fees']
      },
      {
        name: 'Enterprise',
        description: 'Premium car rental service',
        url: generateEnterpriseUrl(),
        logo: '🚙',
        features: ['Premium vehicles', 'Business services', 'Loyalty program']
      }
    ],
    activities: [
      {
        name: 'GetYourGuide',
        description: 'Book tours, activities, and experiences',
        url: generateGetYourGuideUrl(destination, startDate),
        logo: '🎭',
        features: ['Skip-the-line tickets', 'Local guides', 'Mobile tickets']
      }
    ],
    insurance: [
      {
        name: 'TravelInsurance.com',
        description: 'Compare travel insurance plans from top providers',
        url: generateTravelInsuranceUrl(destination, startDate, endDate, guests),
        logo: '🛡️',
        features: ['Compare multiple providers', 'Instant quotes', 'Medical & trip protection']
      },
      {
        name: 'InsureMyTrip',
        description: 'Find the right travel insurance for your trip',
        url: generateInsureMyTripUrl(destination, startDate, endDate, guests),
        logo: '🔒',
        features: ['Award-winning service', 'Zero complaint rating', 'Anytime Advocates']
      }
    ]
  };
};
