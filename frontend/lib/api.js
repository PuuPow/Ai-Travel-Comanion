// API utility functions for consistent API URL handling

export const getApiUrl = () => {
  // Client-side: use current domain
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('Client-side API URL:', origin);
    return origin;
  }
  
  // Server-side: use environment variable or default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  console.log('Server-side API URL:', apiUrl);
  return apiUrl;
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