// API utility functions for consistent API URL handling

export const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // If we have an environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Otherwise, use the current host but with port 3001
  const currentHost = window.location.hostname;
  return `http://${currentHost}:3001`;
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