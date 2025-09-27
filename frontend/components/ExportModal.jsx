import React, { useState } from 'react';
import {
  FaTimes,
  FaFilePdf,
  FaCalendarAlt,
  FaDownload,
  FaPrint,
  FaFileExport,
  FaGoogle,
  FaApple,
  FaFileCode,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  exportToPDF,
  exportToICS,
  exportToJSON,
  generateCalendarEvents,
  generateGoogleCalendarUrl
} from '../lib/exportUtils';

const ExportModal = ({ isOpen, onClose, itinerary }) => {
  const [activeTab, setActiveTab] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  const handleExport = async (format) => {
    if (!itinerary) return;

    setExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(itinerary);
          setExportSuccess('PDF export completed! Check your downloads or print dialog.');
          break;

        case 'ics':
          exportToICS(itinerary);
          setExportSuccess('Calendar file (.ics) downloaded successfully!');
          break;

        case 'json':
          exportToJSON(itinerary);
          setExportSuccess('Itinerary data exported as JSON file!');
          break;

        case 'google-calendar':
          const events = generateCalendarEvents(itinerary);
          // For bulk Google Calendar import, we'll export ICS and provide instructions
          exportToICS(itinerary);
          setExportSuccess('Calendar file downloaded! Import it to Google Calendar by going to Settings > Import & Export.');
          break;

        default:
          throw new Error('Unknown export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleGoogleCalendarSingle = () => {
    if (!itinerary) return;

    const events = generateCalendarEvents(itinerary);
    const mainEvent = events.find(e => e.category === 'travel');
    
    if (mainEvent) {
      const googleUrl = generateGoogleCalendarUrl(mainEvent);
      window.open(googleUrl, '_blank');
      setExportSuccess('Google Calendar opened with your trip details!');
    } else {
      setExportError('Could not create Google Calendar event');
    }
  };

  if (!isOpen) return null;

  const exportOptions = {
    pdf: {
      title: 'PDF Export',
      icon: FaFilePdf,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Generate a beautiful PDF itinerary perfect for printing or sharing',
      features: ['Print-optimized layout', 'Complete trip details', 'Daily schedules', 'Important information'],
      action: () => handleExport('pdf'),
      buttonText: 'Generate PDF'
    },
    calendar: {
      title: 'Calendar Export',
      icon: FaCalendarAlt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Add your trip to your calendar app',
      features: ['All activities as events', 'Meal reservations', 'Travel dates', 'Location details'],
      hasMultipleOptions: true
    },
    data: {
      title: 'Data Export',
      icon: FaFileCode,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Export raw itinerary data for backup or other apps',
      features: ['Complete data backup', 'JSON format', 'Import to other apps', 'Version control'],
      action: () => handleExport('json'),
      buttonText: 'Export JSON'
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaFileExport className="text-purple-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Export Trip</h3>
              <p className="text-sm text-gray-600">{itinerary?.destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Status Messages */}
        {exportSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <FaCheck className="mr-2" />
              <span className="text-sm">{exportSuccess}</span>
            </div>
          </div>
        )}

        {exportError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <FaExclamationTriangle className="mr-2" />
              <span className="text-sm">{exportError}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {Object.entries(exportOptions).map(([key, option]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <option.icon className="mr-2" />
                {option.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {Object.entries(exportOptions).map(([key, option]) => (
            activeTab === key && (
              <div key={key} className="space-y-6">
                {/* Option Details */}
                <div className={`${option.bgColor} ${option.borderColor} border rounded-lg p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <option.icon className={`${option.color} text-2xl mr-3`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{option.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <FaCheck className={`${option.color} mr-2 text-xs`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {key === 'calendar' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleExport('ics')}
                          disabled={exporting}
                          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {exporting ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaApple className="mr-2" />
                          )}
                          Download .ics File
                        </button>

                        <button
                          onClick={handleGoogleCalendarSingle}
                          disabled={exporting}
                          className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <FaGoogle className="mr-2" />
                          Add to Google Calendar
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        💡 The .ics file works with Apple Calendar, Google Calendar, Outlook, and most other calendar apps.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={option.action}
                      disabled={exporting}
                      className={`flex items-center justify-center px-6 py-3 ${option.color.replace('text-', 'bg-').replace('-600', '-600')} text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors`}
                    >
                      {exporting ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaDownload className="mr-2" />
                      )}
                      {exporting ? 'Exporting...' : option.buttonText}
                    </button>
                  )}
                </div>

                {/* Additional Information */}
                {key === 'pdf' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">PDF Export includes:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Complete trip overview with dates and duration</li>
                      <li>• Daily itinerary with activities and meals</li>
                      <li>• Weather information and packing suggestions</li>
                      <li>• Important information and emergency contacts</li>
                      <li>• Print-optimized layout for physical copies</li>
                    </ul>
                  </div>
                )}

                {key === 'calendar' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Calendar Integration:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Main trip event with full date range</li>
                      <li>• Individual activities with specific times</li>
                      <li>• Restaurant reservations and meal times</li>
                      <li>• Location information for each event</li>
                      <li>• Compatible with all major calendar apps</li>
                    </ul>
                  </div>
                )}

                {key === 'data' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Data Export Format:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Standard JSON format for easy parsing</li>
                      <li>• Includes all itinerary data and metadata</li>
                      <li>• Perfect for backup and version control</li>
                      <li>• Can be imported into other travel apps</li>
                      <li>• Preserves all custom notes and preferences</li>
                    </ul>
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            All exports are generated locally in your browser for privacy
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;