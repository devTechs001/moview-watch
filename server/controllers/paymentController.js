const paymentService = require('../services/paymentService');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Create payment intent/order
exports.createPayment = async (req, res) => {
  try {
    const { gateway, planId, amount, currency } = req.body;
    const user = req.user;

    // Validate input
    if (!gateway || !planId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Prepare payment data
    const paymentData = {
      amount,
      currency: currency || 'usd',
      customer: {
        email: user.email,
        name: user.name,
      },
      metadata: {
        userId: user._id.toString(),
        planId,
        userEmail: user.email,
        description: `Subscription - ${planId}`,
      },
      receipt: `receipt_${user._id}_${Date.now()}`,
    };

    // Process payment through selected gateway
    const paymentResult = await paymentService.processPayment(gateway, paymentData);

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      gateway,
      amount,
      currency,
      planId,
      status: 'pending',
      gatewayResponse: paymentResult,
    });

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        ...paymentResult,
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment',
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { gateway, paymentId, ...verificationData } = req.body;

    if (!gateway || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Verify payment with gateway
    const verificationResult = await paymentService.verifyPayment(
      gateway,
      verificationData
    );

    // Update payment status
    payment.status = verificationResult.success ? 'completed' : 'failed';
    payment.verificationResponse = verificationResult;
    payment.completedAt = verificationResult.success ? new Date() : null;
    await payment.save();

    // If payment successful, update user subscription
    if (verificationResult.success) {
      const user = await User.findById(payment.user);
      
      // Calculate subscription end date based on plan
      const subscriptionDuration = getSubscriptionDuration(payment.planId);
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + subscriptionDuration);

      user.subscription = {
        plan: payment.planId,
        status: 'active',
        startDate: new Date(),
        endDate: subscriptionEnd,
        autoRenew: true,
      };
      await user.save();
    }

    res.status(200).json({
      success: true,
      verified: verificationResult.success,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
    });
  }
};

// Webhook handlers for different gateways
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update payment record
        await Payment.findOneAndUpdate(
          { 'gatewayResponse.paymentIntentId': paymentIntent.id },
          { status: 'completed', completedAt: new Date() }
        );
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await Payment.findOneAndUpdate(
          { 'gatewayResponse.paymentIntentId': failedPayment.id },
          { status: 'failed' }
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// Helper function to get subscription duration in days
function getSubscriptionDuration(planId) {
  const durations = {
    basic_monthly: 30,
    basic_yearly: 365,
    premium_monthly: 30,
    premium_yearly: 365,
    pro_monthly: 30,
    pro_yearly: 365,
  };
  return durations[planId] || 30;
}

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel',
      });
    }

    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
    });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'HD Quality',
          '1 Device',
          'Limited Content',
          'Ads Included',
        ],
      },
      {
        id: 'basic_yearly',
        name: 'Basic Yearly',
        price: 99.99,
        currency: 'USD',
        interval: 'year',
        features: [
          'HD Quality',
          '1 Device',
          'Limited Content',
          'Ads Included',
          '2 Months Free',
        ],
        savings: '17%',
      },
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 14.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Full HD Quality',
          '2 Devices',
          'Full Content Library',
          'Ad-Free',
          'Download Content',
        ],
        popular: true,
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: 149.99,
        currency: 'USD',
        interval: 'year',
        features: [
          'Full HD Quality',
          '2 Devices',
          'Full Content Library',
          'Ad-Free',
          'Download Content',
          '2 Months Free',
        ],
        popular: true,
        savings: '17%',
      },
      {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          '4K Ultra HD',
          '4 Devices',
          'Full Content Library',
          'Ad-Free',
          'Download Content',
          'Early Access',
          'Priority Support',
        ],
      },
      {
        id: 'pro_yearly',
        name: 'Pro Yearly',
        price: 199.99,
        currency: 'USD',
        interval: 'year',
        features: [
          '4K Ultra HD',
          '4 Devices',
          'Full Content Library',
          'Ad-Free',
          'Download Content',
          'Early Access',
          'Priority Support',
          '2 Months Free',
        ],
        savings: '17%',
      },
    ];

    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
    });
  }
};

module.exports = exports;
