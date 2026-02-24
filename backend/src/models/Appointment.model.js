const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerType: {
      type: String,
      enum: ["doctor", "healer"],
      required: true,
    },
    // Appointment details
    appointmentType: {
      type: String,
      enum: ["online", "in-person"],
      default: "online",
    },
    sessionType: {
      type: String,
      enum: ["consultation", "therapy", "follow-up", "chat", "call"],
      default: "consultation",
    },
    // Scheduling
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    // Reason and notes
    reasonForVisit: {
      type: String,
      default: null,
    },
    patientNotes: {
      type: String,
      default: null,
    },
    // Provider's consultation notes
    consultationNotes: {
      diagnosis: String,
      treatment: String,
      prescription: String,
      followUpInstructions: String,
      updatedAt: Date,
    },
    // Recommendations/Homework
    recommendations: [
      {
        type: {
          type: String,
          enum: ["text", "checklist", "file", "link", "survey"],
        },
        title: String,
        description: String,
        fileUrl: String,
        link: String,
        dueDate: Date,
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Payment
    fee: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    // Rating after session
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      ratedAt: Date,
    },
    // Cancellation
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: Date,
    // Meeting link for online sessions
    meetingLink: String,
    // Reminder settings
    reminderSent: {
      type: Boolean,
      default: false,
    },
    // Timestamps
    confirmedAt: Date,
    completedAt: Date,
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

// Indexes
appointmentSchema.index({ patient: 1, scheduledDate: -1 });
appointmentSchema.index({ provider: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ isPaid: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
