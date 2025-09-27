/**
 * Weather Utilities
 * Fetches weather data for travel destinations
 */

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_HISTORY_URL = 'https://history.openweathermap.org/data/2.5';
const WEATHER_CLIMATE_URL = 'http://climateapi.openweathermap.org/data/1.5';

// Fallback weather data for demo purposes when API key is not available
const DEMO_WEATHER_DATA = {
  temperature: 22,
  description: 'partly cloudy',
  icon: '02d',
  humidity: 65,
  windSpeed: 3.2,
  feelsLike: 24
};

/**
 * Determine if trip dates are close enough for live weather data
 * Live data available for next 5 days, historical/seasonal for future dates
 */
const isLiveWeatherAvailable = (startDate) => {
  if (!startDate) return false;
  const tripDate = new Date(startDate);
  const today = new Date();
  const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
  return daysUntilTrip <= 5 && daysUntilTrip >= 0;
};

/**
 * Get seasonal weather data based on historical averages
 */
const getSeasonalWeather = (destination, month) => {
  // This would ideally use historical weather API, but we'll use demo data with seasonal variations
  const seasonalData = {
    0: { temp: 8, desc: 'cold with occasional snow', humidity: 70, wind: 4.5, icon: '13d' }, // January
    1: { temp: 12, desc: 'cool with light rain', humidity: 68, wind: 4.2, icon: '10d' }, // February
    2: { temp: 16, desc: 'mild spring weather', humidity: 65, wind: 3.8, icon: '04d' }, // March
    3: { temp: 20, desc: 'pleasant with occasional showers', humidity: 62, wind: 3.5, icon: '02d' }, // April
    4: { temp: 24, desc: 'warm and sunny', humidity: 58, wind: 3.2, icon: '01d' }, // May
    5: { temp: 28, desc: 'hot summer weather', humidity: 55, wind: 2.8, icon: '01d' }, // June
    6: { temp: 32, desc: 'very hot', humidity: 50, wind: 2.5, icon: '01d' }, // July
    7: { temp: 31, desc: 'hot with some humidity', humidity: 52, wind: 2.7, icon: '01d' }, // August
    8: { temp: 26, desc: 'warm autumn days', humidity: 58, wind: 3.0, icon: '02d' }, // September
    9: { temp: 20, desc: 'pleasant fall weather', humidity: 63, wind: 3.5, icon: '04d' }, // October
    10: { temp: 14, desc: 'cool with frequent rain', humidity: 68, wind: 4.0, icon: '10d' }, // November
    11: { temp: 9, desc: 'cold winter weather', humidity: 72, wind: 4.3, icon: '13d' } // December
  };

  const data = seasonalData[month] || seasonalData[5]; // Default to June if invalid month
  
  // Create seasonal forecasts (simplified - same data for multiple days)
  const forecasts = [];
  const startDate = new Date();
  for (let i = 0; i < 5; i++) {
    const forecastDate = new Date(startDate);
    forecastDate.setDate(startDate.getDate() + i);
    forecasts.push({
      date: forecastDate.toISOString(),
      minTemp: data.temp - 3,
      maxTemp: data.temp + 3,
      avgTemp: data.temp,
      description: data.desc,
      icon: data.icon,
      humidity: data.humidity,
      windSpeed: data.wind
    });
  }
  
  return {
    location: destination.split(',')[0] || destination,
    country: 'Historical Average',
    forecasts: forecasts,
    summary: {
      minTemp: data.temp - 3,
      maxTemp: data.temp + 3,
      mostCommonCondition: data.desc,
      recommendation: `Pack for ${data.temp}°C weather with ${data.desc.toLowerCase()}.`
    },
    isSeasonal: true,
    isHistorical: true,
    dataType: 'seasonal_average'
  };
};

/**
 * Get current weather for a destination
 */
export const getCurrentWeather = async (destination) => {
  try {
    // If no API key or demo key, return demo data
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'demo_key') {
      return {
        success: true,
        data: {
          location: destination.split(',')[0] || destination,
          country: 'Demo',
          temperature: DEMO_WEATHER_DATA.temperature,
          feelsLike: DEMO_WEATHER_DATA.feelsLike,
          description: DEMO_WEATHER_DATA.description,
          icon: DEMO_WEATHER_DATA.icon,
          humidity: DEMO_WEATHER_DATA.humidity,
          windSpeed: DEMO_WEATHER_DATA.windSpeed,
          visibility: 10,
          pressure: 1013,
          sunrise: new Date(),
          sunset: new Date(Date.now() + 12 * 60 * 60 * 1000),
          isDemo: true
        }
      };
    }

    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(destination)}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: data.visibility / 1000, // Convert to km
        pressure: data.main.pressure,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        isLive: true
      }
    };
  } catch (error) {
    console.error('Error fetching current weather, using demo data:', error);
    
    // Return demo data as fallback
    return {
      success: true,
      data: {
        location: destination.split(',')[0] || destination,
        country: 'Demo',
        temperature: DEMO_WEATHER_DATA.temperature,
        feelsLike: DEMO_WEATHER_DATA.feelsLike,
        description: DEMO_WEATHER_DATA.description,
        icon: DEMO_WEATHER_DATA.icon,
        humidity: DEMO_WEATHER_DATA.humidity,
        windSpeed: DEMO_WEATHER_DATA.windSpeed,
        visibility: 10,
        pressure: 1013,
        sunrise: new Date(),
        sunset: new Date(Date.now() + 12 * 60 * 60 * 1000),
        isDemo: true,
        error: error.message
      }
    };
  }
};

