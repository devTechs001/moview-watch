// Stripe Payment Integration Helper
// To use Stripe, you'll need to:
// 1. Install: npm install stripe
// 2. Add STRIPE_SECRET_KEY to your .env file
// 3. Get your keys from: https://dashboard.stripe.com/apikeys

import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null

/**
 * Create a Stripe customer
 */
export const createCustomer = async (email, name) => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Create a subscription
 */
export const createSubscription = async (customerId, priceId) => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })
    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Create a payment intent
 */
export const createPaymentIntent = async (amount, currency = 'usd') => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

/**
 * Retrieve subscription
 */
export const getSubscription = async (subscriptionId) => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

/**
 * Create a checkout session (one-time payment or subscription)
 */
export const createCheckoutSession = async (planType, userId, userEmail) => {
  if (!stripe) {
    console.warn('Stripe not configured')
    return null
  }

  const priceIds = {
    basic: 'price_1234567890', // Replace with your Stripe Price IDs
    premium: 'price_0987654321',
    vip: 'price_1122334455',
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceIds[planType],
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/subscription?canceled=true`,
      metadata: {
        userId,
        planType,
      },
    })
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export default stripe
