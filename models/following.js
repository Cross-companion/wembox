const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: [Date],
});

const Following = mongoose.model('Following', followingSchema);

module.exports = Following;
