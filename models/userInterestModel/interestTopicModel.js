const mongoose = require('mongoose');

const interestTopicSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, ['An interest topic must have a name.']],
  },
  chosenAtSignUp: {
    type: Number,
    default: 0,
  },
  interest: {
    type: String,
    lowercase: true,
    required: [
      true,
      'No parent interest was specified for this interest topic.',
    ],
  },
});

// Create a compound unique index for the name and it's parent interest.
interestTopicSchema.index({ name: 1, interest: 1 }, { unique: true });

const InterestTopic = mongoose.model('InterestTopic', interestTopicSchema);

module.exports = InterestTopic;
