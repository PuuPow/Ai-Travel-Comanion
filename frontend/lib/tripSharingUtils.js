/**
 * Trip Sharing Utilities
 * Handles trip sharing, collaboration, and social media integration
 */

/**
 * Generate a shareable link for an itinerary
 */
export const generateShareableLink = (itinerary, options = {}) => {
  const { 
    includePrivateNotes = false, 
    allowEditing = false,
    expiresIn = '30d' // 30 days default
  } = options;

  // In a real app, this would generate a unique share token and store permissions
  const shareToken = generateShareToken();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  
  const params = new URLSearchParams({
    share: shareToken,
    edit: allowEditing ? '1' : '0',
    notes: includePrivateNotes ? '1' : '0',
    expires: expiresIn
  });

  return {
    url: `${baseUrl}/shared/${itinerary.id}?${params.toString()}`,
    token: shareToken,
    expires: calculateExpirationDate(expiresIn),
    permissions: {
      view: true,
      edit: allowEditing,
      privateNotes: includePrivateNotes
    }
  };
};

/**
 * Generate a unique share token
 */
const generateShareToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Calculate expiration date from duration string
 */
const calculateExpirationDate = (duration) => {
  const now = new Date();
  const match = duration.match(/(\d+)([dwmy])/);
  
  if (!match) return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
  
  const [, amount, unit] = match;
  const multipliers = { d: 1, w: 7, m: 30, y: 365 };
  const days = parseInt(amount) * (multipliers[unit] || 30);
  
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

/**
 * Create social media share content
 */
export const createSocialShareContent = (itinerary) => {
  const { destination, startDate, endDate, description, activities } = itinerary;
  const duration = calculateTripDuration(startDate, endDate);
  const activityCount = activities ? activities.length : 0;

  const baseText = `🌍 Planning an amazing ${duration}-day trip to ${destination}!`;
  const activityText = activityCount > 0 ? ` With ${activityCount} exciting activities planned.` : '';
  const hashtagText = generateHashtags(destination, activities);

  return {
    twitter: {
      text: `${baseText}${activityText} ${hashtagText}`,
      maxLength: 280
    },
    facebook: {
      text: `${baseText}\n\n${description || 'Get ready for an incredible adventure!'}${activityText}\n\n${hashtagText}`,
      maxLength: 2000
    },
    instagram: {
      text: `${baseText}\n.\n${description || 'Adventure awaits! ✈️'}\n.\n${hashtagText}`,
      maxLength: 2200
    },
    whatsapp: {
      text: `${baseText} Check out my travel plans: [TRIP_LINK]`,
      maxLength: 1000
    }
  };
};

/**
 * Generate relevant hashtags for the trip
 */
const generateHashtags = (destination, activities = []) => {
  const baseHashtags = ['#TravelPlanning', '#Adventure', '#TripPlanner'];
  
  // Add destination-based hashtags
  const destinationTag = `#${destination.replace(/[^a-zA-Z0-9]/g, '')}`;
  if (destinationTag.length > 2) {
    baseHashtags.push(destinationTag);
  }

  // Add activity-based hashtags
  const activityHashtags = activities
    .slice(0, 3) // Limit to 3 activities
    .map(activity => {
      const tag = activity.title?.replace(/[^a-zA-Z0-9]/g, '') || '';
      return tag.length > 2 ? `#${tag}` : null;
    })
    .filter(Boolean);

  return [...baseHashtags, ...activityHashtags].join(' ');
};

/**
 * Calculate trip duration in days
 */
const calculateTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Generate a beautiful trip card data for social sharing
 */
export const generateTripCard = (itinerary) => {
  const { destination, startDate, endDate, description, weather, estimatedCost } = itinerary;
  const duration = calculateTripDuration(startDate, endDate);

  return {
    title: `${destination} Adventure`,
    subtitle: `${duration} Days of Amazing Experiences`,
    dates: formatDateRange(startDate, endDate),
    highlights: extractHighlights(itinerary),
    weather: weather ? `${weather.temperature}°C, ${weather.description}` : null,
    budget: estimatedCost ? formatCurrency(estimatedCost) : null,
    image: generateTripCardImageUrl(destination),
    gradient: selectGradientByDestination(destination),
    stats: {
      duration: `${duration} days`,
      activities: itinerary.activities?.length || 0,
      meals: itinerary.meals?.length || 0
    }
  };
};

/**
 * Extract key highlights from the itinerary
 */
const extractHighlights = (itinerary) => {
  const highlights = [];
  
  if (itinerary.activities?.length > 0) {
    highlights.push(`${itinerary.activities.length} activities planned`);
  }
  
  if (itinerary.restaurants?.length > 0) {
    highlights.push(`${itinerary.restaurants.length} dining experiences`);
  }
  
  if (itinerary.hotels?.length > 0) {
    highlights.push('Accommodation sorted');
  }

  return highlights.slice(0, 3); // Limit to 3 highlights
};

/**
 * Format date range for display
 */
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { month: 'short', day: 'numeric' };
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}, ${start.getFullYear()}`;
};

/**
 * Format currency for display
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Generate trip card image URL (placeholder for now)
 */
const generateTripCardImageUrl = (destination) => {
  // In a real app, this would use a service like Unsplash API
  const encodedDestination = encodeURIComponent(destination);
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&crop=center&auto=format&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&search=${encodedDestination}`;
};

/**
 * Select gradient colors based on destination type
 */
const selectGradientByDestination = (destination) => {
  const dest = destination.toLowerCase();
  
  if (dest.includes('beach') || dest.includes('island') || dest.includes('coast')) {
    return ['from-blue-400', 'to-cyan-500'];
  }
  
  if (dest.includes('mountain') || dest.includes('alps') || dest.includes('peak')) {
    return ['from-gray-500', 'to-gray-700'];
  }
  
  if (dest.includes('desert') || dest.includes('arizona') || dest.includes('nevada')) {
    return ['from-yellow-400', 'to-orange-500'];
  }
  
  if (dest.includes('forest') || dest.includes('national park') || dest.includes('jungle')) {
    return ['from-green-400', 'to-green-600'];
  }
  
  // City/default gradient
  return ['from-purple-500', 'to-pink-500'];
};

/**
 * Collaboration utilities
 */
export const collaborationUtils = {
  /**
   * Add a collaborator to a trip
   */
  addCollaborator: (tripId, email, permissions = 'view') => {
    // In a real app, this would make an API call
    return {
      success: true,
      collaborator: {
        email,
        permissions,
        inviteStatus: 'pending',
        inviteToken: generateShareToken(),
        invitedAt: new Date().toISOString()
      }
    };
  },

  /**
   * Get collaborator permissions
   */
  getPermissions: (tripId, userId) => {
    // Mock permissions - in real app, fetch from API
    return {
      view: true,
      edit: false,
      invite: false,
      delete: false
    };
  },

  /**
   * Track changes for collaborative editing
   */
  trackChange: (tripId, userId, changeType, changeData) => {
    return {
      id: Date.now().toString(),
      tripId,
      userId,
      type: changeType,
      data: changeData,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get activity feed for collaborative trips
   */
  getActivityFeed: (tripId) => {
    // Mock activity feed
    return [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah',
        action: 'added_activity',
        target: 'Museum Visit',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike',
        action: 'updated_hotel',
        target: 'Grand Hotel',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
};

/**
 * Export sharing utilities as default
 */
export default {
  generateShareableLink,
  createSocialShareContent,
  generateTripCard,
  collaborationUtils
};