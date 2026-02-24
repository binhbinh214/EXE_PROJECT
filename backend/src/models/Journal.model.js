const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Journal entry
  title: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  },
  // Mood tracking
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'angry', 'stressed', 'calm', 'excited'],
    default: 'neutral'
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Emotion tags
  emotions: [{
    type: String,
    enum: ['happy', 'sad', 'anxious', 'angry', 'fearful', 'surprised', 'disgusted', 'content', 'hopeful', 'grateful', 'lonely', 'overwhelmed', 'peaceful', 'frustrated', 'confused']
  }],
  // Sentiment analysis result (from AI)
  sentimentAnalysis: {
    score: Number, // -1 to 1
    magnitude: Number,
    dominantEmotion: String,
    analyzedAt: Date
  },
  // Activities/triggers
  activities: [{
    type: String
  }],
  triggers: [{
    type: String
  }],
  // Sleep tracking
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  sleepQuality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent']
  },
  sleep: {
    hours: Number,
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    }
  },
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'file']
    },
    url: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Voice note
  voiceNote: {
    url: String,
    duration: Number, // in seconds
    transcription: String
  },
  // Privacy
  isPrivate: {
    type: Boolean,
    default: true
  },
  sharedWithProviders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Weather (optional)
  weather: {
    condition: String,
    temperature: Number
  },
  // Location (optional)
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Entry date (can be different from createdAt)
  entryDate: {
    type: Date,
    default: Date.now
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
journalSchema.index({ user: 1, entryDate: -1 });
journalSchema.index({ user: 1, mood: 1 });
journalSchema.index(
  { content: 'text', title: 'text' },
  { default_language: 'none', language_override: 'dummy' }
);

module.exports = mongoose.model('Journal', journalSchema);
