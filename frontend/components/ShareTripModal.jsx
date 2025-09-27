import React, { useState } from 'react';
import { FaTimes, FaLink, FaFacebook, FaTwitter, FaWhatsapp, FaCopy, FaCheck } from 'react-icons/fa';

const ShareTripModal = ({ isOpen, onClose, itinerary }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${itinerary?.id || 'demo'}`;
  const tripTitle = itinerary?.title || 'My Trip';
  const destination = itinerary?.destination || 'Amazing Destination';

  const shareText = `Check out my trip to ${destination}: ${tripTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Share Your Trip</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Trip Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-1">{tripTitle}</h4>
          <p className="text-gray-600 text-sm">{destination}</p>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Share on Social Media</h4>
          
          <button
            onClick={shareToFacebook}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFacebook className="mr-3" />
            Share on Facebook
          </button>

          <button
            onClick={shareToTwitter}
            className="w-full flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <FaTwitter className="mr-3" />
            Share on Twitter
          </button>

          <button
            onClick={shareToWhatsApp}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaWhatsapp className="mr-3" />
            Share on WhatsApp
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareTripModal;