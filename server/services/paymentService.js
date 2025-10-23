const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const Razorpay = require('razorpay');
const axios = require('axios');

// Stripe Configuration
const createStripePayment = async (amount, currency, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw new Error(error.message);
  }
};

const confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    };
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    throw new Error(error.message);
  }
};

// PayPal Configuration
const paypalEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const paypalClient = () => {
  return new paypal.core.PayPalHttpClient(paypalEnvironment());
};

const createPayPalOrder = async (amount, currency) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency || 'USD',
        value: amount.toFixed(2),
      },
    }],
  });

  try {
    const order = await paypalClient().execute(request);
    return {
      success: true,
      orderId: order.result.id,
      status: order.result.status,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw new Error(error.message);
  }
};

const capturePayPalOrder = async (orderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient().execute(request);
    return {
      success: capture.result.status === 'COMPLETED',
      status: capture.result.status,
      orderId: capture.result.id,
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw new Error(error.message);
  }
};

// Razorpay Configuration (India)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (amount, currency, receipt) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(error.message);
  }
};

const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return {
    success: generated_signature === signature,
    orderId,
    paymentId,
  };
};

// Flutterwave Configuration (Africa)
const createFlutterwavePayment = async (amount, currency, customer, metadata) => {
  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `tx_${Date.now()}`,
        amount: amount,
        currency: currency || 'NGN',
        redirect_url: `${process.env.CLIENT_URL}/payment/callback`,
        customer: {
          email: customer.email,
          name: customer.name,
        },
        customizations: {
          title: 'CinemaFlix Subscription',
          description: metadata.description || 'Subscription Payment',
          logo: `${process.env.CLIENT_URL}/logo.png`,
        },
        meta: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return {
      success: true,
      paymentLink: response.data.data.link,
      transactionId: response.data.data.id,
    };
  } catch (error) {
    console.error('Flutterwave payment error:', error);
    throw new Error(error.message);
  }
};

const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return {
      success: response.data.data.status === 'successful',
      status: response.data.data.status,
      amount: response.data.data.amount,
      transactionId: response.data.data.id,
    };
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    throw new Error(error.message);
  }
};

// Paystack Configuration (Africa)
const createPaystackPayment = async (amount, email, metadata) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: Math.round(amount * 100), // Convert to kobo
        metadata: metadata,
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error('Paystack payment error:', error);
    throw new Error(error.message);
  }
};

const verifyPaystackPayment = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return {
      success: response.data.data.status === 'success',
      status: response.data.data.status,
      amount: response.data.data.amount / 100,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error(error.message);
  }
};

// Unified Payment Interface
const processPayment = async (gateway, paymentData) => {
  switch (gateway.toLowerCase()) {
    case 'stripe':
      return await createStripePayment(
        paymentData.amount,
        paymentData.currency,
        paymentData.metadata
      );
    
    case 'paypal':
      return await createPayPalOrder(
        paymentData.amount,
        paymentData.currency
      );
    
    case 'razorpay':
      return await createRazorpayOrder(
        paymentData.amount,
        paymentData.currency,
        paymentData.receipt
      );
    
    case 'flutterwave':
      return await createFlutterwavePayment(
        paymentData.amount,
        paymentData.currency,
        paymentData.customer,
        paymentData.metadata
      );
    
    case 'paystack':
      return await createPaystackPayment(
        paymentData.amount,
        paymentData.customer.email,
        paymentData.metadata
      );
    
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

const verifyPayment = async (gateway, verificationData) => {
  switch (gateway.toLowerCase()) {
    case 'stripe':
      return await confirmStripePayment(verificationData.paymentIntentId);
    
    case 'paypal':
      return await capturePayPalOrder(verificationData.orderId);
    
    case 'razorpay':
      return await verifyRazorpayPayment(
        verificationData.orderId,
        verificationData.paymentId,
        verificationData.signature
      );
    
    case 'flutterwave':
      return await verifyFlutterwavePayment(verificationData.transactionId);
    
    case 'paystack':
      return await verifyPaystackPayment(verificationData.reference);
    
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

module.exports = {
  // Stripe
  createStripePayment,
  confirmStripePayment,
  
  // PayPal
  createPayPalOrder,
  capturePayPalOrder,
  
  // Razorpay
  createRazorpayOrder,
  verifyRazorpayPayment,
  
  // Flutterwave
  createFlutterwavePayment,
  verifyFlutterwavePayment,
  
  // Paystack
  createPaystackPayment,
  verifyPaystackPayment,
  
  // Unified Interface
  processPayment,
  verifyPayment,
};
