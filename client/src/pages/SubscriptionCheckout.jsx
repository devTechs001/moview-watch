import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Shield, Check, Loader2, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const SubscriptionCheckout = () => {
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedGateway, setSelectedGateway] = useState('stripe')
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/payment/plans')
      setPlans(response.data.plans)
      
      if (planId) {
        const plan = response.data.plans.find(p => p.id === planId)
        setSelectedPlan(plan)
      }
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const paymentGateways = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
      available: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '💳',
      description: 'Pay with PayPal account',
      available: true,
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      icon: '🇮🇳',
      description: 'UPI, Cards, Netbanking',
      available: true,
      region: 'India',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: '🌍',
      description: 'Mobile Money, Cards',
      available: true,
      region: 'Africa',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: '🌍',
      description: 'Cards, Bank Transfer',
      available: true,
      region: 'Africa',
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
                {selectedGateway === 'stripe' && (
                  <StripePaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'paypal' && (
                  <PayPalPaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'razorpay' && (
                  <RazorpayPaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'flutterwave' && (
                  <FlutterwavePaymentForm plan={selectedPlan} />
                )}

                {selectedGateway === 'paystack' && (
                  <PaystackPaymentForm plan={selectedPlan} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Stripe Payment Form Component
const StripePaymentForm = ({ plan }) => {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post('/payment/create', {
        gateway: 'stripe',
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency.toLowerCase(),
      })
      setClientSecret(response.data.payment.clientSecret)
    } catch (error) {
      toast.error('Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm clientSecret={clientSecret} />
    </Elements>
  )
}

const StripeCheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message)
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!')
        navigate('/payment/success')
      }
    } catch (error) {
      toast.error('Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Pay Securely
          </>
        )}
      </Button>
    </form>
  )
}

// Placeholder components for other payment gateways
const PayPalPaymentForm = ({ plan }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">PayPal integration coming soon</p>
    <Button onClick={() => toast('PayPal payment will be available soon', { icon: '💳' })}>
      Continue with PayPal
    </Button>
  </div>
)

const RazorpayPaymentForm = ({ plan }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">Razorpay integration coming soon</p>
    <Button onClick={() => toast('Razorpay payment will be available soon', { icon: '🇮🇳' })}>
      Continue with Razorpay
    </Button>
  </div>
)

const FlutterwavePaymentForm = ({ plan }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">Flutterwave integration coming soon</p>
    <Button onClick={() => toast('Flutterwave payment will be available soon', { icon: '🌍' })}>
      Continue with Flutterwave
    </Button>
  </div>
)

const PaystackPaymentForm = ({ plan }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">Paystack integration coming soon</p>
    <Button onClick={() => toast('Paystack payment will be available soon', { icon: '🌍' })}>
      Continue with Paystack
    </Button>
  </div>
)

export default SubscriptionCheckout
