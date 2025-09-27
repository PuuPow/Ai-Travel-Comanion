import React, { useState, useEffect } from 'react';
import {
  FaCloudSun,
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaEye,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import {
  getCurrentWeather,
  getWeatherForDates,
  getWeatherIconUrl,
  convertTemperature,
  isLiveWeatherAvailable,
  getSeasonalWeather
} from '../lib/weatherUtils';

const WeatherWidget = ({ destination, startDate, endDate, compact = false }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [tempUnit, setTempUnit] = useState('celsius');

  useEffect(() => {
    if (destination) {
      fetchWeather();
    }
  }, [destination, startDate, endDate]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (startDate && endDate) {
        // Check if we should use live weather or seasonal averages
        if (isLiveWeatherAvailable(startDate)) {
          // Trip is within 5 days, get live weather forecast
          result = await getWeatherForDates(destination, startDate, endDate);
        } else {
          // Trip is far out, get seasonal weather averages
          const startMonth = new Date(startDate).getMonth();
          const seasonalData = getSeasonalWeather(destination, startMonth);
          result = { success: true, data: seasonalData };
        }
      } else {
        // Get current weather (no trip dates specified)
        result = await getCurrentWeather(destination);
      }

      if (result.success) {
        setWeatherData(result.data);
      } else {
        setError(result.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setError('Weather service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const formatTemperature = (temp) => {
    if (tempUnit === 'fahrenheit') {
      return Math.round(convertTemperature(temp, 'celsius', 'fahrenheit'));
    }
    return temp;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg ${compact ? 'p-3' : 'p-4'} border border-blue-200`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700 text-sm">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-yellow-50 rounded-lg ${compact ? 'p-3' : 'p-4'} border border-yellow-200`}>
        <div className="flex items-center text-yellow-800">
          <FaExclamationTriangle className="mr-2 text-yellow-600" />
          <span className="text-sm">Weather unavailable</span>
          {!compact && (
            <button
              onClick={fetchWeather}
              className="ml-auto text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  // Current weather display
  if (weatherData.temperature !== undefined) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FaCloudSun className="text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Current Weather</h3>
            {weatherData.isDemo && (
              <div className="ml-2 flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                <FaInfoCircle className="mr-1" />
                Demo
              </div>
            )}
          </div>
          <button
            onClick={() => setTempUnit(tempUnit === 'celsius' ? 'fahrenheit' : 'celsius')}
            className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded text-blue-800"
          >
            °{tempUnit === 'celsius' ? 'C' : 'F'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={getWeatherIconUrl(weatherData.icon)}
              alt={weatherData.description}
              className="w-12 h-12 mr-3"
            />
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {formatTemperature(weatherData.temperature)}°{tempUnit === 'celsius' ? 'C' : 'F'}
              </div>
              <div className="text-sm text-blue-700 capitalize">
                {weatherData.description}
              </div>
              <div className="text-xs text-blue-600">
                {weatherData.location}, {weatherData.country}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-blue-700">
              Feels like {formatTemperature(weatherData.feelsLike)}°
            </div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <FaTint className="mr-1" />
              {weatherData.humidity}%
            </div>
            <div className="flex items-center text-xs text-blue-600">
              <FaWind className="mr-1" />
              {Math.round(weatherData.windSpeed)} m/s
            </div>
          </div>
        </div>

        {!compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 pt-3 border-t border-blue-200 flex items-center justify-center text-xs text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Less details' : 'More details'}
            {expanded ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
          </button>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center text-blue-700">
              <FaEye className="mr-2" />
              Visibility: {weatherData.visibility}km
            </div>
            <div className="flex items-center text-blue-700">
              <FaThermometerHalf className="mr-2" />
              Pressure: {weatherData.pressure}hPa
            </div>
            <div className="flex items-center text-blue-700">
              <FaSun className="mr-2" />
              Sunrise: {weatherData.sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center text-blue-700">
              <FaMoon className="mr-2" />
              Sunset: {weatherData.sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Trip forecast display
  if (weatherData.forecasts) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaCloudSun className="text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">
              {weatherData.isSeasonal ? 'Seasonal Averages' : 'Weather Forecast'}
            </h3>
            {(weatherData.isSeasonal || weatherData.isDemo) && (
              <div className="ml-2 flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                <FaInfoCircle className="mr-1" />
                {weatherData.isSeasonal ? 'Historical' : 'Demo'}
              </div>
            )}
          </div>
          <button
            onClick={() => setTempUnit(tempUnit === 'celsius' ? 'fahrenheit' : 'celsius')}
            className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded text-blue-800"
          >
            °{tempUnit === 'celsius' ? 'C' : 'F'}
          </button>
        </div>

        <div className="text-xs text-blue-600 mb-3">
          {weatherData.location}, {weatherData.country}
          {weatherData.isSeasonal && (
            <div className="mt-1 text-amber-700 bg-amber-50 p-2 rounded text-xs">
              <FaInfoCircle className="inline mr-1" />
              Showing historical averages for {new Date(2024, new Date(startDate).getMonth()).toLocaleDateString('en-US', { month: 'long' })}.
              Live forecast will be available 5 days before your trip.
            </div>
          )}
        </div>

        {/* Weather Summary */}
        {weatherData.summary && (
          <div className="bg-blue-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">Trip Overview</span>
              <span className="text-blue-800">
                {formatTemperature(weatherData.summary.minTemp)}° - {formatTemperature(weatherData.summary.maxTemp)}°
              </span>
            </div>
            <div className="text-sm text-blue-700 capitalize mb-2">
              Expect: {weatherData.summary.mostCommonCondition}
            </div>
            <div className="text-xs text-blue-600">
              💡 {weatherData.summary.recommendation}
            </div>
          </div>
        )}

        {/* Daily Forecasts */}
        <div className="space-y-2">
          {weatherData.forecasts.slice(0, compact ? 3 : 5).map((forecast, index) => (
            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center">
                <img
                  src={getWeatherIconUrl(forecast.icon, '1x')}
                  alt={forecast.description}
                  className="w-8 h-8 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {formatDate(forecast.date)}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {forecast.description}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatTemperature(forecast.maxTemp)}°/{formatTemperature(forecast.minTemp)}°
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <FaTint className="mr-1" />
                  {forecast.humidity}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {weatherData.forecasts.length === 0 && (
          <div className="text-center py-4 text-blue-600">
            <p className="text-sm">Weather forecast not available for your travel dates</p>
            <button
              onClick={fetchWeather}
              className="text-xs bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded mt-2"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default WeatherWidget;