import React from 'react';
import WeatherWidget from '../components/WeatherWidget';

const WeatherTestPage = () => {
  // Test dates - one for near future (live weather) and one for far future (seasonal)
  const nearFuture = new Date();
  nearFuture.setDate(nearFuture.getDate() + 3); // 3 days from now
  
  const farFuture = new Date();
  farFuture.setDate(farFuture.getDate() + 30); // 30 days from now

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Weather Widget Test</h1>
        
        <div className="grid gap-8">
          {/* Current Weather */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Weather</h2>
            <WeatherWidget 
              destination="Paris, France" 
            />
          </div>

          {/* Live Weather Forecast (within 5 days) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Live Weather Forecast (Trip in 3 days)
            </h2>
            <WeatherWidget 
              destination="Tokyo, Japan"
              startDate={nearFuture.toISOString().split('T')[0]}
              endDate={new Date(nearFuture.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>

          {/* Seasonal Weather Forecast (far future) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Seasonal Weather Averages (Trip in 30 days)
            </h2>
            <WeatherWidget 
              destination="London, UK"
              startDate={farFuture.toISOString().split('T')[0]}
              endDate={new Date(farFuture.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>

          {/* Compact Version */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Compact Weather Widget</h2>
            <WeatherWidget 
              destination="Barcelona, Spain" 
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherTestPage;