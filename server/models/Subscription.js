import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'vip'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  price: {
    type: Number,
    default: 0,
  },
  features: {
    maxWatchlist: {
      type: Number,
      default: 10,
    },
    hdQuality: {
      type: Boolean,
      default: false,
    },
    downloadAccess: {
      type: Boolean,
      default: false,
    },
    adFree: {
      type: Boolean,
      default: false,
    },
    multipleDevices: {
      type: Number,
      default: 1,
    },
    offlineViewing: {
      type: Boolean,
      default: false,
    },
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'credit_card', 'none'],
    default: 'none',
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  autoRenew: {
    type: Boolean,
    default: true,
  },
  billingHistory: [{
    amount: Number,
    date: Date,
    status: String,
    invoiceId: String,
  }],
}, {
  timestamps: true,
})

// Update subscription status when endDate passes
subscriptionSchema.methods.checkExpiry = function() {
  if (this.endDate && new Date() > this.endDate) {
    this.status = 'expired'
    this.plan = 'free'
    return this.save()
  }
  return Promise.resolve(this)
}

// Get plan features
subscriptionSchema.statics.getPlanFeatures = function(planType) {
  const plans = {
    free: {
      price: 0,
      maxWatchlist: 10,
      hdQuality: false,
      downloadAccess: false,
      adFree: false,
      multipleDevices: 1,
      offlineViewing: false,
    },
    basic: {
      price: 9.99,
      maxWatchlist: 50,
      hdQuality: true,
      downloadAccess: false,
      adFree: true,
      multipleDevices: 2,
      offlineViewing: false,
    },
    premium: {
      price: 14.99,
      maxWatchlist: 100,
      hdQuality: true,
      downloadAccess: true,
      adFree: true,
      multipleDevices: 4,
      offlineViewing: true,
    },
    vip: {
      price: 19.99,
      maxWatchlist: -1, // unlimited
      hdQuality: true,
      downloadAccess: true,
      adFree: true,
      multipleDevices: 6,
      offlineViewing: true,
    },
  }
  return plans[planType] || plans.free
}

const Subscription = mongoose.model('Subscription', subscriptionSchema)
export default Subscription
