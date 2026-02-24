const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  // Content type
  type: {
    type: String,
    enum: ['meditation', 'breathing', 'relaxation', 'exercise', 'article', 'video', 'audio', 'guide'],
    required: true
  },
  category: {
    type: String,
    enum: ['stress', 'anxiety', 'depression', 'sleep', 'focus', 'mindfulness', 'self-care', 'general'],
    default: 'general'
  },
  // Media
  mediaType: {
    type: String,
    enum: ['audio', 'video', 'text', 'image', 'pdf'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  // Duration for audio/video
  duration: {
    type: Number, // in seconds
    default: null
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Content language (for display purposes only, not for text indexing)
  contentLanguage: {
    type: String,
    default: 'vi' // Vietnamese
  },
  // Tags for search
  tags: [{
    type: String
  }],
  // Author/Creator
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  // Publishing
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledPublishAt: Date,
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // Rating
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Premium content
  isPremium: {
    type: Boolean,
    default: false
  },
  // Version control for updates
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    mediaUrl: String,
    updatedAt: Date,
    version: Number
  }],
  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Order for sorting
  order: {
    type: Number,
    default: 0
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
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { default_language: 'none', language_override: 'dummy' }
);

module.exports = mongoose.model('Content', contentSchema);
