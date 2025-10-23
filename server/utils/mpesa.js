// M-Pesa (Safaricom) Payment Integration for Kenya
// Documentation: https://developer.safaricom.co.ke/Documentation

import axios from 'axios'

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passKey: process.env.MPESA_PASS_KEY,
  shortCode: process.env.MPESA_SHORT_CODE || '174379',
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  apiUrl: process.env.MPESA_ENV === 'production' 
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke',
}

/**
 * Get M-Pesa Access Token
 */
export const getAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
    ).toString('base64')

    const response = await axios.get(
      `${MPESA_CONFIG.apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    return response.data.access_token
  } catch (error) {
    console.error('M-Pesa Auth Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 */
export const stkPush = async ({ amount, phoneNumber, accountReference, transactionDesc }) => {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    
    const password = Buffer.from(
      `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passKey}${timestamp}`
    ).toString('base64')

    const response = await axios.post(
      `${MPESA_CONFIG.apiUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: MPESA_CONFIG.shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('M-Pesa STK Push Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Query STK Push Status
 */
export const queryStkPush = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    
    const password = Buffer.from(
      `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passKey}${timestamp}`
    ).toString('base64')

    const response = await axios.post(
      `${MPESA_CONFIG.apiUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('M-Pesa Query Error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Process M-Pesa Callback
 */
export const processCallback = (callbackData) => {
  try {
    const { Body } = callbackData
    const { stkCallback } = Body

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata.Item
      const amount = metadata.find(item => item.Name === 'Amount')?.Value
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value

      return {
        success: true,
        amount,
        mpesaReceiptNumber,
        phoneNumber,
      }
    } else {
      // Payment failed
      return {
        success: false,
        message: stkCallback.ResultDesc,
      }
    }
  } catch (error) {
    console.error('M-Pesa Callback Processing Error:', error)
    throw error
  }
}

export default {
  stkPush,
  queryStkPush,
  processCallback,
  getAccessToken,
}
