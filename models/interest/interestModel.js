const mongoose = require('mongoose');
const interestConfig = require('../../config/interestConfig');
const validateColor = require('validate-color').default;

const interestSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      lowercase: true,
      required: [true, 'No topic was specified for this interest.'],
    },
    interest: {
      type: String,
      lowercase: true,
      required: [true, 'No interest name was specified for this interest.'],
    },
    regions: {
      type: [
        {
          region: {
            type: String,
          },
          engagements: Number,
        },
      ],
      required: [true, 'Please specify a region for this interest'],
      default: interestConfig.DEFAULT_REGIONS(),
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interestSchema.index({ interest: 1, topic: 1 }, { unique: true });

// Virtual totalEngagments property
interestSchema.virtual('engagements').get(function () {
  const engagements = this.regions.reduce(
    (accumulator, region) => accumulator + region.engagements,
    0
  );

  return engagements;
});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
