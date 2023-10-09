const mongoose = require('mongoose');
const validateColor = require('validate-color').default;

const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
      required: [true, 'A user interest must have a name.'],
      unique: [true, 'An interest must be unique name.'],
    },
    themeColor: {
      type: String,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Validate that the string recieved is a valid color.
          return validateColor(value);
        },
      },
      default: '#ffffff',
    },
    chosenAtSignUp: {
      type: Number,
      default: 0,
    },
    interestTopicsRef: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'InterestTopic',
      },
    ],
    // interestTopics -- Virtually populated
    // numberOfTopics -- Virtually populated
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interestSchema.virtual('numberOfTopics').get(function () {
  return this.interestTopics.length;
});

interestSchema.virtual('interestTopics', {
  ref: 'InterestTopic',
  localField: 'name',
  foreignField: 'interest',
});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
