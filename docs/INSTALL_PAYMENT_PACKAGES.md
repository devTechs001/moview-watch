# 📦 Payment System - Package Installation Guide

## Required Packages

### Server Dependencies

```bash
cd server
npm install stripe @paypal/checkout-server-sdk razorpay axios
```

**Package Details:**
- `stripe` - Stripe payment gateway SDK
- `@paypal/checkout-server-sdk` - PayPal REST API SDK
- `razorpay` - Razorpay payment gateway for India
- `axios` - HTTP client for Flutterwave and Paystack APIs

### Client Dependencies

```bash
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Package Details:**
- `@stripe/stripe-js` - Stripe.js loader
- `@stripe/react-stripe-js` - React components for Stripe Elements

## Package Versions (Recommended)

### Server (package.json)
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "razorpay": "^2.9.2",
    "axios": "^1.6.0"
  }
}
```

### Client (package.json)
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0"
  }
}
```

## Installation Steps

### 1. Install Server Packages
```bash
cd server
npm install stripe @paypal/checkout-server-sdk razorpay axios
```

### 2. Install Client Packages
```bash
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Verify Installation
```bash
# Server
cd server
npm list stripe @paypal/checkout-server-sdk razorpay

# Client
cd client
npm list @stripe/stripe-js @stripe/react-stripe-js
```

## Optional Packages

### For Enhanced Features

#### Server
```bash
# Webhook signature verification
npm install crypto

# Payment receipt generation
npm install pdfkit

# Email notifications
npm install nodemailer

# Scheduled subscription checks
npm install node-cron
```

#### Client
```bash
# PayPal React integration (when implementing)
npm install @paypal/react-paypal-js

# Razorpay checkout (when implementing)
npm install react-razorpay
```

## Troubleshooting

### Issue: Package installation fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Version conflicts
**Solution:**
```bash
# Use exact versions
npm install stripe@14.0.0 --save-exact
```

### Issue: Peer dependency warnings
**Solution:**
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps
```

## Verification Script

Create a test file to verify packages are working:

### Server Test (server/test-payment.js)
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const Razorpay = require('razorpay');

console.log('✅ Stripe loaded:', typeof stripe);
console.log('✅ PayPal loaded:', typeof paypal);
console.log('✅ Razorpay loaded:', typeof Razorpay);
```

Run test:
```bash
node server/test-payment.js
```

### Client Test
Check in browser console:
```javascript
import { loadStripe } from '@stripe/stripe-js';
console.log('✅ Stripe.js loaded:', typeof loadStripe);
```

## Next Steps

After installation:
1. ✅ Set up environment variables
2. ✅ Configure payment routes
3. ✅ Test payment flow
4. ✅ Set up webhooks

See `PAYMENT_SETUP_GUIDE.md` for complete setup instructions.

## Quick Start Command

Run everything at once:

```bash
# Install all packages
cd server && npm install stripe @paypal/checkout-server-sdk razorpay axios && cd ../client && npm install @stripe/stripe-js @stripe/react-stripe-js && cd ..

echo "✅ All payment packages installed!"
```

## Package Documentation

- **Stripe**: https://stripe.com/docs/api
- **PayPal**: https://developer.paypal.com/docs/api/overview/
- **Razorpay**: https://razorpay.com/docs/api/
- **Flutterwave**: https://developer.flutterwave.com/docs
- **Paystack**: https://paystack.com/docs/api/

## Support

If you encounter issues:
1. Check package versions
2. Verify Node.js version (14+ recommended)
3. Clear npm cache
4. Check for conflicting dependencies
5. Consult package documentation

Happy coding! 🚀
