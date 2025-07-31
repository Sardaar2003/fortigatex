const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderDate: {
    type: String,
    required: function() {
      return this.project !== 'SC Project' && this.project !== 'sempris';
    },
    validate: {
      validator: function(v) {
        // Skip validation if this is a Sempris order
        if (this.project === 'SC Project' || this.project === 'sempris') {
          return true;
        }
        
        // Check if date is in MM/DD/YYYY format
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
        if (!dateRegex.test(v)) return false;
        
        // Check if it's a valid date
        const [month, day, year] = v.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               date.getDate() === day;
      },
      message: 'Please enter a valid date in MM/DD/YYYY format'
    }
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
    match: [/^[A-Z]{2}$/, 'Please enter a valid 2-letter state code']
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
  secondaryPhoneNumber: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
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
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'],
    default: 'pending'
  },
  creditCardNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{13,16}$/, 'Please enter a valid credit card number']
  },
  creditCardExpiration: {
    type: String,
    required: true,
    trim: true,
    match: [/^(0[1-9]|1[0-2])\d{2}$/, 'Please enter expiration in MMYY format']
  },
  creditCardLast4: {
    type: String,
    trim: true,
    maxlength: 4
  },
  creditCardCVV: {
    type: String,
    required: function() {
      return this.project === 'SC Project';
    },
    trim: true,
    match: [/^\d{3,4}$/, 'Please enter a valid CVV']
  },
  cardIssuer: {
    type: String,
    required: function() {
      return this.project === 'SC Project';
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
    default: 'FRP Project',
    enum: ['FRP Project', 'SC Project']
  },
  vendorId: {
    type: String,
    required: function() {
      return this.project === 'SC Project';
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
  },
  transactionId: {
    type: String,
    // trim: true,
    // maxlength: 10
  },
  transactionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema); 