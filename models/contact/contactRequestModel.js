const mongoose = require('mongoose');

// const statusEnum = ['pending', 'accepted', 'declined']

const contactRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'No contact request sender was specified.'],
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'No contact request reciever was specified.'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'declined'],
      message: 'Invalid contact request status.',
    },
    default: 'pending',
  },
  introMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Create a compound unique index on sender and reciever
contactRequestSchema.index({ sender: 1, reciever: 1 }, { unique: true });

// withInroMessage virtually poplated

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

module.exports = ContactRequest;