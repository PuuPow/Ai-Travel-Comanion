import { useState } from 'react';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

export default function DayPlanEditor({ day, onSave, onCancel, itineraryId }) {
  const [activities, setActivities] = useState(day.activities || []);
  const [notes, setNotes] = useState(day.notes || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        time: '',
        activity: '',
        description: '',
        location: '',
        duration: '',
        cost: ''
      }
    ]);
  };

  const updateActivity = (index, field, value) => {
    const updatedActivities = activities.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    );
    setActivities(updatedActivities);
  };

  const removeActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedDay = {
      ...day,
      activities: activities.filter(activity => (activity.activity || '').trim() !== ''),
      notes: notes.trim()
    };
    onSave(updatedDay);
  };

  const getAISuggestions = async () => {
    try {
      setLoadingAI(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      // Use provided itineraryId prop or extract from URL as fallback
      let currentItineraryId = itineraryId;
      if (!currentItineraryId) {
        const match = window.location.pathname.match(/\/itineraries\/([^/]+)/);
        currentItineraryId = match ? match[1] : null;
      }
      if (!currentItineraryId) throw new Error('Could not determine itinerary id');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itineraries/${currentItineraryId}/days/${day.id}/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {}
        })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get AI suggestions');
      }
      const data = await res.json();
      
      // Update local state with returned activities/meals
      setActivities((data.activities || []).map(a => ({
        time: a.time || '',
        activity: a.activity || a.name || '',
        description: a.description || '',
        location: a.location || '',
        duration: a.duration || '',
        cost: a.cost || ''
      })));
      if (data.notes) setNotes(data.notes);
      
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to get AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Activities</h4>
          <div className="flex items-center gap-3">
            <button
              onClick={getAISuggestions}
              disabled={loadingAI}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
              title="Let AI suggest this day's plan"
            >
              {loadingAI ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting suggestions...
                </>
              ) : (
                <>
                  ✨ AI Suggest Day
                </>
              )}
            </button>
            <button
              onClick={addActivity}
              className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <FaPlus className="mr-1" />
              Add Activity
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">
                  Activity {index + 1}
                </span>
                <button
                  onClick={() => removeActivity(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={activity.time || ''}
                    onChange={(e) => updateActivity(index, 'time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours"
                    value={activity.duration || ''}
                    onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Name *
                  </label>
                  <input
                    type="text"
                    placeholder="What will you be doing?"
                    value={activity.activity || ''}
                    onChange={(e) => updateActivity(index, 'activity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Additional details about this activity..."
                    value={activity.description || ''}
                    onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Address or area"
                    value={activity.location || ''}
                    onChange={(e) => updateActivity(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost
                  </label>
                  <select
                    value={activity.cost || ''}
                    onChange={(e) => updateActivity(index, 'cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select cost level</option>
                    <option value="Free">Free</option>
                    <option value="Low">Low ($)</option>
                    <option value="Medium">Medium ($$)</option>
                    <option value="High">High ($$$)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-3">No activities planned for this day yet.</p>
              <button
                onClick={addActivity}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first activity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Day Notes
        </label>
        <textarea
          rows={3}
          placeholder="Add any general notes for this day..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <FaTimes className="mr-2" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaSave className="mr-2" />
          Save Changes
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <h5 className="font-medium text-blue-900 mb-2">💡 Tips for planning your day:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Group nearby activities together to save travel time</li>
          <li>• Leave buffer time between activities for transportation</li>
          <li>• Consider meal times when scheduling activities</li>
          <li>• Check opening hours and make reservations when needed</li>
        </ul>
      </div>
    </div>
  );
}
