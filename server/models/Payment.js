const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'flutterwave', 'paystack'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  planId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  verificationResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  completedAt: {
    type: Date,
  },
  refundedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
