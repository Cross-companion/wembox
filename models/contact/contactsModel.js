const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator: function (array) {
          return array.length === 2;
        },
        message: 'Only 2 users should be on a contact.',
      },
    },
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a compound unique index on follower and following
contactSchema.index({ users: 1 }, { unique: true });

// Virtuals
contactSchema.virtual('otherUser', {
  ref: 'User',
  localField: 'users',
  foreignField: '_id',
  justOne: false,
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
