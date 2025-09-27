import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MobileTest() {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const router = useRouter();

  const addResult = (test, status, details = '') => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    // Basic connectivity test
    addResult('Device Info', 'info', `User Agent: ${navigator.userAgent}`);
    addResult('Current URL', 'info', window.location.href);
    addResult('API URL Config', 'info', process.env.NEXT_PUBLIC_API_URL);
    
    // Test backend health endpoint
    try {
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult('Backend Health', 'success', `Status: ${healthData.status}, DB: ${healthData.database}`);
      } else {
        addResult('Backend Health', 'error', `HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
      }
    } catch (error) {
      addResult('Backend Health', 'error', error.message);
    }

    // Test auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      addResult('Auth Token', 'success', `Present (${token.length} chars)`);
      
      // Test authenticated endpoint
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          addResult('Itineraries API', 'success', `Returned ${data.length} itineraries`);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          addResult('Itineraries API', 'error', `HTTP ${response.status}: ${errorData.error}`);
        }
      } catch (error) {
        addResult('Itineraries API', 'error', error.message);
      }
    } else {
      addResult('Auth Token', 'error', 'No token found');
    }

    // Test CORS
    try {
      const corsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
        method: 'OPTIONS',
      });
      addResult('CORS Preflight', corsResponse.ok ? 'success' : 'error', 
               `Status: ${corsResponse.status}`);
    } catch (error) {
      addResult('CORS Preflight', 'error', error.message);
    }

    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mobile Connectivity Test</h1>
          <p className="text-gray-600 mb-6">
            This page helps debug mobile connectivity issues with the travel planner API.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Tests'}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/itineraries')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Itineraries
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{result.test}</div>
                      {result.details && (
                        <div className="text-sm mt-1 break-words">{result.details}</div>
                      )}
                      <div className="text-xs mt-1 opacity-75">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">Quick Access URLs:</h3>
            <ul className="space-y-1">
              <li>• Desktop: <a href="http://localhost:3000" className="text-blue-600 hover:underline">http://localhost:3000</a></li>
              <li>• Mobile: <a href="http://192.168.1.22:3000" className="text-blue-600 hover:underline">http://192.168.1.22:3000</a></li>
              <li>• API: <a href="http://192.168.1.22:3001" className="text-blue-600 hover:underline">http://192.168.1.22:3001</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}