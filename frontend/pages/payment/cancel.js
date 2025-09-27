import Head from 'next/head';
import Link from 'next/link';
import { FaTimes, FaArrowLeft, FaPlane } from 'react-icons/fa';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Head>
        <title>Payment Cancelled - AI Travel Companion</title>
        <meta name="description" content="Your payment was cancelled." />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <FaPlane className="text-white text-xl mr-3" />
            <h1 className="text-xl font-bold text-white">AI Travel Companion</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="bg-orange-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <FaTimes className="text-orange-600 text-4xl" />
          </div>

          {/* Cancel Message */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
            <p className="text-xl text-gray-600 mb-6">
              You cancelled the payment process. No charges were made to your account.
            </p>
            <p className="text-lg text-gray-700">
              You can continue using the free version of AI Travel Companion, or try upgrading to premium again.
            </p>
          </div>

          {/* What You Still Get */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Still Have Access To</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">3 Free Itineraries</h3>
                  <p className="text-gray-600 text-sm">Create up to 3 travel plans</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Basic AI Suggestions</h3>
                  <p className="text-gray-600 text-sm">Get travel recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Basic Export</h3>
                  <p className="text-gray-600 text-sm">Export your itineraries to text</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Support</h3>
                  <p className="text-gray-600 text-sm">Get help from our community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Would You Like to Do?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/premium" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Try Premium Again
                </Link>
                <Link 
                  href="/itineraries" 
                  className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Continue with Free Plan
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-gray-50 rounded-2xl p-6 mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you experienced any issues during the payment process, we're here to help.
            </p>
            <Link 
              href="mailto:support@travelplanner.com" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}