import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaCheck, FaCrown, FaPlane, FaSpinner } from 'react-icons/fa';

export default function PaymentSuccess() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    const { session_id } = router.query;
    console.log('🔍 Payment success page loaded with query:', router.query);
    
    if (session_id) {
      console.log('🚀 Starting payment verification for session:', session_id);
      verifyPayment(session_id);
    } else {
      console.log('⚠️ No session_id found in URL');
    }
  }, [router.query]);

  const verifyPayment = async (sessionId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ No auth token found');
        throw new Error('Authentication required');
      }
      console.log('🔑 Auth token found, making API request...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      console.log('📡 API response status:', response.status);
      const data = await response.json();
      console.log('📨 API response data:', data);

      if (data.success) {
        console.log('✅ Payment verification successful!');
        setSuccess(true);
        setSubscriptionInfo({
          endDate: data.subscriptionEndDate
        });
      } else {
        console.log('❌ Payment verification failed:', data.error);
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <Link 
              href="/premium" 
              className="block w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Try Again
            </Link>
            <Link 
              href="/itineraries" 
              className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Head>
        <title>Payment Successful - AI Travel Companion</title>
        <meta name="description" content="Your premium upgrade was successful!" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <FaPlane className="text-white text-xl mr-3" />
            <h1 className="text-xl font-bold text-white">AI Travel Companion</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <FaCheck className="text-green-600 text-4xl" />
          </div>

          {/* Success Message */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-4">
              <FaCrown className="text-yellow-500 text-3xl mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Welcome to Premium!</h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              🎉 Your payment was successful! You now have access to all premium features.
            </p>
            {subscriptionInfo && (
              <p className="text-lg text-gray-700">
                Your premium subscription is active until{' '}
                <strong>{new Date(subscriptionInfo.endDate).toLocaleDateString()}</strong>
              </p>
            )}
          </div>

          {/* Premium Features Unlocked */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Features Unlocked</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Unlimited Itineraries</h3>
                  <p className="text-gray-600 text-sm">Create as many travel plans as you want</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced AI Suggestions</h3>
                  <p className="text-gray-600 text-sm">Get smarter, personalized recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Priority Support</h3>
                  <p className="text-gray-600 text-sm">Get help faster with dedicated support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced Export Options</h3>
                  <p className="text-gray-600 text-sm">PDF, calendar integration, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Collaborative Planning</h3>
                  <p className="text-gray-600 text-sm">Plan trips together with others</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Templates</h3>
                  <p className="text-gray-600 text-sm">Access exclusive itinerary templates</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
            <p className="text-lg mb-6">
              Start creating amazing travel experiences with your new premium features!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/itineraries/new" 
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Create New Itinerary
              </Link>
              <Link 
                href="/itineraries" 
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              As a premium user, you now have access to priority support.
            </p>
            <Link 
              href="mailto:support@travelplanner.com" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact Premium Support →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}