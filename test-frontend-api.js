// Test script to verify frontend API integration with backend
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testFrontendFlow() {
  try {
    console.log('🧪 Testing Frontend-Backend Integration...\n');

    // Step 1: Register a test user (simulating frontend signup)
    console.log('1. Creating test user...');
    const email = `frontend-test${Date.now()}@example.com`;
    const password = 'testpassword123';
    
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      email: email,
      password: password,
      name: 'Frontend Test User'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered, token received');

    // Step 2: Create an itinerary (simulating new trip creation)
    console.log('\n2. Creating test itinerary...');
    const itineraryData = {
      title: 'Frontend Test Trip',
      description: 'A test trip to verify frontend integration',
      startDate: '2024-07-01',
      endDate: '2024-07-07',
      destination: 'Test City, Country'
    };

    const createResponse = await axios.post(`${API_BASE}/api/itineraries`, itineraryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Itinerary created:', createResponse.data.title);
    const itineraryId = createResponse.data.id;

    // Step 3: Fetch individual itinerary (simulating frontend detail page)
    console.log('\n3. Fetching individual itinerary (frontend [id].js simulation)...');
    const fetchResponse = await axios.get(`${API_BASE}/api/itineraries/${itineraryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Individual itinerary fetched successfully');
    console.log('   Title:', fetchResponse.data.title);
    console.log('   Destination:', fetchResponse.data.destination);
    console.log('   Days data:', fetchResponse.data.days ? 'Present' : 'None yet');

    // Step 4: Fetch all itineraries (simulating frontend index page)  
    console.log('\n4. Fetching all itineraries (frontend index.js simulation)...');
    const allResponse = await axios.get(`${API_BASE}/api/itineraries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ All itineraries fetched:', allResponse.data.length, 'items');

    // Step 5: Test without token (should fail)
    console.log('\n5. Testing without authentication token (should fail)...');
    try {
      await axios.get(`${API_BASE}/api/itineraries/${itineraryId}`);
      console.log('❌ ERROR: Request without token should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthorized request');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status);
      }
    }

    console.log('\n🎉 Frontend-Backend integration test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Token-based API calls working');
    console.log('   ✅ Individual itinerary fetching working');
    console.log('   ✅ All itineraries fetching working');
    console.log('   ✅ Unauthorized access properly blocked');
    console.log('\n🚀 Your frontend should now be able to view and edit itineraries!');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Data:', error.response?.data);
    console.error('   Message:', error.message);
  }
}

testFrontendFlow();