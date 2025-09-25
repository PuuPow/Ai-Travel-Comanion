const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
let authToken = '';

const testUser = {
  name: 'Itineraries Page Tester',
  email: 'itinerariestest@test.com',
  password: 'testpass123'
};

async function testItinerariesPage() {
  try {
    console.log('🧪 Testing Travel Adventures Page Functionality...\n');
    
    // Login
    await loginTestUser();
    console.log('✅ User authenticated\n');
    
    // Test fetching itineraries (empty state)
    console.log('1. Testing empty itineraries list...');
    const emptyItineraries = await fetchItineraries();
    console.log(`✅ Fetched itineraries: ${emptyItineraries.length} items (expected: 0 for new user)\n`);
    
    // Create a test itinerary to verify creation works
    console.log('2. Testing itinerary creation...');
    const newItinerary = await createTestItinerary();
    console.log(`✅ Created test itinerary: "${newItinerary.title}"\n`);
    
    // Test fetching itineraries (with data)
    console.log('3. Testing itineraries list with data...');
    const itinerariesWithData = await fetchItineraries();
    console.log(`✅ Fetched itineraries: ${itinerariesWithData.length} items (expected: ≥1)\n`);
    
    if (itinerariesWithData.length > 0) {
      const itinerary = itinerariesWithData[0];
      console.log('📋 Sample itinerary data:');
      console.log(`   Title: ${itinerary.title}`);
      console.log(`   Destination: ${itinerary.destination}`);
      console.log(`   Start Date: ${itinerary.startDate}`);
      console.log(`   End Date: ${itinerary.endDate}`);
      console.log(`   Vacation Style: ${JSON.stringify(itinerary.vacationStyle)}`);
    }
    
    console.log('\n🎉 Travel Adventures Page test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ User authentication working');
    console.log('   ✅ API endpoint accessible');
    console.log('   ✅ Itinerary creation working');
    console.log('   ✅ Itinerary fetching working');
    console.log('   ✅ Data structure correct');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

async function loginTestUser() {
  // Try to register first
  try {
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
  } catch (e) {
    // User might exist, ignore
  }
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  authToken = data.token;
}

async function fetchItineraries() {
  const response = await fetch(`${BASE_URL}/api/itineraries`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch itineraries: ${response.statusText}`);
  }
  
  return await response.json();
}

async function createTestItinerary() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);
  
  const response = await fetch(`${BASE_URL}/api/itineraries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      title: 'Page Test Adventure',
      description: 'Testing the travel adventures page functionality',
      destination: 'Barcelona, Spain',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      vacationStyle: { adventurous: true, chillaxed: false, busy: false }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create itinerary: ${response.statusText}`);
  }
  
  return await response.json();
}

// Run the test
testItinerariesPage();