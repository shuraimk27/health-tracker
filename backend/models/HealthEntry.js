const mongoose = require('mongoose');

const healthEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  bmi: {
    type: Number
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number }
  },
  heartRate: {
    type: Number
  },
  waterIntake: {
    type: Number,  // in glasses
    default: 0
  },
  sleepHours: {
    type: Number
  },
  steps: {
    type: Number,
    default: 0
  },
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

// Auto-calculate BMI before saving
healthEntrySchema.pre('save', function(next) {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

module.exports = mongoose.model('HealthEntry', healthEntrySchema);