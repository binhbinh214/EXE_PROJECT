const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Report type
  type: {
    type: String,
    enum: ['technical', 'payment', 'behavioral', 'harassment', 'content', 'other'],
    required: true
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Subject/Title
  subject: {
    type: String,
    required: true,
    trim: true
  },
  // Description
  description: {
    type: String,
    required: true
  },
  // Related entities
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  relatedContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  // Attachments (screenshots, files)
  attachments: [{
    url: String,
    name: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'dismissed', 'escalated'],
    default: 'open'
  },
  // Resolution
  resolution: {
    notes: String,
    action: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  // Assigned admin
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Communication history
  communications: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Anonymous report
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ type: 1 });

module.exports = mongoose.model('Report', reportSchema);
