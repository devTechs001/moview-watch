import { useState, useEffect } from 'react'
import { Check, Crown, Star, Zap, CreditCard, Calendar, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      // Try new payment endpoint first
      const response = await axios.get('/payment/plans')
      setPlans(response.data.plans)
    } catch (error) {
      // Fallback to old endpoint
      try {
        const response = await axios.get('/subscriptions/plans')
        setPlans(response.data.plans)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load plans')
      }
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axios.get('/subscriptions/my-subscription')
      setCurrentSubscription(response.data.subscription)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (planId) => {
    // Navigate to checkout page with selected plan
    navigate(`/checkout?plan=${planId}`)
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      const response = await axios.post('/subscriptions/cancel')
      toast.success(response.data.message)
      await fetchCurrentSubscription()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription')
    }
  }

  const getPlanIcon = (planId) => {
    const icons = {
      free: <Zap className="w-8 h-8 text-gray-400" />,
      basic: <Star className="w-8 h-8 text-blue-500" />,
      premium: <Crown className="w-8 h-8 text-purple-500" />,
      vip: <Crown className="w-8 h-8 text-yellow-500" />,
    }
    return icons[planId] || icons.free
  }

  const getPlanColor = (planId) => {
    const colors = {
      free: 'border-gray-400',
      basic: 'border-blue-500',
      premium: 'border-purple-500',
      vip: 'border-yellow-500',
    }
    return colors[planId] || colors.free
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Unlock premium features and enjoy unlimited entertainment
          </p>
        </div>

        {/* Current Subscription Card */}
        {currentSubscription && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Your Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold capitalize">{currentSubscription.plan}</p>
                  <p className="text-muted-foreground">Status: {currentSubscription.status}</p>
                  {currentSubscription.endDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {currentSubscription.plan !== 'free' && currentSubscription.status === 'active' && (
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                currentSubscription?.plan === plan.id
                  ? `border-2 ${getPlanColor(plan.id)}`
                  : ''
              } ${plan.id === 'premium' ? 'lg:scale-105' : ''}`}
            >
              {plan.id === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{getPlanIcon(plan.id)}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={currentSubscription?.plan === plan.id ? 'outline' : 'default'}
                  disabled={currentSubscription?.plan === plan.id || loading}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {currentSubscription?.plan === plan.id
                    ? 'Current Plan'
                    : plan.id === 'free'
                    ? 'Downgrade'
                    : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Compare All Features</CardTitle>
            <CardDescription>See what's included in each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Basic</th>
                    <th className="text-center py-3 px-4">Premium</th>
                    <th className="text-center py-3 px-4">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Max Watchlist</td>
                    <td className="text-center py-3 px-4">10</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">100</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Video Quality</td>
                    <td className="text-center py-3 px-4">SD</td>
                    <td className="text-center py-3 px-4">HD</td>
                    <td className="text-center py-3 px-4">Ultra HD</td>
                    <td className="text-center py-3 px-4">Ultra HD</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Ads</td>
                    <td className="text-center py-3 px-4">With Ads</td>
                    <td className="text-center py-3 px-4">Ad-Free</td>
                    <td className="text-center py-3 px-4">Ad-Free</td>
                    <td className="text-center py-3 px-4">Ad-Free</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Simultaneous Devices</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">2</td>
                    <td className="text-center py-3 px-4">4</td>
                    <td className="text-center py-3 px-4">6</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Downloads</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Offline Viewing</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Priority Support</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✗</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default SubscriptionPage
