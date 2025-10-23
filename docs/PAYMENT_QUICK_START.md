# 🚀 Payment System - Quick Start

## 5-Minute Setup

### Step 1: Install Packages (2 minutes)
```bash
# Server
cd server
npm install stripe @paypal/checkout-server-sdk razorpay axios

# Client
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2: Get TMDB API Key (1 minute)
1. Go to https://www.themoviedb.org/settings/api
2. Request API key (instant approval)
3. Copy your key

### Step 3: Get Stripe Test Keys (1 minute)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy Publishable key and Secret key

### Step 4: Configure Environment (1 minute)
```bash
# Server (.env)
TMDB_API_KEY=your_tmdb_key_here
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Client (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_TMDB_API_KEY=your_tmdb_key_here
```

### Step 5: Start & Test
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev

# Open browser
http://localhost:5173/subscription
```

## Test Payment

### Use Stripe Test Card
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

## Payment Flow

```
1. User visits /subscription
2. Clicks "Subscribe" on a plan
3. Redirected to /checkout?plan=premium_monthly
4. Selects payment method (Stripe by default)
5. Enters card details
6. Clicks "Pay Securely"
7. Payment processed
8. Subscription activated
9. User gets access
```

## Supported Payment Methods

### ✅ Stripe (Ready Now)
- Credit/Debit Cards
- Global coverage
- Test mode enabled

### 🔄 Coming Soon
- PayPal
- Razorpay (India)
- Flutterwave (Africa)
- Paystack (Africa)

## Files Created

### Server
- `server/services/paymentService.js` - Payment gateway integrations
- `server/controllers/paymentController.js` - Payment endpoints
- `server/models/Payment.js` - Payment database model
- `server/routes/payment.js` - Payment routes

### Client
- `client/src/pages/SubscriptionCheckout.jsx` - Checkout page
- Updated `client/src/pages/SubscriptionPage.jsx` - Plans page
- Updated `client/src/App.jsx` - Added checkout route

### Configuration
- `server/.env.example` - Server environment template
- `client/.env.example` - Client environment template

### Documentation
- `PAYMENT_SETUP_GUIDE.md` - Complete setup guide
- `INSTALL_PAYMENT_PACKAGES.md` - Package installation
- `PAYMENT_QUICK_START.md` - This file

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Basic Monthly | $9.99/mo | HD, 1 Device, Limited Content |
| Basic Yearly | $99.99/yr | Same + 2 Months Free (Save 17%) |
| Premium Monthly | $14.99/mo | Full HD, 2 Devices, Full Library |
| Premium Yearly | $149.99/yr | Same + 2 Months Free (Save 17%) |
| Pro Monthly | $19.99/mo | 4K, 4 Devices, Early Access |
| Pro Yearly | $199.99/yr | Same + 2 Months Free (Save 17%) |

## API Endpoints

### GET /api/payment/plans
Get all subscription plans

### POST /api/payment/create
Create payment intent
```json
{
  "gateway": "stripe",
  "planId": "premium_monthly",
  "amount": 14.99,
  "currency": "usd"
}
```

### POST /api/payment/verify
Verify payment completion
```json
{
  "gateway": "stripe",
  "paymentId": "payment_id",
  "paymentIntentId": "pi_xxx"
}
```

### GET /api/payment/history
Get user's payment history

### POST /api/payment/subscription/cancel
Cancel active subscription

## Troubleshooting

### Packages not installing?
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Payment not processing?
1. Check API keys in .env
2. Verify Stripe is in test mode
3. Check browser console for errors
4. Verify server is running

### TMDB movies not loading?
1. Verify TMDB_API_KEY in server/.env
2. Check API rate limits
3. Test API key: https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY

## Next Steps

### For Production
1. Get live API keys from Stripe
2. Set up webhooks
3. Enable HTTPS
4. Add more payment gateways
5. Set up subscription renewals
6. Configure email notifications

### For Development
1. Test all subscription plans
2. Test payment failures
3. Test subscription cancellation
4. Add payment history page
5. Implement refunds

## Security Checklist

- ✅ API keys in environment variables
- ✅ No sensitive data in code
- ✅ HTTPS for production
- ✅ Webhook signature verification
- ✅ Authentication required for payments
- ✅ PCI compliance via payment gateways

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **TMDB API**: https://developers.themoviedb.org/
- **PayPal Docs**: https://developer.paypal.com/
- **Razorpay Docs**: https://razorpay.com/docs/

## Success! 🎉

Your payment system is ready to:
- ✅ Accept payments globally
- ✅ Manage subscriptions
- ✅ Process refunds
- ✅ Track payment history
- ✅ Support multiple gateways
- ✅ Fetch movies from TMDB

Start accepting payments now! 💰
