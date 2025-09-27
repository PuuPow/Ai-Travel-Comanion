import React from 'react';
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaUtensils,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const BookingConfirmation = ({ booking, onEdit, onDelete }) => {
  const getBookingIcon = (type) => {
    switch (type) {
      case 'hotel': return FaHotel;
      case 'flight': return FaPlane;
      case 'car': return FaCar;
      case 'restaurant': return FaUtensils;
      case 'activity': return FaMapMarkerAlt;
      default: return FaCalendarAlt;
    }
  };

  const getBookingColor = (type) => {
    switch (type) {
      case 'hotel': return 'blue';
      case 'flight': return 'indigo';
      case 'car': return 'green';
      case 'restaurant': return 'red';
      case 'activity': return 'purple';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const IconComponent = getBookingIcon(booking.type);
  const color = getBookingColor(booking.type);

  return (
    <div className={`bg-white rounded-lg border-l-4 border-${color}-500 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            <div className={`bg-${color}-100 p-3 rounded-lg mr-4`}>
              <IconComponent className={`text-${color}-600 text-xl`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className="capitalize">{booking.type}</span>
                {booking.provider && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{booking.provider}</span>
                  </>
                )}
                {booking.status && (
                  <>
                    <span className="mx-2">•</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'confirmed' && <FaCheck className="mr-1 text-xs" />}
                      {booking.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(booking)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit booking"
              >
                <FaEdit />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(booking.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete booking"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Information */}
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <div>
              <div className="font-medium">
                {booking.type === 'hotel' ? 'Check-in' : 
                 booking.type === 'car' ? 'Pickup' : 'Date'}
              </div>
              <div>{formatDate(booking.date)}</div>
            </div>
          </div>

          {/* Check-out for hotels */}
          {booking.type === 'hotel' && booking.checkOut && (
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <div>
                <div className="font-medium">Check-out</div>
                <div>{formatDate(booking.checkOut)}</div>
              </div>
            </div>
          )}

          {/* Time */}
          {booking.time && (
            <div className="flex items-center text-sm text-gray-600">
              <FaClock className="mr-2 text-gray-400" />
              <div>
                <div className="font-medium">Time</div>
                <div>{formatTime(booking.time)}</div>
              </div>
            </div>
          )}

          {/* Location */}
          {booking.location && (
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <div>
                <div className="font-medium">Location</div>
                <div className="truncate">{booking.location}</div>
              </div>
            </div>
          )}

          {/* Cost */}
          {booking.cost && (
            <div className="flex items-center text-sm text-gray-600">
              <FaDollarSign className="mr-2 text-gray-400" />
              <div>
                <div className="font-medium">Cost</div>
                <div>${parseFloat(booking.cost).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Guests (for hotels) */}
          {booking.type === 'hotel' && booking.guests && (
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <div>
                <div className="font-medium">Guests</div>
                <div>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Number */}
        {booking.confirmationNumber && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Confirmation Number
            </div>
            <div className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border inline-block">
              {booking.confirmationNumber}
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-700 mb-1">
              Notes
            </div>
            <div className="text-sm text-blue-600">
              {booking.notes}
            </div>
          </div>
        )}

        {/* Footer with booking date */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div>
            Added on {new Date(booking.dateCreated).toLocaleDateString()}
          </div>
          {booking.provider && booking.type !== 'restaurant' && (
            <div className="flex items-center">
              <span>Booked via {booking.provider}</span>
              <FaExternalLinkAlt className="ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;