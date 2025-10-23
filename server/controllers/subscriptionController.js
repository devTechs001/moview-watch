import Subscription from '../models/Subscription.js'
import User from '../models/User.js'

// Get user's subscription
export const getSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id })
    
    if (!subscription) {
      // Create free subscription for user if none exists
      subscription = await Subscription.create({
        user: req.user._id,
        plan: 'free',
        status: 'active',
        features: Subscription.getPlanFeatures('free'),
      })
    }

    // Check if subscription has expired
    await subscription.checkExpiry()

    res.json({ subscription })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscription', error: error.message })
  }
}

// Get all available plans
export const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic access to movies',
        ...Subscription.getPlanFeatures('free'),
        features: [
          'Watch up to 10 movies',
          'Standard definition',
          'Ads supported',
          '1 device at a time',
        ],
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'Enhanced viewing experience',
        ...Subscription.getPlanFeatures('basic'),
        features: [
          'Watch up to 50 movies',
          'HD quality',
          'Ad-free experience',
          '2 devices simultaneously',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Premium features and benefits',
        ...Subscription.getPlanFeatures('premium'),
        features: [
          'Watch up to 100 movies',
          'Ultra HD quality',
          'Download for offline viewing',
          'Ad-free experience',
          '4 devices simultaneously',
        ],
      },
      {
        id: 'vip',
        name: 'VIP',
        description: 'Ultimate movie experience',
        ...Subscription.getPlanFeatures('vip'),
        features: [
          'Unlimited movies',
          'Ultra HD quality',
          'Download for offline viewing',
          'Ad-free experience',
          '6 devices simultaneously',
          'Early access to new releases',
          'Priority customer support',
        ],
      },
    ]

    res.json({ plans })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get plans', error: error.message })
  }
}

// Subscribe to a plan
export const subscribe = async (req, res) => {
  try {
    const { planType, paymentMethod } = req.body

    if (!['free', 'basic', 'premium', 'vip'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' })
    }

    let subscription = await Subscription.findOne({ user: req.user._id })
    const planFeatures = Subscription.getPlanFeatures(planType)

    if (!subscription) {
      subscription = new Subscription({
        user: req.user._id,
      })
    }

    // Calculate end date (30 days from now for paid plans)
    const endDate = planType !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      : null

    subscription.plan = planType
    subscription.status = 'active'
    subscription.startDate = new Date()
    subscription.endDate = endDate
    subscription.price = planFeatures.price
    subscription.features = planFeatures
    subscription.paymentMethod = paymentMethod || 'none'

    // Add to billing history if paid
    if (planType !== 'free') {
      subscription.billingHistory.push({
        amount: planFeatures.price,
        date: new Date(),
        status: 'success',
        invoiceId: `INV-${Date.now()}`,
      })
    }

    await subscription.save()

    // Update user subscription reference
    await User.findByIdAndUpdate(req.user._id, {
      subscription: subscription._id,
    })

    res.json({ 
      message: `Successfully subscribed to ${planType} plan`,
      subscription 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to subscribe', error: error.message })
  }
}

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    subscription.status = 'cancelled'
    subscription.autoRenew = false
    // Keep features until end date
    await subscription.save()

    res.json({ 
      message: 'Subscription cancelled. You can continue using your plan until the end date.',
      subscription 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel subscription', error: error.message })
  }
}

// Reactivate subscription
export const reactivateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    if (subscription.status !== 'cancelled') {
      return res.status(400).json({ message: 'Subscription is not cancelled' })
    }

    subscription.status = 'active'
    subscription.autoRenew = true
    await subscription.save()

    res.json({ 
      message: 'Subscription reactivated',
      subscription 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to reactivate subscription', error: error.message })
  }
}

// Get billing history
export const getBillingHistory = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    res.json({ billingHistory: subscription.billingHistory })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get billing history', error: error.message })
  }
}

// Admin: Get all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    const stats = {
      total: subscriptions.length,
      free: subscriptions.filter(s => s.plan === 'free').length,
      basic: subscriptions.filter(s => s.plan === 'basic').length,
      premium: subscriptions.filter(s => s.plan === 'premium').length,
      vip: subscriptions.filter(s => s.plan === 'vip').length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
    }

    res.json({ subscriptions, stats })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscriptions', error: error.message })
  }
}
