const mongoose = require('mongoose');
const AppError = require('../../utilities/AppError');

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    following: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a compound unique index on follower and following
followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.log(error);
    // MongoDB error code 11000 indicates a duplicate key error
    return next(
      new AppError(
        'Duplicate follower and following pair. You already follow this account.',
        409
      )
    );
  }
  next(error);
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
