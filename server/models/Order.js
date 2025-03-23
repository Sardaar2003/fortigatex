const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  sourceCode: {
    type: String,
    required: true,
    default: 'R4N',
    trim: true
  },
  sku: {
    type: String,
    required: true,
    default: 'F11',
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  creditCardLast4: {
    type: String,
    required: true,
    trim: true
  },
  creditCardExpiration: {
    type: String,
    required: true,
    trim: true
  },
  voiceRecordingId: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Radius API validation fields
  validationStatus: {
    type: Boolean,
    default: false
  },
  validationMessage: {
    type: String,
    trim: true
  },
  validationResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  validationDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema); 