import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FaPlane, 
  FaCheck, 
  FaTimes, 
  FaCrown, 
  FaRocket, 
  FaShieldAlt,
  FaStar,
  FaInfinity,
  FaBrain,
  FaMobile,
  FaCloud,
  FaHeadset,
  FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Premium() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const plans = {
    free: {
      name: 'Free Explorer',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out AI travel planning',
      features: [
        '3 itineraries maximum',
        'Basic AI trip suggestions',
        'Standard booking links',
        'Basic export (text only)',
        'Community support'
      ],
      limitations: [
        'Limited to 3 trips',
        'No real-time updates',
        'No premium templates',
        'No priority support'
      ],
      cta: 'Current Plan',
      popular: false
    },
    premium: {
      name: 'Premium Traveler',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Unlock the full power of AI travel planning',
      features: [
        'Unlimited itineraries',
        'Advanced AI recommendations',
        'Real-time weather & updates',
        'Premium trip templates',
        'PDF & calendar export',
        'Trip sharing & collaboration',
        'Priority email support',
        'Mobile app access',
        'Offline itinerary access'
      ],
      limitations: [],
      cta: 'Start Premium Trial',
      popular: true,
      trial: '7-day free trial'
    },
    business: {
      name: 'Business Traveler',
      price: { monthly: 29.99, yearly: 299.99 },
      description: 'Advanced features for frequent business travelers',
      features: [
        'Everything in Premium',
        'Team collaboration tools',
        'Expense tracking & reporting',
        'Corporate travel policies',
        'API access for integrations',
        'Custom branding options',
        'Dedicated account manager',
        'Phone support',
        '99.9% uptime SLA'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      enterprise: true
    }
  };

  const handlePlanSelection = async (planKey) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirect to signup with selected plan
      router.push(`/signup?plan=${planKey}&billing=${billingPeriod}`);
      return;
    }

    if (planKey === 'free') {
      return; // Already on free plan
    }

    if (planKey === 'business') {
      // Redirect to contact form
      window.open('mailto:business@travelplanner.com?subject=Business Plan Inquiry', '_blank');
      return;
    }

    // Handle premium signup with Stripe
    setLoading(true);
    
    try {
      // Determine the plan ID based on billing period
      const planId = billingPeriod === 'yearly' ? 'premium-yearly' : 'premium-monthly';
      
      // Create Stripe checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (plan) => {
    const price = plan.price[billingPeriod];
    if (price === 0) return 'Free';
    
    if (billingPeriod === 'yearly') {
      const monthlyEquivalent = (price / 12).toFixed(2);
      return (
        <div>
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-lg text-gray-600">/year</span>
          <div className="text-sm text-green-600">
            (${monthlyEquivalent}/month)
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-lg text-gray-600">/month</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>Premium Plans - AI Travel Companion</title>
        <meta name="description" content="Unlock premium features for your travel planning with AI-powered recommendations and advanced tools." />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaPlane className="text-white text-xl mr-2" />
                <h1 className="text-xl font-bold text-white">AI Travel Companion</h1>
              </Link>
            </div>
            <Link href="/" className="text-white/90 hover:text-white transition-colors flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <FaCrown className="text-yellow-500 text-3xl mr-3" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upgrade Your Travel Planning
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of AI-powered travel planning with premium features designed for serious travelers.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {Object.entries(plans).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`relative rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.popular 
                  ? 'ring-2 ring-blue-500 transform scale-105' 
                  : 'border border-gray-200'
              } ${
                planKey === 'free' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-medium">
                  <FaStar className="inline mr-1" /> Most Popular
                </div>
              )}

              <div className="p-8">
                <div className={`mb-6 ${plan.popular ? 'mt-6' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    {formatPrice(plan)}
                  </div>

                  {plan.trial && (
                    <div className="text-sm text-blue-600 font-medium mb-4">
                      🎉 {plan.trial}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelection(planKey)}
                  disabled={loading || (planKey === 'free' && isAuthenticated())}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : planKey === 'free'
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && selectedPlan === planKey ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.cta
                  )}
                </button>

                {planKey === 'premium' && (
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Cancel anytime • No setup fees
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Compare All Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 mb-3">
                <FaBrain className="mr-3" />
                <h3 className="font-semibold">AI Features</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>✅ Basic AI recommendations (All plans)</div>
                <div>⭐ Advanced AI insights (Premium+)</div>
                <div>🚀 Custom AI training (Business)</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-green-600 mb-3">
                <FaMobile className="mr-3" />
                <h3 className="font-semibold">Mobile & Sync</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>✅ Web access (All plans)</div>
                <div>⭐ Mobile app (Premium+)</div>
                <div>🚀 Offline sync (Business)</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-purple-600 mb-3">
                <FaHeadset className="mr-3" />
                <h3 className="font-semibold">Support</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>✅ Community support (Free)</div>
                <div>⭐ Priority email (Premium)</div>
                <div>🚀 Phone + dedicated manager (Business)</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Yes! You can cancel your subscription at any time from your account settings. No cancellation fees.
              </p>

              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Premium plans include a 7-day free trial. No credit card required during trial period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm mb-4">
                We accept all major credit cards, PayPal, and bank transfers for Business plans.
              </p>

              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely! You can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center text-gray-500 mb-4">
            <FaShieldAlt className="mr-2" />
            <span className="text-sm">Secure payments powered by Stripe</span>
          </div>
        </div>
      </main>
    </div>
  );
}