const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const stripeService = require('../services/stripeService');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Get pricing plans
 * GET /api/payments/plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = stripeService.getPricingPlans();
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error getting pricing plans:', error);
    res.status(500).json({ error: 'Failed to get pricing plans' });
  }
});

/**
 * Check if user has premium access
 * GET /api/payments/premium-status
 */
router.get('/premium-status', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        subscriptionStatus: true,
        subscriptionEndDate: true,
        subscriptionStartDate: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const isActive = user.subscriptionStatus === 'premium' && 
                    user.subscriptionEndDate && 
                    new Date(user.subscriptionEndDate) > now;

    res.json({
      success: true,
      isPremium: isActive,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionStartDate: user.subscriptionStartDate
    });

  } catch (error) {
    console.error('Error checking premium status:', error);
    res.status(500).json({ error: 'Failed to check premium status' });
  }
});

/**
 * Create a Stripe checkout session
 * POST /api/payments/create-order
 */
router.post('/create-order', authenticateUser, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const plans = stripeService.getPricingPlans();
    const selectedPlan = plans.find(plan => plan.id === planId);
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Ensure Stripe is configured
    if (!stripeService.isConfigured) {
      console.error('Stripe not configured - missing credentials');
      return res.status(503).json({ 
        error: 'Payment service temporarily unavailable', 
        details: 'Stripe credentials not configured. Please contact support.' 
      });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe checkout session
    const session = await stripeService.createCheckoutSession(
      {
        name: selectedPlan.name,
        description: selectedPlan.description,
        amount: selectedPlan.price,
        currency: 'usd'
      },
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      {
        planId: selectedPlan.id
      }
    );

    // Store payment record in database
    await prisma.payment.create({
      data: {
        paypalOrderId: session.id, // Using this field for session ID
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        status: 'pending',
        type: 'one-time',
        description: `${selectedPlan.name} - Premium Upgrade`,
        userId: req.user.userId,
        paypalData: JSON.stringify({ stripeSessionId: session.id, planId: selectedPlan.id })
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('Error creating payment checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Complete Stripe payment
 * POST /api/payments/capture-order
 */
router.post('/capture-order', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.body;
    console.log('🔍 Capture payment request received:', { sessionId, userId: req.user.userId });

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { paypalOrderId: sessionId } // Using this field for session ID
    });
    console.log('🔍 Payment record found:', payment ? { id: payment.id, status: payment.status, userId: payment.userId } : 'NOT FOUND');

    if (!payment || payment.userId !== req.user.userId) {
      console.log('❌ Payment not found or user mismatch:', { payment: !!payment, userMatch: payment?.userId === req.user.userId });
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Ensure Stripe is configured
    if (!stripeService.isConfigured) {
      console.error('Stripe not configured - cannot verify payment');
      return res.status(503).json({ 
        error: 'Payment service unavailable',
        details: 'Stripe not properly configured'
      });
    }

    // Retrieve Stripe checkout session
    const session = await stripeService.retrieveCheckoutSession(sessionId);
    console.log('🔍 Stripe session retrieved:', { id: session.id, payment_status: session.payment_status, customer_email: session.customer_email });
    
    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid, upgrading user...');
      // Update payment status
      await prisma.payment.update({
        where: { paypalOrderId: sessionId },
        data: {
          status: 'completed',
          paypalPaymentId: session.payment_intent,
          paypalData: JSON.stringify(session),
          updatedAt: new Date()
        }
      });

      // Upgrade user to premium
      const endDate = new Date();
      if (payment.description.includes('Monthly')) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (payment.description.includes('Yearly')) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          subscriptionStatus: 'premium',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: endDate
        }
      });
      
      console.log('🎆 User upgraded to premium successfully!', { userId: req.user.userId, endDate });

      res.json({
        success: true,
        message: 'Payment completed successfully',
        subscriptionEndDate: endDate
      });

    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { paypalOrderId: sessionId },
        data: {
          status: 'failed',
          paypalData: JSON.stringify(session),
          updatedAt: new Date()
        }
      });

      res.status(400).json({ error: 'Payment not completed or failed' });
    }

  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

/**
 * Create a subscription
 * POST /api/payments/create-subscription
 */
router.post('/create-subscription', authenticateUser, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plans = paypalService.getPricingPlans();
    const selectedPlan = plans.find(plan => plan.id === planId);
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // For subscriptions, you would need to create a PayPal plan first
    // This is a simplified version for one-time payments
    res.json({
      success: false,
      message: 'Subscriptions not implemented yet. Please use one-time payment.'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * Cancel subscription
 * POST /api/payments/cancel-subscription
 */
router.post('/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel subscription with PayPal
    await paypalService.cancelSubscription(user.subscriptionId);

    // Update user subscription status
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        subscriptionStatus: 'cancelled'
      }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Get user's payment history
 * GET /api/payments/history
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        paypalOrderId: true,
        amount: true,
        currency: true,
        status: true,
        type: true,
        description: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

/**
 * PayPal webhook endpoint
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookBody = req.body;
    const headers = req.headers;

    // Verify webhook signature
    if (!paypalService.verifyWebhook(headers, webhookBody, process.env.PAYPAL_WEBHOOK_ID)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('PayPal webhook received:', webhookBody.event_type);

    switch (webhookBody.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookBody);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentFailed(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(webhookBody);
        break;
      default:
        console.log('Unhandled webhook event:', webhookBody.event_type);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook handler functions
async function handlePaymentCompleted(webhookData) {
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  
  if (orderId) {
    await prisma.payment.updateMany({
      where: { paypalOrderId: orderId },
      data: {
        status: 'completed',
        paypalData: JSON.stringify(webhookData.resource)
      }
    });
  }
}

async function handlePaymentFailed(webhookData) {
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  
  if (orderId) {
    await prisma.payment.updateMany({
      where: { paypalOrderId: orderId },
      data: {
        status: 'failed',
        paypalData: JSON.stringify(webhookData.resource)
      }
    });
  }
}

async function handleSubscriptionActivated(webhookData) {
  const subscriptionId = webhookData.resource.id;
  
  await prisma.user.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      subscriptionStatus: 'premium'
    }
  });
}

async function handleSubscriptionCancelled(webhookData) {
  const subscriptionId = webhookData.resource.id;
  
  await prisma.user.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      subscriptionStatus: 'cancelled'
    }
  });
}

async function handleSubscriptionExpired(webhookData) {
  const subscriptionId = webhookData.resource.id;
  
  await prisma.user.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      subscriptionStatus: 'expired'
    }
  });
}

module.exports = router;