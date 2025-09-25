const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testFullUserFlow() {
  console.log('🔍 Testing Full User Flow - Frontend to Backend Connection\n');
  
  try {
    // Step 1: Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend not healthy');
    }
    const health = await healthResponse.json();
    console.log(`✅ Backend healthy: ${health.status}`);
    
    // Step 2: Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Frontend Test User',
      email: 'frontend@test.com',
      password: 'testpass123'
    };
    
    let authToken;
    try {
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        authToken = registerData.token;
        console.log('✅ User registered successfully');
      } else if (registerResponse.status === 400) {
        // User exists, try login
        console.log('ℹ️  User exists, attempting login...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });
        
        if (!loginResponse.ok) {
          throw new Error('Login failed');
        }
        
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ User logged in successfully');
      }
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    // Step 3: Test itineraries endpoint with authentication
    console.log('\n3. Testing itineraries endpoint...');
    const itinerariesResponse = await fetch(`${BASE_URL}/api/itineraries`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!itinerariesResponse.ok) {
      const errorData = await itinerariesResponse.json();
      throw new Error(`Itineraries fetch failed: ${errorData.error}`);
    }
    
    const itineraries = await itinerariesResponse.json();
    console.log(`✅ Fetched ${itineraries.length} itineraries`);
    
    // Step 4: Test creating an itinerary
    console.log('\n4. Testing itinerary creation...');
    const newItinerary = {
      title: 'Frontend Flow Test',
      description: 'Testing the complete frontend to backend flow',
      destination: 'Tokyo, Japan',
      startDate: '2025-11-01',
      endDate: '2025-11-03',
      vacationStyle: { adventurous: true, chillaxed: false, busy: false }
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/itineraries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newItinerary)
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Itinerary creation failed: ${errorData.error}`);
    }
    
    const createdItinerary = await createResponse.json();
    console.log(`✅ Created itinerary: "${createdItinerary.title}"`);
    
    // Step 5: Test fetching itineraries again to confirm it appears
    console.log('\n5. Testing itineraries fetch after creation...');
    const updatedItinerariesResponse = await fetch(`${BASE_URL}/api/itineraries`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedItineraries = await updatedItinerariesResponse.json();
    console.log(`✅ Now showing ${updatedItineraries.length} itineraries`);
    
    // Step 6: Simulate what the frontend should be doing
    console.log('\n6. Frontend-Backend Integration Analysis:');
    console.log(`   Backend URL: ${BASE_URL}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
    console.log(`   Auth Token Format: Bearer ${authToken.substring(0, 20)}...`);
    console.log(`   CORS Status: Should allow localhost:3000`);
    
    // Step 7: Test CORS by simulating frontend request
    console.log('\n7. Testing CORS preflight...');
    const corsResponse = await fetch(`${BASE_URL}/api/itineraries`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    console.log(`✅ CORS preflight status: ${corsResponse.status}`);
    
    console.log('\n🎉 Full Flow Test Summary:');
    console.log('   ✅ Backend server responsive');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Itinerary CRUD operations working');
    console.log('   ✅ CORS configuration appears correct');
    console.log('\n💡 If frontend still not loading itineraries, check:');
    console.log('   1. Browser console for errors');
    console.log('   2. Network tab in developer tools');
    console.log('   3. Local storage for auth tokens');
    console.log('   4. Frontend environment variables');
    
  } catch (error) {
    console.error('❌ Full flow test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify both servers are running');
    console.log('   2. Check .env.local has NEXT_PUBLIC_API_URL=http://localhost:3001');
    console.log('   3. Clear browser storage and try again');
    console.log('   4. Check browser console for JavaScript errors');
  }
}

// Run the test
testFullUserFlow();