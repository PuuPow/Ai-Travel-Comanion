import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import { format, differenceInDays } from 'date-fns';

export default function ItineraryCard({ itinerary, onDelete }) {
  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);
  const duration = differenceInDays(endDate, startDate) + 1;
  const isUpcoming = startDate > new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(itinerary.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/itineraries/${itinerary.id}`}>
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex items-start justify-between mb-4">
            <div>
              {isOngoing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  Ongoing
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  Upcoming
                </span>
              )}
              {!isOngoing && !isUpcoming && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                  Completed
                </span>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2">
              <Link
                href={`/itineraries/${itinerary.id}/edit`}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <FaEdit size={14} />
              </Link>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
            {itinerary.title}
          </h3>

          {/* Description */}
          {itinerary.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {itinerary.description}
            </p>
          )}

          {/* Trip Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-blue-500 flex-shrink-0" />
              <span className="truncate">{itinerary.destination}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="mr-2 text-green-500 flex-shrink-0" />
              <span>
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaClock className="mr-2 text-purple-500 flex-shrink-0" />
              <span>{duration} day{duration !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {itinerary.days?.length || 0} day{(itinerary.days?.length || 0) !== 1 ? 's' : ''} planned
              </span>
              <span>
                {itinerary.reservations?.length || 0} reservation{(itinerary.reservations?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Progress Bar */}
            {itinerary.days?.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Planning Progress</span>
                  <span>{Math.round((itinerary.days.filter(day => day.activities?.length > 0).length / itinerary.days.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((itinerary.days.filter(day => day.activities?.length > 0).length / itinerary.days.length) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}