/**
 * Get weather forecast for a destination (5-day forecast)
 */
export const getWeatherForecast = async (destination) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(destination)}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Group forecasts by day (API returns 3-hour intervals)
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: date,
          temperatures: [],
          conditions: [],
          icons: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecasts[dateKey].temperatures.push(item.main.temp);
      dailyForecasts[dateKey].conditions.push(item.weather[0].description);
      dailyForecasts[dateKey].icons.push(item.weather[0].icon);
      dailyForecasts[dateKey].humidity.push(item.main.humidity);
      dailyForecasts[dateKey].windSpeed.push(item.wind.speed);
    });
    
    // Process daily data
    const processedForecasts = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      minTemp: Math.round(Math.min(...day.temperatures)),
      maxTemp: Math.round(Math.max(...day.temperatures)),
      avgTemp: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length),
      description: getMostCommonCondition(day.conditions),
      icon: getMostCommonIcon(day.icons),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
    }));
    
    return {
      success: true,
      data: {
        location: data.city.name,
        country: data.city.country,
        forecasts: processedForecasts.slice(0, 5) // Return 5 days
      }
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Get weather for specific dates (for trip planning)
 */
export const getWeatherForDates = async (destination, startDate, endDate) => {
  try {
    const forecast = await getWeatherForecast(destination);
    
    if (!forecast.success) {
      return forecast;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter forecasts for trip dates
    const tripForecasts = forecast.data.forecasts.filter(day => {
      return day.date >= start && day.date <= end;
    });
    
    return {
      success: true,
      data: {
        location: forecast.data.location,
        country: forecast.data.country,
        forecasts: tripForecasts,
        summary: generateWeatherSummary(tripForecasts)
      }
    };
  } catch (error) {
    console.error('Error fetching weather for dates:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Generate weather summary for trip
 */
const generateWeatherSummary = (forecasts) => {
  if (forecasts.length === 0) return null;
  
  const temps = forecasts.flatMap(f => [f.minTemp, f.maxTemp]);
  const conditions = forecasts.map(f => f.description);
  
  return {
    minTemp: Math.min(...temps),
    maxTemp: Math.max(...temps),
    avgTemp: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
    mostCommonCondition: getMostCommonCondition(conditions),
    recommendation: getClothingRecommendation(Math.min(...temps), Math.max(...temps))
  };
};

/**
 * Get most common weather condition
 */
const getMostCommonCondition = (conditions) => {
  const counts = {};
  conditions.forEach(condition => {
    counts[condition] = (counts[condition] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

/**
 * Get most common weather icon
 */
const getMostCommonIcon = (icons) => {
  const counts = {};
  icons.forEach(icon => {
    counts[icon] = (counts[icon] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

/**
 * Get clothing recommendation based on temperature
 */
const getClothingRecommendation = (minTemp, maxTemp) => {
  const avgTemp = (minTemp + maxTemp) / 2;
  
  if (avgTemp < 0) {
    return "Pack heavy winter clothing, thermal layers, and waterproof gear";
  } else if (avgTemp < 10) {
    return "Bring warm layers, jackets, and long pants";
  } else if (avgTemp < 20) {
    return "Pack light layers, sweaters, and a light jacket";
  } else if (avgTemp < 30) {
    return "Comfortable clothing, light layers for variable conditions";
  } else {
    return "Light, breathable clothing and sun protection";
  }
};

/**
 * Get weather icon URL
 */
export const getWeatherIconUrl = (iconCode, size = '2x') => {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
};

/**
 * Convert temperature between units
 */
export const convertTemperature = (temp, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return temp;
  
  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
    return (temp * 9/5) + 32;
  } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return (temp - 32) * 5/9;
  }
  
  return temp;
};

// Export new weather utility functions
export { isLiveWeatherAvailable, getSeasonalWeather };
