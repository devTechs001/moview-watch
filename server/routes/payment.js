const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/create', protect, paymentController.createPayment);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/history', protect, paymentController.getPaymentHistory);
router.get('/plans', paymentController.getSubscriptionPlans);
router.post('/subscription/cancel', protect, paymentController.cancelSubscription);

// Webhook routes (no auth required)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;
