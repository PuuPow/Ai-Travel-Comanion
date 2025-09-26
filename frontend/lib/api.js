// API utility functions for consistent API URL handling

export const getApiUrl = () => {
  // For deployed app, API routes are always on the same domain
  // Client-side: use current domain
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: return empty string to use relative URLs
  return '';
};

// Helper function for making authenticated API requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const apiUrl = getApiUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  const response = await fetch(`${apiUrl}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};