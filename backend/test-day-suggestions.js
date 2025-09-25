const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
let authToken = '';

const testUser = {
  name: 'Day Suggestions Tester',
  email: 'daysuggest@test.com',
  password: 'testpass123'
};

async function testDaySuggestions() {
  try {
    console.log('🧪 Testing Day-by-Day AI Suggestions...\n');
    
    // Login
    await loginTestUser();
    console.log('✅ User authenticated\n');
    
    // Create an itinerary with vacation style
    const itinerary = await createTestItinerary();
    console.log(`✅ Created test itinerary: "${itinerary.title}"\n`);
    
    // Generate full itinerary first to create days
    const suggestions = await generateFullItinerary(itinerary.id);
    console.log('✅ Generated full itinerary with days\n');
    
    // Get the itinerary with populated days
    const fullItinerary = await getItinerary(itinerary.id);
    console.log(`📊 Itinerary has ${fullItinerary.days.length} days\n`);
    
    if (fullItinerary.days.length > 0) {
      // Test single day AI suggestions on the first day
      const firstDay = fullItinerary.days[0];
      console.log(`🎯 Testing single day suggestions for Day ${firstDay.dayNumber} (ID: ${firstDay.id})`);
      
      const daySuggestion = await generateSingleDaySuggestion(itinerary.id, firstDay.id);
      
      console.log('✅ Single day suggestion generated successfully!');
      console.log(`   Activities: ${daySuggestion.activities?.length || 0}`);
      console.log(`   Meals: ${daySuggestion.meals?.length || 0}`);
      
      if (daySuggestion.activities?.length > 0) {
        console.log('   📋 Generated Activities:');
        daySuggestion.activities.forEach((activity, idx) => {
          console.log(`     ${idx + 1}. ${activity.activity} at ${activity.time || 'N/A'}`);
        });
      }
      
      if (daySuggestion.meals?.length > 0) {
        console.log('   🍽️  Generated Meals:');
        daySuggestion.meals.forEach((meal, idx) => {
          console.log(`     ${idx + 1}. ${meal.restaurant} (${meal.type})`);
        });
      }
    } else {
      console.log('⚠️  No days found in itinerary to test single day suggestions');
    }
    
    console.log('\n🎉 Day-by-day AI suggestions test completed successfully!');
    
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
      title: 'Day Suggestions Test Trip',
      description: 'Testing day-by-day AI suggestions functionality',
      destination: 'Rome, Italy',
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

async function generateFullItinerary(itineraryId) {
  const response = await fetch(`${BASE_URL}/api/itineraries/${itineraryId}/generate-suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      preferences: {
        budget: 'medium',
        interests: ['culture', 'food', 'history']
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate full itinerary: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getItinerary(itineraryId) {
  const response = await fetch(`${BASE_URL}/api/itineraries/${itineraryId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get itinerary: ${response.statusText}`);
  }
  
  return await response.json();
}

async function generateSingleDaySuggestion(itineraryId, dayId) {
  const response = await fetch(`${BASE_URL}/api/itineraries/${itineraryId}/days/${dayId}/generate-suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      preferences: {
        budget: 'medium',
        interests: ['culture', 'food']
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate single day suggestions: ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
}

// Run the test
testDaySuggestions();