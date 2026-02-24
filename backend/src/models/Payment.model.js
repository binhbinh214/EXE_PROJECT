const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Payment type
    type: {
      type: String,
      enum: [
        "deposit",
        "appointment",
        "session",
        "refund",
        "payout",
        "subscription",
      ],
      required: true,
    },
    // Transaction type for better categorization
    transactionType: {
      type: String,
      enum: ["deposit", "appointment", "refund", "withdrawal", "commission"],
      required: true,
    },
    // Related entities
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Amount
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
    },
    // Platform fee (10%)
    platformFee: {
      type: Number,
      default: 0,
    },
    // Amount provider receives (amount - platformFee)
    providerAmount: {
      type: Number,
      default: 0,
    },
    // Payment method
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "vnpay", "momo", "bank_transfer", "wallet"],
      default: "wallet",
    },
    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },
    // External payment info
    externalPaymentId: String,
    externalPaymentMethod: String,
    // Transaction details
    transactionId: {
      type: String,
      unique: true,
    },
    description: String,
    // Discount
    discountCode: String,
    discountAmount: {
      type: Number,
      default: 0,
    },
    // Final amount after discount
    finalAmount: {
      type: Number,
      required: true,
    },
    // For refunds
    refundReason: String,
    refundedAt: Date,
    originalPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    // IP and device info for security
    ipAddress: String,
    userAgent: String,
    // Timestamps
    processedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate transaction ID before save
paymentSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }
  next();
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ appointment: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
