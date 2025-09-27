const Stripe = require('stripe');

class StripeService {
  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey || stripeSecretKey.includes('YOUR_') || stripeSecretKey === 'sk_test_51234567890abcdef') {
      console.warn('Stripe secret key not configured properly. Set STRIPE_SECRET_KEY in your .env file.');
      console.warn('Get your keys from https://dashboard.stripe.com/apikeys');
      this.isConfigured = false;
      return;
    }

    try {
      this.stripe = new Stripe(stripeSecretKey);
      this.isConfigured = true;
      
      const environment = stripeSecretKey.startsWith('sk_live_') ? 'Live' : 'Test';
      console.log(`Stripe service initialized in ${environment} mode`);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(userData) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: userData.name || userData.email,
        metadata: {
          userId: userData.userId
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a checkout session for one-time payment
   */
  async createCheckoutSession(priceData, userData, metadata = {}) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userData.email,
        line_items: [
          {
            price_data: {
              currency: priceData.currency || 'usd',
              product_data: {
                name: priceData.name,
                description: priceData.description,
              },
              unit_amount: Math.round(priceData.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        metadata: {
          userId: userData.userId,
          planId: metadata.planId || '',
          type: 'one_time_premium'
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createSubscriptionCheckoutSession(priceId, userData, metadata = {}) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userData.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        metadata: {
          userId: userData.userId,
          planId: metadata.planId || '',
          type: 'subscription'
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating subscription checkout session:', error);
      throw new Error('Failed to create subscription checkout session');
    }
  }

  /**
   * Retrieve checkout session
   */
  async retrieveCheckoutSession(sessionId) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'subscription']
      });
      
      return session;
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw new Error('Failed to retrieve checkout session');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription details');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Create products and prices in Stripe (run once to set up)
   */
  async createProducts() {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      // Create product
      const product = await this.stripe.products.create({
        name: 'AI Travel Companion Premium',
        description: 'Premium features for AI Travel Companion including unlimited itineraries, advanced AI suggestions, and more.',
      });

      // Create monthly price
      const monthlyPrice = await this.stripe.prices.create({
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
        nickname: 'Premium Monthly',
      });

      // Create yearly price
      const yearlyPrice = await this.stripe.prices.create({
        unit_amount: 9999, // $99.99 in cents
        currency: 'usd',
        recurring: { interval: 'year' },
        product: product.id,
        nickname: 'Premium Yearly',
      });

      console.log('Stripe products created:');
      console.log('Product ID:', product.id);
      console.log('Monthly Price ID:', monthlyPrice.id);
      console.log('Yearly Price ID:', yearlyPrice.id);

      return {
        product,
        monthlyPrice,
        yearlyPrice
      };
    } catch (error) {
      console.error('Error creating Stripe products:', error);
      throw new Error('Failed to create products');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, webhookSecret) {
    if (!this.isConfigured) {
      throw new Error('Stripe not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Get pricing plans configuration
   */
  getPricingPlans() {
    return [
      {
        id: 'premium-monthly',
        name: 'Premium Monthly',
        description: 'Monthly premium subscription',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_id_here',
        features: [
          'Unlimited itineraries',
          'Advanced AI suggestions',
          'Priority support',
          'Export to multiple formats',
          'Collaborative planning',
          'Advanced weather integration',
          'Premium templates',
          'No ads'
        ]
      },
      {
        id: 'premium-yearly',
        name: 'Premium Yearly',
        description: 'Yearly premium subscription (2 months free)',
        price: 99.99,
        currency: 'USD',
        interval: 'year',
        originalPrice: 119.88,
        savings: '17% off',
        stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_id_here',
        features: [
          'Unlimited itineraries',
          'Advanced AI suggestions',
          'Priority support',
          'Export to multiple formats',
          'Collaborative planning',
          'Advanced weather integration',
          'Premium templates',
          'No ads',
          '2 months free'
        ]
      }
    ];
  }
}

// Export singleton instance
const stripeService = new StripeService();
module.exports = stripeService;