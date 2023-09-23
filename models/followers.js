const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: [Date],
});

const Followers = mongoose.model('Follower', followerSchema);

module.exports = Followers;
