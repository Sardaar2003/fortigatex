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
    trim: true,
    maxlength: 30
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  address1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  address2: {
    type: String,
    trim: true,
    maxlength: 50
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 512
  },
  sourceCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 6
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    maxlength: 7
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  sessionId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 36
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
    trim: true,
    match: [/^\d{4}$/, 'Please enter a valid expiration date (MMYY)']
  },
  creditCardCVV: {
    type: String,
    required: function() {
      return this.project === 'Sempris Project';
    },
    trim: true,
    match: [/^\d{3,4}$/, 'Please enter a valid CVV']
  },
  cardIssuer: {
    type: String,
    required: function() {
      return this.project === 'Sempris Project';
    },
    enum: ['diners-club', 'discover', 'jcb', 'visa', 'mastercard', 'american-express']
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
  // Project-specific validation fields
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
  },
  project: {
    type: String,
    required: true,
    default: 'Radius Project',
    enum: ['Radius Project', 'Sempris Project', 'Project 3']
  },
  // Sempris-specific fields
  vendorId: {
    type: String,
    required: function() {
      return this.project === 'Sempris Project';
    },
    trim: true,
    maxlength: 4
  },
  clientOrderNumber: {
    type: String,
    trim: true,
    maxlength: 10
  },
  clientData: {
    type: String,
    trim: true,
    maxlength: 64
  },
  pitchId: {
    type: String,
    trim: true,
    maxlength: 11
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema); 