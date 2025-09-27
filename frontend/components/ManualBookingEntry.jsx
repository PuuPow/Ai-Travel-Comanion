import React, { useState } from 'react';
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaUtensils,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaPlus,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const ManualBookingEntry = ({ itinerary, onBookingAdded, onClose }) => {
  const [bookingType, setBookingType] = useState('hotel');
  const [bookingData, setBookingData] = useState({
    title: '',
    type: 'hotel',
    provider: '',
    confirmationNumber: '',
    date: '',
    time: '',
    location: '',
    cost: '',
    notes: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingTypes = [
    { value: 'hotel', label: 'Hotel/Accommodation', icon: FaHotel, color: 'blue' },
    { value: 'flight', label: 'Flight', icon: FaPlane, color: 'indigo' },
    { value: 'car', label: 'Car Rental', icon: FaCar, color: 'green' },
    { value: 'restaurant', label: 'Restaurant', icon: FaUtensils, color: 'red' },
    { value: 'activity', label: 'Activity/Tour', icon: FaMapMarkerAlt, color: 'purple' }
  ];

  const providers = {
    hotel: ['Booking.com', 'Hotels.com', 'Expedia', 'Marriott', 'Hilton', 'Other'],
    flight: ['American Airlines', 'Delta', 'United', 'Southwest', 'Kayak', 'Expedia', 'Other'],
    car: ['Hertz', 'Enterprise', 'Avis', 'Budget', 'Expedia', 'Other'],
    restaurant: ['OpenTable', 'Resy', 'Direct Booking', 'Other'],
    activity: ['GetYourGuide', 'Viator', 'TripAdvisor', 'Direct Booking', 'Other']
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
      type: bookingType // Ensure type matches selected booking type
    }));
  };

  const handleTypeChange = (type) => {
    setBookingType(type);
    setBookingData(prev => ({
      ...prev,
      type: type,
      provider: '', // Reset provider when type changes
      title: '', // Reset title
      time: type === 'flight' ? '' : prev.time,
      checkIn: type === 'hotel' ? prev.checkIn : '',
      checkOut: type === 'hotel' ? prev.checkOut : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create booking object
      const booking = {
        id: Date.now().toString(), // Simple ID generation
        itineraryId: itinerary.id,
        ...bookingData,
        dateCreated: new Date().toISOString(),
        status: 'confirmed'
      };

      // In a real app, this would save to the database
      // For now, we'll just call the callback
      if (onBookingAdded) {
        await onBookingAdded(booking);
      }

      // Show success message
      alert('Booking added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding booking:', error);
      alert('Failed to add booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = bookingTypes.find(type => type.value === bookingType);
  const IconComponent = selectedType?.icon || FaHotel;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IconComponent className="text-2xl mr-3" />
              <div>
                <h3 className="text-xl font-bold">Add Booking</h3>
                <p className="text-blue-100">For {itinerary.destination}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Booking Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Booking Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bookingTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      bookingType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <TypeIcon className="mx-auto mb-1 text-lg" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title/Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bookingType === 'hotel' ? 'Hotel Name' :
                 bookingType === 'flight' ? 'Flight Details' :
                 bookingType === 'car' ? 'Car Rental Company' :
                 bookingType === 'restaurant' ? 'Restaurant Name' : 'Activity Name'}
              </label>
              <input
                type="text"
                required
                value={bookingData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${bookingType} name`}
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booked Through
              </label>
              <select
                required
                value={bookingData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select provider</option>
                {providers[bookingType]?.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            {/* Confirmation Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Number
              </label>
              <input
                type="text"
                value={bookingData.confirmationNumber}
                onChange={(e) => handleInputChange('confirmationNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirmation #"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bookingType === 'hotel' ? 'Check-in Date' :
                 bookingType === 'flight' ? 'Flight Date' :
                 bookingType === 'car' ? 'Pickup Date' : 'Date'}
              </label>
              <input
                type="date"
                required
                value={bookingData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hotel-specific fields */}
            {bookingType === 'hotel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bookingData.guests}
                    onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Time (for flights, restaurants, activities) */}
            {['flight', 'restaurant', 'activity'].includes(bookingType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location/Address
              </label>
              <input
                type="text"
                value={bookingData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Address or location"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Cost (Optional)
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requests, additional details, etc."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Add Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualBookingEntry;