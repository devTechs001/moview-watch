import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Shield, Check, Loader2, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
// No external payment library imports needed - using native integrations

const SubscriptionCheckout = () => {
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedGateway, setSelectedGateway] = useState('mpesa')
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/payments/plans')
      setPlans(response.data.plans)
      
      if (planId) {
        const plan = response.data.plans.find(p => p.id === planId)
        setSelectedPlan(plan)
      }
    } catch (error) {
      // Fallback plans if API fails
      const fallbackPlans = [
        {
          id: 'basic',
          name: 'Basic',
          price: 9.99,
          description: 'HD streaming',
          features: ['HD Quality', '1 Device', 'Limited Content', 'Ads Supported']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 14.99,
          description: 'Full HD streaming',
          features: ['Full HD Quality', '2 Devices', 'Full Content Library', 'Ad-Free', 'Download Content']
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 19.99,
          description: 'Ultimate experience',
          features: ['4K Ultra HD', '4 Devices', 'Full Content Library', 'Ad-Free', 'Download Content', 'Early Access', 'Priority Support']
        }
      ]
      setPlans(fallbackPlans)
      
      if (planId) {
        const plan = fallbackPlans.find(p => p.id === planId)
        setSelectedPlan(plan)
      }
      toast.error('Failed to load plans from server, using default plans')
    } finally {
      setLoading(false)
    }
  }

  const paymentGateways = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      description: 'Lipa na M-Pesa',
      available: true,
      region: 'Kenya',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: '🌍',
      description: 'Mobile Money, Cards, Bank',
      available: true,
      region: 'Africa',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: '💳',
      description: 'Cards, Bank Transfer, USSD',
      available: true,
      region: 'Africa',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🌐',
      description: 'International payments',
      available: true,
      region: 'Global',
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (!selectedPlan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/subscription')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">No Plan Selected</h2>
              <p className="text-muted-foreground mb-6">Please select a subscription plan to continue</p>
              <Button onClick={() => navigate('/subscription')}>View Plans</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/subscription')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Secure checkout powered by industry-leading payment providers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card elevated className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-primary rounded-xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Plan</span>
                    {selectedPlan.popular && (
                      <span className="badge bg-white/20 text-white text-xs">Popular</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{selectedPlan.name}</h3>
                  <p className="text-3xl font-bold">
                    ${selectedPlan.price}
                    <span className="text-sm font-normal opacity-90">/{selectedPlan.interval}</span>
                  </p>
                  {selectedPlan.savings && (
                    <div className="mt-2 text-sm bg-white/20 rounded px-2 py-1 inline-block">
                      Save {selectedPlan.savings}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold mb-3">Included Features:</h4>
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl text-primary">${selectedPlan.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure payment with 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Selection */}
          <div className="lg:col-span-2">
            <Card elevated>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentGateways.map((gateway) => (
                    <button
                      key={gateway.id}
                      onClick={() => setSelectedGateway(gateway.id)}
                      disabled={!gateway.available}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedGateway === gateway.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      } ${!gateway.available && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {typeof gateway.icon === 'string' ? gateway.icon : <gateway.icon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{gateway.name}</h4>
                            {gateway.region && (
                              <span className="badge badge-secondary text-xs">{gateway.region}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{gateway.description}</p>
                        </div>
                        {selectedGateway === gateway.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="divider"></div>

                {/* Payment Form */}
                {selectedGateway === 'mpesa' && (
                  <MpesaPaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'flutterwave' && (
                  <FlutterwavePaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'paystack' && (
                  <PaystackPaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'paypal' && (
                  <PayPalPaymentForm plan={selectedPlan} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// M-Pesa Payment Form Component
const MpesaPaymentForm = ({ plan }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setProcessing(true)

    try {
      const response = await axios.post('/payments/mpesa/initiate', {
        phoneNumber,
        amount: plan.price,
        planId: plan.id,
      })

      setCheckoutRequestId(response.data.checkoutRequestId)
      toast.success('STK push sent! Check your phone to complete payment')

      // Poll for payment status
      pollPaymentStatus(response.data.checkoutRequestId)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  const pollPaymentStatus = async (requestId) => {
    let attempts = 0
    const maxAttempts = 30 // 30 seconds

    const interval = setInterval(async () => {
      attempts++

      try {
        const response = await axios.get(`/payments/mpesa/status/${requestId}`)

        if (response.data.status === 'completed') {
          clearInterval(interval)
          toast.success('Payment successful!')
          navigate('/subscription')
        } else if (response.data.status === 'failed') {
          clearInterval(interval)
          toast.error('Payment failed. Please try again.')
          setProcessing(false)
        }
      } catch (error) {
        console.error('Status check error:', error)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        toast.error('Payment timeout. Please check your transaction status.')
        setProcessing(false)
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          M-Pesa Phone Number
        </label>
        <input
          type="tel"
          placeholder="254712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={processing}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Safaricom number (format: 254XXXXXXXXX)
        </p>
      </div>

      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold">KES {(plan.price * 130).toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ≈ ${plan.price} USD
        </p>
      </div>

      <Button
        type="submit"
        disabled={processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Waiting for payment...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Pay with M-Pesa
          </>
        )}
      </Button>

      {processing && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Check your phone for the M-Pesa prompt</p>
          <p className="mt-1">Enter your M-Pesa PIN to complete payment</p>
        </div>
      )}
    </form>
  )
}

// Flutterwave Payment Form
const FlutterwavePaymentForm = ({ plan }) => {
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  const handlePayment = async () => {
    setProcessing(true)

    try {
      const response = await axios.post('/payments/flutterwave/initiate', {
        amount: plan.price,
        planId: plan.id,
      })

      // Redirect to Flutterwave payment page
      window.location.href = response.data.paymentLink
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Payment Methods Available:</p>
        <ul className="text-sm space-y-1">
          <li>✓ Mobile Money (M-Pesa, MTN, Airtel)</li>
          <li>✓ Credit/Debit Cards</li>
          <li>✓ Bank Transfer</li>
          <li>✓ USSD</li>
        </ul>
      </div>

      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold">${plan.price}</p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Continue to Flutterwave
          </>
        )}
      </Button>
    </div>
  )
}

// Paystack Payment Form
const PaystackPaymentForm = ({ plan }) => {
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handlePayment = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setProcessing(true)

    try {
      const response = await axios.post('/payments/paystack/initiate', {
        email,
        amount: plan.price,
        planId: plan.id,
      })

      // Redirect to Paystack payment page
      window.location.href = response.data.authorizationUrl
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={processing}
        />
      </div>

      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Payment Methods Available:</p>
        <ul className="text-sm space-y-1">
          <li>✓ Credit/Debit Cards</li>
          <li>✓ Bank Transfer</li>
          <li>✓ USSD</li>
          <li>✓ Mobile Money</li>
        </ul>
      </div>

      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold">${plan.price}</p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={processing || !email}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Continue to Paystack
          </>
        )}
      </Button>
    </div>
  )
}

// PayPal Payment Form
const PayPalPaymentForm = ({ plan }) => {
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    setProcessing(true)

    try {
      const response = await axios.post('/payments/paypal/create-order', {
        amount: plan.price,
        planId: plan.id,
      })

      // Redirect to PayPal
      const approvalUrl = response.data.links?.find(link => link.rel === 'approve')?.href
      if (approvalUrl) {
        window.location.href = approvalUrl
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PayPal order')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold">${plan.price}</p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={processing}
        className="w-full bg-[#0070ba] hover:bg-[#003087]"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Continue with PayPal
          </>
        )}
      </Button>
    </div>
  )
}

export default SubscriptionCheckout
