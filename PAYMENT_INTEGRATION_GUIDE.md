# Payment Integration Guide - M-Pesa & African Gateways

## Overview

This app now uses **M-Pesa Daraja API** and other African payment gateways instead of Stripe. This eliminates tracking prevention warnings and provides better payment options for African users.

## ✅ Changes Made

### Frontend Changes
1. **Removed Stripe Dependencies**
   - Removed `@stripe/stripe-js`
   - Removed `@stripe/react-stripe-js`
   - No more tracking prevention warnings!

2. **Added Payment Gateways**
   - ✅ M-Pesa (Kenya) - Primary payment method
   - ✅ Flutterwave (Africa-wide)
   - ✅ Paystack (Nigeria, Ghana, South Africa)
   - ✅ PayPal (International)

3. **Updated Components**
   - `SubscriptionCheckout.jsx` - Full M-Pesa integration
   - `PaymentPage.jsx` - Already had M-Pesa support
   - Removed all Stripe-related code

## 🚀 Payment Gateway Setup

### 1. M-Pesa Daraja API (Kenya)

#### Get Credentials
1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account
3. Create a new app
4. Get your **Consumer Key** and **Consumer Secret**

#### Test Credentials (Sandbox)
```
Consumer Key: Get from Daraja Portal
Consumer Secret: Get from Daraja Portal
Shortcode: 174379 (Test)
Passkey: Get from Daraja Portal
```

#### Environment Variables
```env
VITE_MPESA_CONSUMER_KEY=your_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_consumer_secret
```

#### Backend Implementation Required
Your backend needs these endpoints:
- `POST /payment/mpesa/initiate` - Initiate STK push
- `GET /payment/mpesa/status/:checkoutRequestId` - Check payment status
- `POST /payment/mpesa/callback` - Handle M-Pesa callback

### 2. Flutterwave (Africa-wide)

#### Get Credentials
1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
2. Sign up for an account
3. Get your **Public Key** from Settings → API

#### Supported Countries
- Kenya, Nigeria, Ghana, South Africa, Uganda, Tanzania, Rwanda, and more

#### Supported Payment Methods
- Mobile Money (M-Pesa, MTN, Airtel, etc.)
- Credit/Debit Cards
- Bank Transfer
- USSD

#### Environment Variables
```env
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...
```

#### Backend Implementation Required
- `POST /payment/flutterwave/initiate` - Create payment link
- `POST /payment/flutterwave/verify` - Verify payment

### 3. Paystack (Nigeria, Ghana, South Africa)

#### Get Credentials
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Create an account
3. Get your **Public Key** from Settings → API Keys & Webhooks

#### Supported Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Verve)
- Bank Transfer
- USSD
- Mobile Money
- QR Code

#### Environment Variables
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_... or pk_live_...
```

#### Backend Implementation Required
- `POST /payment/paystack/initiate` - Initialize transaction
- `GET /payment/paystack/verify/:reference` - Verify payment

### 4. PayPal (International)

#### Get Credentials
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a business account
3. Get your **Client ID** and **Secret**

#### Environment Variables
```env
VITE_PAYPAL_CLIENT_ID=your_client_id
```

## 📋 Backend Implementation Guide

### M-Pesa Integration Example

```javascript
// server/controllers/paymentController.js
const axios = require('axios');

// Get M-Pesa access token
const getMpesaToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
};

// Initiate STK Push
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, planId } = req.body;
    const token = await getMpesaToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount * 130), // Convert USD to KES
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.API_URL}/payment/mpesa/callback`,
        AccountReference: `SUB-${planId}`,
        TransactionDesc: `Subscription Payment - ${planId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      message: 'STK push sent successfully',
    });
  } catch (error) {
    console.error('M-Pesa error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
    });
  }
};

// M-Pesa Callback
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CheckoutRequestID, CallbackMetadata } = stkCallback;
      
      // Update subscription in database
      // Send confirmation email
      // Activate user subscription
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ success: false });
  }
};

// Check payment status
exports.checkMpesaStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    // Query your database for payment status
    const payment = await Payment.findOne({ checkoutRequestId });
    
    res.json({
      status: payment?.status || 'pending',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
```

### Required Backend Environment Variables

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox # or production

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...

# Paystack
PAYSTACK_SECRET_KEY=sk_test_... or sk_live_...
PAYSTACK_PUBLIC_KEY=pk_test_... or pk_live_...

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox # or live
```

## 🔧 Frontend Usage

### How It Works

1. **User selects a plan** on `/subscription` page
2. **Clicks "Subscribe"** → Redirected to `/checkout?plan=premium`
3. **Selects payment method** (M-Pesa, Flutterwave, Paystack, or PayPal)
4. **Enters payment details**:
   - M-Pesa: Phone number
   - Paystack: Email address
   - Flutterwave: Redirects to payment page
   - PayPal: Redirects to PayPal
5. **Completes payment**
6. **Redirected back** to success page

### M-Pesa Flow

```
User enters phone number
    ↓
Frontend sends to backend
    ↓
Backend initiates STK push
    ↓
User receives M-Pesa prompt on phone
    ↓
User enters PIN
    ↓
M-Pesa sends callback to backend
    ↓
Backend updates subscription
    ↓
Frontend polls for status
    ↓
Success! User redirected
```

## 📱 Testing

### M-Pesa Test Numbers (Sandbox)
```
Phone: 254708374149
Amount: Any amount
PIN: Any 4-digit PIN
```

### Test Cards (Flutterwave/Paystack)
```
Card Number: 5531886652142950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

## 🚨 Important Notes

1. **No More Stripe Warnings**: All tracking prevention warnings are gone!
2. **Backend Required**: You must implement backend endpoints for payments
3. **Test First**: Always test with sandbox credentials before going live
4. **Security**: Never expose secret keys in frontend code
5. **Webhooks**: Set up webhooks for payment confirmations
6. **Currency**: M-Pesa uses KES, adjust conversion rate as needed

## 📊 Payment Gateway Comparison

| Gateway | Countries | Methods | Fees | Best For |
|---------|-----------|---------|------|----------|
| M-Pesa | Kenya | Mobile Money | ~1-3% | Kenyan users |
| Flutterwave | 34+ African countries | Mobile Money, Cards, Bank | ~3.8% | Pan-African |
| Paystack | Nigeria, Ghana, SA | Cards, Bank, USSD | ~1.5-2.5% | West Africa |
| PayPal | Global | Cards, PayPal balance | ~3.9% + $0.30 | International |

## 🎯 Next Steps

1. ✅ Frontend updated (Stripe removed)
2. ⏳ Set up Daraja Portal account
3. ⏳ Implement backend endpoints
4. ⏳ Add environment variables
5. ⏳ Test with sandbox credentials
6. ⏳ Deploy backend
7. ⏳ Update Netlify environment variables
8. ⏳ Test live payments

## 📚 Resources

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/Documentation)
- [Flutterwave API Docs](https://developer.flutterwave.com/docs)
- [Paystack API Docs](https://paystack.com/docs/api/)
- [PayPal API Docs](https://developer.paypal.com/docs/api/overview/)

## 🆘 Support

If you need help implementing the backend:
1. Check the example code above
2. Review the payment gateway documentation
3. Test with sandbox credentials first
4. Monitor backend logs for errors
