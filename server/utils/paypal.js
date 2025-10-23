// PayPal Payment Integration
// Documentation: https://developer.paypal.com/docs/api/overview/

import axios from 'axios'

const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  apiUrl: process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com',
}

/**
 * Get PayPal Access Token
 */
export const getAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`
    ).toString('base64')

    const response = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error) {
    console.error('PayPal Auth Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Create PayPal Order
 */
export const createOrder = async ({ amount, currency = 'USD', description, returnUrl, cancelUrl }) => {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'CinemaFlix',
          user_action: 'PAY_NOW',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PayPal Create Order Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Capture PayPal Order
 */
export const captureOrder = async (orderId) => {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PayPal Capture Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Get Order Details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.get(
      `${PAYPAL_CONFIG.apiUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PayPal Get Order Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Create PayPal Subscription Plan
 */
export const createSubscriptionPlan = async ({ name, description, price, interval = 'MONTH' }) => {
  try {
    const accessToken = await getAccessToken()

    // First create product
    const productResponse = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v1/catalogs/products`,
      {
        name,
        description,
        type: 'SERVICE',
        category: 'SOFTWARE',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const productId = productResponse.data.id

    // Then create subscription plan
    const planResponse = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v1/billing/plans`,
      {
        product_id: productId,
        name,
        description,
        billing_cycles: [{
          frequency: {
            interval_unit: interval,
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: price.toFixed(2),
              currency_code: 'USD',
            },
          },
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return planResponse.data
  } catch (error) {
    console.error('PayPal Create Plan Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Create PayPal Subscription
 */
export const createSubscription = async ({ planId, returnUrl, cancelUrl }) => {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v1/billing/subscriptions`,
      {
        plan_id: planId,
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'CinemaFlix',
          user_action: 'SUBSCRIBE_NOW',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PayPal Create Subscription Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Cancel PayPal Subscription
 */
export const cancelSubscription = async (subscriptionId, reason = 'User requested cancellation') => {
  try {
    const accessToken = await getAccessToken()

    await axios.post(
      `${PAYPAL_CONFIG.apiUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return { success: true, message: 'Subscription cancelled' }
  } catch (error) {
    console.error('PayPal Cancel Subscription Error:', error.response?.data || error.message)
    throw error
  }
}

export default {
  createOrder,
  captureOrder,
  getOrderDetails,
  createSubscriptionPlan,
  createSubscription,
  cancelSubscription,
  getAccessToken,
}
