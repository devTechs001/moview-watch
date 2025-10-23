import { useState, useEffect } from 'react'
import { CreditCard, Smartphone, DollarSign, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')

  const planType = searchParams.get('plan') || 'basic'
  const amount = {
    basic: 9.99,
    premium: 14.99,
    vip: 19.99,
  }[planType]

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/payments/methods')
      setPaymentMethods(response.data.methods.filter(m => m.available))
    } catch (error) {
      console.error(error)
    }
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone) {
      toast.error('Please enter your M-Pesa phone number')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/payments/mpesa/initiate', {
        amount: amount,
        phoneNumber: mpesaPhone,
        planType,
      })

      toast.success(response.data.message)
      
      // Poll for payment status
      const checkoutRequestId = response.data.checkoutRequestId
      setTimeout(() => checkPaymentStatus(checkoutRequestId), 5000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (checkoutRequestId) => {
    try {
      const response = await axios.get(`/payments/mpesa/status/${checkoutRequestId}`)
      
      if (response.data.ResultCode === '0') {
        toast.success('Payment successful!')
        navigate('/subscription')
      } else {
        toast.error('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handlePayPalPayment = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/payments/paypal/create-order', {
        amount,
        planType,
      })

      // Redirect to PayPal
      const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href
      if (approvalUrl) {
        window.location.href = approvalUrl
      }
    } catch (error) {
      toast.error('Failed to create PayPal order')
      setLoading(false)
    }
  }

  const handleStripePayment = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/payments/stripe/create-session', {
        planType,
      })

      // Redirect to Stripe
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error) {
      toast.error('Failed to create Stripe session')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">
            Subscribe to {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - ${amount}/month
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{method.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* Method-specific forms */}
                {selectedMethod === method.id && (
                  <div className="mt-6 pt-6 border-t">
                    {method.id === 'mpesa' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          M-Pesa Phone Number
                        </label>
                        <Input
                          type="tel"
                          placeholder="254712345678"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="mb-4"
                        />
                        <Button
                          onClick={handleMpesaPayment}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? 'Processing...' : `Pay KES ${(amount * 130).toFixed(2)}`}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          You will receive an STK push on your phone
                        </p>
                      </div>
                    )}

                    {method.id === 'paypal' && (
                      <div>
                        <Button
                          onClick={handlePayPalPayment}
                          disabled={loading}
                          className="w-full bg-[#0070ba] hover:bg-[#003087]"
                        >
                          {loading ? 'Processing...' : `Pay $${amount} with PayPal`}
                        </Button>
                      </div>
                    )}

                    {method.id === 'stripe' && (
                      <div>
                        <Button
                          onClick={handleStripePayment}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? 'Processing...' : `Pay $${amount} with Card`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {paymentMethods.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Payment Methods Available</h3>
                <p className="text-muted-foreground">
                  Please contact support to set up payment methods.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Security Notice */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Secure Payment</p>
              <p className="text-sm text-muted-foreground">
                All payments are encrypted and secure. Your payment information is never stored on our servers.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/subscription')}>
            Back to Plans
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default PaymentPage
