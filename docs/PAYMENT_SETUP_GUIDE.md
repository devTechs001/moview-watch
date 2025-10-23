# 💳 Payment & Subscription System Setup Guide

## Overview
Complete payment and subscription system with support for multiple payment gateways and TMDB API integration.

## 🔑 API Keys Required

### 1. TMDB API Key (Required for Movies)
1. Go to https://www.themoviedb.org/
2. Create an account or login
3. Navigate to Settings → API
4. Request an API key (free)
5. Copy your API key

### 2. Stripe (Credit/Debit Cards - Global)
1. Go to https://stripe.com/
2. Create an account
3. Get your API keys from Dashboard → Developers → API keys
4. You'll need:
   - Publishable key (starts with `pk_test_` or `pk_live_`)
   - Secret key (starts with `sk_test_` or `sk_live_`)
   - Webhook secret (for webhooks)

### 3. PayPal (Global)
1. Go to https://developer.paypal.com/
2. Create a developer account
3. Create a REST API app
4. Get your:
   - Client ID
   - Client Secret
5. Choose mode: `sandbox` (testing) or `live` (production)

### 4. Razorpay (India)
1. Go to https://razorpay.com/
2. Sign up for an account
3. Navigate to Settings → API Keys
4. Generate keys:
   - Key ID
   - Key Secret

### 5. Flutterwave (Africa)
1. Go to https://flutterwave.com/
2. Create an account
3. Get your keys from Settings → API
4. You'll need:
   - Public key
   - Secret key
   - Encryption key

### 6. Paystack (Africa)
1. Go to https://paystack.com/
2. Sign up for an account
3. Navigate to Settings → API Keys & Webhooks
4. Get your:
   - Public key
   - Secret key

## 📝 Environment Configuration

### Server (.env)
```env
# TMDB API
TMDB_API_KEY=your_actual_tmdb_api_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Client (.env)
```env
# Payment Gateway Public Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# TMDB API (optional on client)
VITE_TMDB_API_KEY=your_tmdb_api_key
```

## 📦 Required NPM Packages

### Server
```bash
cd server
npm install stripe @paypal/checkout-server-sdk razorpay axios
```

### Client
```bash
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## 🚀 Quick Start

### 1. Copy Environment Files
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 2. Add Your API Keys
Edit the `.env` files and replace placeholder values with your actual API keys.

### 3. Start the Application
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 4. Test Payment Flow
1. Navigate to `/subscription`
2. Select a plan
3. Click "Subscribe" or "Get Started"
4. Choose payment method
5. Complete test payment

## 🧪 Testing

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### PayPal Sandbox
Use PayPal sandbox accounts created in your developer dashboard.

### Razorpay Test
Use Razorpay test mode credentials.

## 📋 Subscription Plans

### Basic Monthly - $9.99/month
- HD Quality
- 1 Device
- Limited Content
- Ads Included

### Basic Yearly - $99.99/year (Save 17%)
- Same as Basic Monthly
- 2 Months Free

### Premium Monthly - $14.99/month (Popular)
- Full HD Quality
- 2 Devices
- Full Content Library
- Ad-Free
- Download Content

### Premium Yearly - $149.99/year (Save 17%)
- Same as Premium Monthly
- 2 Months Free

### Pro Monthly - $19.99/month
- 4K Ultra HD
- 4 Devices
- Full Content Library
- Ad-Free
- Download Content
- Early Access
- Priority Support

### Pro Yearly - $199.99/year (Save 17%)
- Same as Pro Monthly
- 2 Months Free

## 🔒 Security Features

### Payment Security
- ✅ 256-bit SSL encryption
- ✅ PCI DSS compliant (via payment gateways)
- ✅ No credit card data stored on server
- ✅ Secure webhook verification
- ✅ Payment intent validation

### Data Protection
- ✅ Environment variables for sensitive data
- ✅ Secure API endpoints
- ✅ Authentication required
- ✅ Rate limiting (implement if needed)

## 🌍 Regional Payment Support

### Global
- **Stripe**: Credit/Debit cards worldwide
- **PayPal**: 200+ countries

### India
- **Razorpay**: UPI, Cards, Netbanking, Wallets

### Africa
- **Flutterwave**: Mobile Money, Cards, Bank Transfer
- **Paystack**: Cards, Bank Transfer, USSD

## 📊 Payment Flow

### 1. User Selects Plan
```
/subscription → Select plan → /checkout?plan=premium_monthly
```

### 2. Payment Gateway Selection
```
User chooses: Stripe | PayPal | Razorpay | Flutterwave | Paystack
```

### 3. Payment Processing
```
Client → Create Payment Intent → Server
Server → Payment Gateway → Payment Created
Client → Collect Payment Details → User
User → Confirm Payment → Gateway
Gateway → Verify Payment → Server
Server → Update Subscription → Database
Client → Redirect to Success Page
```

### 4. Subscription Activation
```
Payment Verified → User subscription updated → Access granted
```

## 🔄 Webhook Setup

### Stripe Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

### Testing Webhooks Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/payment/webhook/stripe

# Test webhook
stripe trigger payment_intent.succeeded
```

## 📱 Mobile Integration

### React Native (Future)
All payment gateways support mobile SDKs:
- Stripe: `@stripe/stripe-react-native`
- PayPal: `react-native-paypal`
- Razorpay: `react-native-razorpay`

## 🐛 Troubleshooting

### Payment Not Processing
1. Check API keys are correct
2. Verify environment variables loaded
3. Check network tab for errors
4. Verify payment gateway is in test mode

### Webhook Not Receiving Events
1. Verify webhook URL is correct
2. Check webhook secret matches
3. Test with Stripe CLI
4. Check server logs

### TMDB API Not Working
1. Verify API key is valid
2. Check rate limits (40 requests per 10 seconds)
3. Ensure proper error handling

## 📈 Going to Production

### Checklist
- [ ] Switch all gateways to live mode
- [ ] Update API keys to production keys
- [ ] Set up production webhooks
- [ ] Enable HTTPS
- [ ] Test all payment flows
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Set up backup payment methods
- [ ] Test subscription renewals
- [ ] Verify email notifications

### Environment Variables
```env
NODE_ENV=production
PAYPAL_MODE=live
# Use live API keys for all gateways
```

## 💰 Pricing Strategy

### Recommended
- **Free Trial**: 7-14 days
- **Monthly Plans**: For flexibility
- **Yearly Plans**: 15-20% discount
- **Family Plans**: Multiple devices
- **Student Discount**: 50% off

## 📞 Support

### Payment Issues
- Stripe: https://support.stripe.com/
- PayPal: https://www.paypal.com/support/
- Razorpay: https://razorpay.com/support/
- Flutterwave: https://flutterwave.com/support/
- Paystack: https://paystack.com/support/

### TMDB API
- Documentation: https://developers.themoviedb.org/
- Forum: https://www.themoviedb.org/talk

## ✅ Success Indicators

Payment system is working when:
- ✅ Plans load correctly
- ✅ Checkout page opens
- ✅ Payment gateway initializes
- ✅ Test payment succeeds
- ✅ Subscription activates
- ✅ User gets access
- ✅ Payment history shows
- ✅ Webhooks receive events

## 🎉 You're All Set!

Your payment and subscription system is now ready to accept payments from customers worldwide!
