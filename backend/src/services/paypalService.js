const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

// PayPal Configuration
class PayPalService {
  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.NODE_ENV === 'production' ? Environment.Live : Environment.Sandbox;
    
    if (!clientId || !clientSecret || clientId.includes('your-') || clientSecret.includes('your-')) {
      console.warn('PayPal credentials not configured properly. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file.');
      this.isConfigured = false;
      return;
    }

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment: environment,
    });

    this.ordersController = new OrdersController(this.client);
    this.isConfigured = true;
    
    console.log(`PayPal service initialized in ${environment} mode`);
    console.log(`Using client ID: ${clientId.substring(0, 10)}...`);
  }

  /**
   * Create a PayPal order for one-time payment
   */
  async createOrder(amount, currency = 'USD', description = 'Premium Upgrade') {
    if (!this.isConfigured) {
      throw new Error('PayPal not configured');
    }

    try {
      const request = {
        body: {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description: description,
            },
          ],
          application_context: {
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
            brand_name: 'AI Travel Companion',
            user_action: 'PAY_NOW',
          },
        },
      };

      const response = await this.ordersController.ordersCreate(request);
      return response.result;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Capture a PayPal order
   */
  async captureOrder(orderId) {
    if (!this.isConfigured) {
      throw new Error('PayPal not configured');
    }

    try {
      const request = {
        id: orderId,
        body: {},
      };

      const response = await this.ordersController.ordersCapture(request);
      return response.result;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    if (!this.isConfigured) {
      throw new Error('PayPal not configured');
    }

    try {
      const request = { id: orderId };
      const response = await this.ordersController.ordersGet(request);
      return response.result;
    } catch (error) {
      console.error('Error getting PayPal order:', error);
      throw new Error('Failed to get order details');
    }
  }


  /**
   * Verify webhook signature
   */
  verifyWebhook(headers, body, webhookId) {
    // PayPal webhook verification would go here
    // For now, we'll implement basic verification
    const signature = headers['paypal-transmission-sig'];
    const certId = headers['paypal-cert-id'];
    const transmissionId = headers['paypal-transmission-id'];
    const timestamp = headers['paypal-transmission-time'];
    
    // In production, you should verify the signature properly
    // For development, we'll return true
    return process.env.NODE_ENV !== 'production' || Boolean(signature && certId && transmissionId && timestamp);
  }

  /**
   * Get pricing plans (hardcoded for now)
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
const paypalService = new PayPalService();
module.exports = paypalService;