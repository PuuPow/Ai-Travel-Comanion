import { useState, useEffect, createContext, useContext } from 'react';

// Premium context
const PremiumContext = createContext();

/**
 * Premium Provider Component
 */
export function PremiumProvider({ children }) {
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchPremiumStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setPremiumStatus({ isPremium: false });
        setLoading(false);
        return;
      }

      // Get user info
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        // Get premium status
        const premiumResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/premium-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (premiumResponse.ok) {
          const data = await premiumResponse.json();
          setPremiumStatus(data);
        } else {
          setPremiumStatus({ isPremium: false });
        }
      } else {
        setPremiumStatus({ isPremium: false });
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
      setPremiumStatus({ isPremium: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const refreshPremiumStatus = () => {
    setLoading(true);
    fetchPremiumStatus();
  };

  return (
    <PremiumContext.Provider value={{
      premiumStatus,
      loading,
      user,
      isPremium: premiumStatus?.isPremium || false,
      subscriptionEndDate: premiumStatus?.subscriptionEndDate,
      subscriptionStatus: premiumStatus?.subscriptionStatus,
      refreshPremiumStatus
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

/**
 * Hook to use premium context
 */
export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

/**
 * Premium feature restrictions configuration
 */
export const PREMIUM_FEATURES = {
  UNLIMITED_ITINERARIES: {
    name: 'Unlimited Itineraries',
    description: 'Create as many itineraries as you want',
    freeLimit: 3
  },
  ADVANCED_AI: {
    name: 'Advanced AI Suggestions',
    description: 'Get smarter, personalized recommendations'
  },
  EXPORT_OPTIONS: {
    name: 'Advanced Export Options',
    description: 'PDF, calendar integration, and more formats'
  },
  COLLABORATION: {
    name: 'Collaborative Planning',
    description: 'Share and plan trips with others'
  },
  PRIORITY_SUPPORT: {
    name: 'Priority Support',
    description: 'Get help faster with dedicated support'
  },
  WEATHER_INTEGRATION: {
    name: 'Advanced Weather Integration',
    description: 'Detailed weather forecasts and alerts'
  },
  PREMIUM_TEMPLATES: {
    name: 'Premium Templates',
    description: 'Access exclusive itinerary templates'
  }
};

/**
 * Hook to check if a specific feature is available
 */
export function useFeatureAccess(featureKey) {
  const { isPremium, loading } = usePremium();
  
  return {
    hasAccess: isPremium,
    loading,
    feature: PREMIUM_FEATURES[featureKey],
    requiresPremium: true
  };
}

/**
 * Hook to check itinerary limit for free users
 */
export function useItineraryLimit() {
  const { isPremium, loading } = usePremium();
  const [itineraryCount, setItineraryCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);

  const fetchItineraryCount = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCountLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItineraryCount(data.itineraries?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching itinerary count:', error);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchItineraryCount();
    }
  }, [loading]);

  const freeLimit = PREMIUM_FEATURES.UNLIMITED_ITINERARIES.freeLimit;
  const canCreateMore = isPremium || itineraryCount < freeLimit;
  const remainingFree = Math.max(0, freeLimit - itineraryCount);

  return {
    canCreateMore,
    itineraryCount,
    freeLimit,
    remainingFree,
    loading: loading || countLoading,
    isPremium,
    refreshCount: fetchItineraryCount
  };
}

/**
 * Utility function to get premium upgrade URL with feature context
 */
export function getPremiumUpgradeUrl(feature = null, source = null) {
  let url = '/premium';
  const params = new URLSearchParams();
  
  if (feature) params.set('feature', feature);
  if (source) params.set('source', source);
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Component to wrap premium features
 */
export function PremiumFeature({ 
  featureKey, 
  children, 
  fallback = null, 
  showUpgrade = true,
  source = null 
}) {
  const { hasAccess, loading, feature } = useFeatureAccess(featureKey);
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-20 flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }
  
  if (hasAccess) {
    return children;
  }
  
  if (fallback) {
    return fallback;
  }
  
  if (showUpgrade) {
    return (
      <PremiumUpgradePrompt 
        feature={feature} 
        featureKey={featureKey}
        source={source}
      />
    );
  }
  
  return null;
}

/**
 * Premium upgrade prompt component
 */
export function PremiumUpgradePrompt({ 
  feature, 
  featureKey, 
  source = null,
  className = ""
}) {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 text-center ${className}`}>
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-3">
          <span className="text-white text-xl">👑</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {feature?.name || 'Premium Feature'}
        </h3>
        <p className="text-gray-600 text-sm">
          {feature?.description || 'This feature is available in our premium plan.'}
        </p>
      </div>
      
      <a
        href={getPremiumUpgradeUrl(featureKey, source)}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
      >
        Upgrade to Premium
      </a>
    </div>
  );
}

/**
 * Itinerary limit warning component
 */
export function ItineraryLimitWarning() {
  const { canCreateMore, remainingFree, isPremium, loading } = useItineraryLimit();
  
  if (loading || isPremium || canCreateMore) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-yellow-600 text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Itinerary Limit Reached
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            You've reached the limit of 3 free itineraries. Upgrade to premium for unlimited itineraries.
          </p>
          <div className="mt-3">
            <a
              href={getPremiumUpgradeUrl('UNLIMITED_ITINERARIES', 'itinerary_limit')}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Upgrade to Premium →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default usePremium;