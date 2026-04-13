import mongoose from 'mongoose';

/* ─────────────────────────── Sub-schemas ─────────────────────────── */

/**
 * Evaluation Component Sub-schema
 * Represents Theory / Practical / Project / Viva / TW per subject
 */
const evaluationComponentSchema = new mongoose.Schema({
  componentType: { type: String, default: 'Theory' }, // Theory | Practical | Project | Viva | TW
  credits:       { type: Number, min: 0, default: 0 },
  grade:         { type: String, default: '' },        // AA, AB, BB, BC, CC, CD, DD, FF, II / O, A+, A, B+, B, C, P, F
  gradePoint:    { type: Number, min: 0, max: 10, default: 0 },
}, { _id: false });

/**
 * Subject Sub-schema
 * One subject per semester with its evaluation components
 */
const subjectSchema = new mongoose.Schema({
  code:                 { type: String, default: '' },    // Course code e.g. 3130702
  name:                 { type: String, default: '' },    // Course name
  evaluation:           { type: String, default: '' },    // Legacy flat field (Theory/Practical)
  credits:              { type: Number, default: 0 },     // Legacy flat credits
  grade:                { type: String, default: '' },    // Legacy flat grade
  gradePoint:           { type: Number, default: null },  // Computed grade point
  evaluationComponents: { type: [evaluationComponentSchema], default: [] },
}, { _id: false });

/**
 * Backlog Sub-schema
 */
const backlogSchema = new mongoose.Schema({
  courseCode:      { type: String, default: '' },
  subjectName:     { type: String, default: '' },
  componentType:   { type: String, default: 'Theory' },
  grade:           { type: String, default: 'FF' },
  status:          { type: String, enum: ['active', 'cleared'], default: 'active' },
  clearedInSession:{ type: String, default: null },
}, { _id: false });

/**
 * Semester Performance Sub-schema
 */
const semesterPerformanceSchema = new mongoose.Schema({
  registeredCredits: { type: Number, default: 0 },
  earnedCredits:     { type: Number, default: 0 },
  spi:               { type: Number, default: 0 },
  creditPoints:      { type: Number, default: 0 },
}, { _id: false });

/**
 * Cumulative Performance Sub-schema
 */
const cumulativePerformanceSchema = new mongoose.Schema({
  earnedCredits: { type: Number, default: 0 },
  cgpa:          { type: Number, default: 0 },
  backlogs:      { type: Number, default: 0 },
}, { _id: false });

/* ─────────────────────────── Main Schema ─────────────────────────── */

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

    // ── Marksheet-specific structured fields ──────────────────────────
    // These coexist with additionalData for backward compat with other cert types
    marksheetData: {
      institution:  { type: String, default: '' },
      semester:     { type: String, default: '' },
      academicYear: { type: String, default: '' },
      examSeatNo:   { type: String, default: '' },
      subjects:     { type: [subjectSchema],  default: [] },
      backlogs:     { type: [backlogSchema],  default: [] },
      resultStatus: { type: String, enum: ['PASS', 'ATKT', 'FAIL', 'WITHHELD', 'PENDING'], default: 'PENDING' },
      performance: {
        currentSemester: { type: semesterPerformanceSchema,  default: () => ({}) },
        cumulative:      { type: cumulativePerformanceSchema, default: () => ({}) },
      },
    },

    // Additional fields for other certificate types (hackathon, sports, general)
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;

