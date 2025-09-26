// API utility functions for consistent API URL handling

export const getApiUrl = () => {
  // Always return empty string for API routes on same domain
  // This works for both client-side and server-side rendering
  return '';
};

// Helper function for making authenticated API requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  // Use relative URLs - endpoint should start with /api/
  const response = await fetch(endpoint, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};