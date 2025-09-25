const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('🧪 Testing Production API...\n');

    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data);
    
    // Test 2: Root endpoint
    console.log('\n2. Testing root endpoint...');
    const root = await axios.get(`${API_BASE}/`);
    console.log('✅ Root:', root.data);
    
    // Test 3: Register new user
    console.log('\n3. Testing user registration...');
    const email = `test${Date.now()}@example.com`;
    const regResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      email: email,
      password: 'testpassword123',
      name: 'Test User'
    });
    console.log('✅ Registration successful');
    const token = regResponse.data.token;
    console.log('   User ID:', regResponse.data.user.id);
    
    // Test 4: Login
    console.log('\n4. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: email,
      password: 'testpassword123'
    });
    console.log('✅ Login successful');
    
    // Test 5: Get user profile
    console.log('\n5. Testing get profile...');
    const profileResponse = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.email);
    
    // Test 6: Create itinerary
    console.log('\n6. Testing create itinerary...');
    const itineraryResponse = await axios.post(`${API_BASE}/api/itineraries`, {
      title: 'Test Trip to Tokyo',
      description: 'A wonderful test trip',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      destination: 'Tokyo, Japan'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Itinerary created:', itineraryResponse.data.title);
    const itineraryId = itineraryResponse.data.id;
    
    // Test 7: Get itineraries
    console.log('\n7. Testing get itineraries...');
    const itinerariesResponse = await axios.get(`${API_BASE}/api/itineraries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Itineraries retrieved:', itinerariesResponse.data.length, 'items');
    
    // Test 8: Get specific itinerary
    console.log('\n8. Testing get specific itinerary...');
    const specificItinerary = await axios.get(`${API_BASE}/api/itineraries/${itineraryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Specific itinerary retrieved:', specificItinerary.data.title);
    
    console.log('\n🎉 All tests passed! Production server is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

testAPI();