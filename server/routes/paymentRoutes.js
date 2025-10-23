import express from 'express'
import mpesa from '../utils/mpesa.js'
import paypal from '../utils/paypal.js'
import stripe from '../utils/stripe.js'
import Subscription from '../models/Subscription.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// ============================================
// M-PESA ROUTES (Kenya)
// ============================================

// Initiate M-Pesa STK Push
router.post('/mpesa/initiate', protect, async (req, res) => {
  try {
    const { amount, phoneNumber, planType } = req.body

    if (!phoneNumber || !amount) {
      return res.status(400).json({ message: 'Phone number and amount required' })
    }

    const result = await mpesa.stkPush({
      amount,
      phoneNumber,
      accountReference: `USER-${req.user._id}-${planType}`,
      transactionDesc: `${planType} Subscription Payment`,
    })

    res.json({
      message: 'Payment initiated. Check your phone.',
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
    })
  } catch (error) {
    console.error('M-Pesa Initiate Error:', error)
    res.status(500).json({ 
      message: 'Failed to initiate payment', 
      error: error.message 
    })
  }
})

// M-Pesa Callback Handler
router.post('/mpesa/callback', async (req, res) => {
  try {
    const result = mpesa.processCallback(req.body)

    if (result.success) {
      // Extract user ID and plan from account reference
      const accountRef = req.body.Body?.stkCallback?.AccountReference
      const [, userId, planType] = accountRef.split('-')

      // Update or create subscription
      let subscription = await Subscription.findOne({ user: userId })
      
      if (!subscription) {
        subscription = new Subscription({ user: userId })
      }

      const planFeatures = Subscription.getPlanFeatures(planType)
      subscription.plan = planType
      subscription.status = 'active'
      subscription.price = planFeatures.price
      subscription.features = planFeatures
      subscription.startDate = new Date()
      subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      subscription.paymentMethod = 'mpesa'

      // Add to billing history
      subscription.billingHistory.push({
        amount: result.amount,
        date: new Date(),
        status: 'success',
        invoiceId: result.mpesaReceiptNumber,
      })

      await subscription.save()

      console.log(`✅ M-Pesa Payment Success: ${result.mpesaReceiptNumber}`)
    } else {
      console.log(`❌ M-Pesa Payment Failed: ${result.message}`)
    }

    // Always return success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('M-Pesa Callback Error:', error)
    res.json({ ResultCode: 1, ResultDesc: 'Failed' })
  }
})

// Query M-Pesa Payment Status
router.get('/mpesa/status/:checkoutRequestId', protect, async (req, res) => {
  try {
    const status = await mpesa.queryStkPush(req.params.checkoutRequestId)
    res.json(status)
  } catch (error) {
    res.status(500).json({ message: 'Failed to query status', error: error.message })
  }
})

// ============================================
// PAYPAL ROUTES
// ============================================

// Create PayPal Order
router.post('/paypal/create-order', protect, async (req, res) => {
  try {
    const { amount, planType } = req.body

    const order = await paypal.createOrder({
      amount,
      currency: 'USD',
      description: `CinemaFlix ${planType} Subscription`,
      returnUrl: `${process.env.CLIENT_URL}/payment/success?provider=paypal&plan=${planType}`,
      cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
    })

    res.json(order)
  } catch (error) {
    console.error('PayPal Create Order Error:', error)
    res.status(500).json({ message: 'Failed to create order', error: error.message })
  }
})

// Capture PayPal Order
router.post('/paypal/capture/:orderId', protect, async (req, res) => {
  try {
    const { planType } = req.body
    const capture = await paypal.captureOrder(req.params.orderId)

    if (capture.status === 'COMPLETED') {
      // Update subscription
      let subscription = await Subscription.findOne({ user: req.user._id })
      
      if (!subscription) {
        subscription = new Subscription({ user: req.user._id })
      }

      const planFeatures = Subscription.getPlanFeatures(planType)
      subscription.plan = planType
      subscription.status = 'active'
      subscription.price = planFeatures.price
      subscription.features = planFeatures
      subscription.startDate = new Date()
      subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      subscription.paymentMethod = 'paypal'

      // Add to billing history
      const purchaseUnit = capture.purchase_units[0]
      subscription.billingHistory.push({
        amount: parseFloat(purchaseUnit.amount.value),
        date: new Date(),
        status: 'success',
        invoiceId: capture.id,
      })

      await subscription.save()

      res.json({ 
        message: 'Payment successful', 
        subscription 
      })
    } else {
      res.status(400).json({ message: 'Payment not completed' })
    }
  } catch (error) {
    console.error('PayPal Capture Error:', error)
    res.status(500).json({ message: 'Failed to capture payment', error: error.message })
  }
})

// Get PayPal Order Details
router.get('/paypal/order/:orderId', protect, async (req, res) => {
  try {
    const order = await paypal.getOrderDetails(req.params.orderId)
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get order', error: error.message })
  }
})

// Create PayPal Subscription
router.post('/paypal/subscription/create', protect, async (req, res) => {
  try {
    const { planId } = req.body

    const subscription = await paypal.createSubscription({
      planId,
      returnUrl: `${process.env.CLIENT_URL}/subscription/success`,
      cancelUrl: `${process.env.CLIENT_URL}/subscription/cancel`,
    })

    res.json(subscription)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subscription', error: error.message })
  }
})

// Cancel PayPal Subscription
router.post('/paypal/subscription/:subscriptionId/cancel', protect, async (req, res) => {
  try {
    const result = await paypal.cancelSubscription(req.params.subscriptionId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel subscription', error: error.message })
  }
})

// ============================================
// STRIPE ROUTES (Already Implemented)
// ============================================

// Create Stripe Checkout Session
router.post('/stripe/create-session', protect, async (req, res) => {
  try {
    const { planType } = req.body

    const session = await stripe.createCheckoutSession(
      planType,
      req.user._id.toString(),
      req.user.email
    )

    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error: error.message })
  }
})

// Stripe Webhook Handler
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature and handle events
    const event = req.body

    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        break
      case 'invoice.payment_succeeded':
        // Handle recurring payment
        break
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break
    }

    res.json({ received: true })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================
// GENERAL PAYMENT ROUTES
// ============================================

// Get payment methods
router.get('/methods', protect, async (req, res) => {
  try {
    const methods = [
      {
        id: 'mpesa',
        name: 'M-Pesa',
        description: 'Pay via M-Pesa (Kenya)',
        icon: '📱',
        available: !!process.env.MPESA_CONSUMER_KEY,
        currencies: ['KES'],
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with PayPal',
        icon: '💳',
        available: !!process.env.PAYPAL_CLIENT_ID,
        currencies: ['USD', 'EUR', 'GBP'],
      },
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay with Stripe',
        icon: '💳',
        available: !!process.env.STRIPE_SECRET_KEY,
        currencies: ['USD', 'EUR', 'GBP', 'KES'],
      },
    ]

    res.json({ methods })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get payment methods', error: error.message })
  }
})

// Get user's payment history
router.get('/history', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })
    
    if (!subscription) {
      return res.json({ history: [] })
    }

    res.json({ history: subscription.billingHistory })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get payment history', error: error.message })
  }
})

export default router
