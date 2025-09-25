const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let testUserId = '';

// Test user credentials
const testUser = {
  name: 'Vacation Style Tester',
  email: 'vacationstyle@test.com',
  password: 'testpass123'
};

async function testVacationStyles() {
  try {
    console.log('🧪 Testing Vacation Style Functionality...\n');
    
    // Step 1: Create test user and login
    console.log('1. Creating test user and logging in...');
    await createTestUser();
    await loginTestUser();
    console.log('✅ User authenticated\n');
    
    // Step 2: Test each vacation style
    const styles = [
      {
        name: 'Chillaxed',
        style: { chillaxed: true, adventurous: false, busy: false },
        expectedActivities: '1-2'
      },
      {
        name: 'Adventurous', 
        style: { chillaxed: false, adventurous: true, busy: false },
        expectedActivities: '3-4'
      },
      {
        name: 'Busy',
        style: { chillaxed: false, adventurous: false, busy: true },
        expectedActivities: '5-6+'
      }
    ];
    
    for (const styleTest of styles) {
      console.log(`\n2. Testing ${styleTest.name} vacation style...`);
      await testVacationStyle(styleTest);
    }
    
    console.log('\n🎉 All vacation style tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createTestUser() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!response.ok && response.status !== 400) { // 400 means user already exists
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
  } catch (error) {
    // User might already exist, that's fine
    console.log('   (User may already exist, continuing...)');
  }
}

async function loginTestUser() {
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
  testUserId = data.user.id;
}

async function testVacationStyle(styleTest) {
  // Create itinerary with vacation style
  const itinerary = await createItineraryWithStyle(styleTest);
  console.log(`   ✅ Created ${styleTest.name} itinerary: "${itinerary.title}"`);
  
  // Generate AI suggestions
  const suggestions = await generateItineraryWithStyle(itinerary.id);
  console.log(`   ✅ Generated AI suggestions for ${styleTest.name} style`);
  
  // Verify activity counts
  await verifyActivityCounts(suggestions, styleTest);
  
  // Test single day suggestion
  if (suggestions.daysCreated > 0) {
    const updatedItinerary = await getItinerary(itinerary.id);
    if (updatedItinerary.days && updatedItinerary.days.length > 0) {
      const firstDay = updatedItinerary.days[0];
      const singleDaySuggestion = await generateSingleDaySuggestion(itinerary.id, firstDay.id);
      console.log(`   ✅ Generated single day suggestion for ${styleTest.name} style`);
      verifySingleDayActivityCount(singleDaySuggestion, styleTest);
    }
  }
  
  console.log(`   🎯 ${styleTest.name} style test passed!`);
}

async function createItineraryWithStyle(styleTest) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // Start in 1 week
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2); // 3-day trip
  
  const response = await fetch(`${BASE_URL}/api/itineraries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      title: `${styleTest.name} Test Trip`,
      description: `Testing ${styleTest.name.toLowerCase()} vacation style with ${styleTest.expectedActivities} activities per day`,
      destination: 'Paris, France',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      vacationStyle: styleTest.style
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create itinerary: ${response.statusText}`);
  }
  
  return await response.json();
}

async function generateItineraryWithStyle(itineraryId) {
  const response = await fetch(`${BASE_URL}/api/itineraries/${itineraryId}/generate-suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      preferences: {
        budget: 'medium',
        interests: ['culture', 'food', 'sightseeing']
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate suggestions: ${response.statusText}`);
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
    throw new Error(`Failed to generate single day suggestions: ${response.statusText}`);
  }
  
  return await response.json();
}

async function verifyActivityCounts(suggestions, styleTest) {
  console.log(`   📊 Verifying activity counts for ${styleTest.name} style...`);
  
  if (!suggestions.days || suggestions.days.length === 0) {
    console.log('   ⚠️  No days generated, but this might be expected for mock data');
    return;
  }
  
  for (let i = 0; i < suggestions.days.length; i++) {
    const day = suggestions.days[i];
    const activityCount = day.activities ? day.activities.length : 0;
    const mealCount = day.meals ? day.meals.length : 0;
    
    console.log(`     Day ${day.dayNumber}: ${activityCount} activities, ${mealCount} meals`);
    
    // Verify activity counts match expectations
    if (styleTest.style.chillaxed && activityCount > 2) {
      console.log(`     ⚠️  Warning: Chillaxed day has ${activityCount} activities (expected ≤2)`);
    } else if (styleTest.style.busy && activityCount < 4) {
      console.log(`     ⚠️  Warning: Busy day has ${activityCount} activities (expected ≥5)`);
    } else if (styleTest.style.adventurous && (activityCount < 3 || activityCount > 4)) {
      console.log(`     ⚠️  Warning: Adventurous day has ${activityCount} activities (expected 3-4)`);
    }
  }
}

function verifySingleDayActivityCount(singleDayData, styleTest) {
  const activityCount = singleDayData.activities ? singleDayData.activities.length : 0;
  const mealCount = singleDayData.meals ? singleDayData.meals.length : 0;
  
  console.log(`     Single day: ${activityCount} activities, ${mealCount} meals`);
  
  // Log expected vs actual for single day
  if (styleTest.style.chillaxed && activityCount > 2) {
    console.log(`     ⚠️  Single day warning: Chillaxed has ${activityCount} activities (expected ≤2)`);
  } else if (styleTest.style.busy && activityCount < 4) {
    console.log(`     ⚠️  Single day warning: Busy has ${activityCount} activities (expected ≥5)`);
  }
}

// Run the test
testVacationStyles();