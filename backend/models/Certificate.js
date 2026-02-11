import mongoose from 'mongoose';

/**
 * Certificate Schema
 * Stores certificate information and hash for verification
 */
const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    certificateType: {
      type: String,
      enum: ['marksheet', 'hackathon', 'sports', 'general'],
      default: 'general',
      required: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    status: {
      type: String,
      enum: ['Valid', 'Revoked'],
      default: 'Valid',
    },
    hashValue: {
      type: String,
      required: [true, 'Hash value is required'],
    },
    // Additional fields for different certificate types
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Index for faster certificate lookup
 */
certificateSchema.index({ certificateId: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;

