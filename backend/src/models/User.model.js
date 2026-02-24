const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['guest', 'customer', 'doctor', 'healer', 'admin'],
    default: 'customer'
  },
  // For Doctors and Healers
  specialization: {
    type: String,
    default: null
  },
  qualifications: [{
    type: String
  }],
  licenseNumber: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  // For Healers - chat rate per minute
  chatRatePerMinute: {
    type: Number,
    default: 0
  },
  // Availability schedule
  availability: [{
    dayOfWeek: {
      type: Number, // 0-6 (Sunday-Saturday)
      min: 0,
      max: 6
    },
    startTime: String, // "09:00"
    endTime: String    // "17:00"
  }],
  // Account status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isProfileVerified: {
    type: Boolean,
    default: false // For doctors/healers - admin verification
  },
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // OTP verification
  otp: String,
  otpExpires: Date,
  // Wallet/Balance
  balance: {
    type: Number,
    default: 0
  },
  // Rating
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Consent and agreements
  agreedToTerms: {
    type: Boolean,
    default: false
  },
  agreedToPrivacyPolicy: {
    type: Boolean,
    default: false
  },
  // Timestamps
  lastLogin: Date,
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

// Index for search (using 'none' to support Vietnamese text)
userSchema.index(
  { fullName: 'text', email: 'text', specialization: 'text' },
  { default_language: 'none', language_override: 'dummy' }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (hide sensitive data)
userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
