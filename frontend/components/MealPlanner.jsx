import React, { useState } from 'react';
import { fetchWithAuth } from '../lib/api';

const MealPlanner = ({ day, itinerary, onMealsUpdate }) => {
  const [meals, setMeals] = useState(() => {
    try {
      return day.meals ? JSON.parse(day.meals) : {
        breakfast: null,
        lunch: null,
        dinner: null
      };
    } catch {
      return {
        breakfast: null,
        lunch: null,
        dinner: null
      };
    }
  });
  
  const [suggestions, setSuggestions] = useState({
    breakfast: [],
    lunch: [],
    dinner: []
  });
  
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [savingMeals, setSavingMeals] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get AI meal suggestions
  const getAISuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      
      const response = await fetchWithAuth('/api/meals/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          destination: itinerary.destination,
          date: day.date,
          vacationStyle: itinerary.vacationStyle,
          dietaryRestrictions: [], // Can be expanded later
          budget: 'medium' // Can be made configurable
        })
      });
      
      if (response.success) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      alert('Failed to get meal suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Save meals for this day
  const saveMeals = async () => {
    try {
      setSavingMeals(true);
      
      const response = await fetchWithAuth(`/api/meals/day/${day.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          meals: meals
        })
      });
      
      if (response.success) {
        onMealsUpdate && onMealsUpdate(day.id, meals);
        alert('Meals saved successfully!');
      }
    } catch (error) {
      console.error('Error saving meals:', error);
      alert('Failed to save meals. Please try again.');
    } finally {
      setSavingMeals(false);
    }
  };

  // Select a suggestion for a meal type
  const selectSuggestion = (mealType, suggestion) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: suggestion
    }));
  };

  // Clear a meal selection
  const clearMeal = (mealType) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: null
    }));
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🍽️ Meal Planning - Day {day.dayNumber}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={getAISuggestions}
            disabled={loadingSuggestions}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingSuggestions ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Getting Suggestions...
              </>
            ) : (
              <>
                ✨ AI Suggestions
              </>
            )}
          </button>
          <button
            onClick={saveMeals}
            disabled={savingMeals}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {savingMeals ? 'Saving...' : '💾 Save Meals'}
          </button>
        </div>
      </div>

      {/* Current Meal Selections */}
      <div className="grid gap-4 mb-6">
        {mealTypes.map(({ key, label, icon }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                {icon} {label}
              </h4>
              {meals[key] && (
                <button
                  onClick={() => clearMeal(key)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            
            {meals[key] ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-800">{meals[key].name}</h5>
                <p className="text-gray-600 text-sm mt-1">{meals[key].description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Type: {meals[key].type?.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {meals[key].estimatedCost}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500">No {label.toLowerCase()} selected</p>
                <p className="text-gray-400 text-sm">Use AI suggestions or add manually</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      {showSuggestions && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            ✨ AI Meal Suggestions for {itinerary.destination}
          </h4>
          
          {mealTypes.map(({ key, label, icon }) => (
            <div key={key} className="mb-6">
              <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                {icon} {label} Options
              </h5>
              <div className="grid gap-3">
                {suggestions[key]?.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      meals[key]?.name === suggestion.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectSuggestion(key, suggestion)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-800">{suggestion.name}</h6>
                        <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {suggestion.type?.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {suggestion.dietaryOptions?.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600">
                          {suggestion.estimatedCost}
                        </span>
                        {meals[key]?.name === suggestion.name && (
                          <div className="text-purple-600 text-sm mt-1">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Hide Suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;