const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const trackingSchema = new Schema({
  trackingID: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  watchInfo: {
    batteryPercent: {
      type: String,
      required: true,
    },
    watchTime: {
      type: String,
      required: true,
    },
    watchDate: {
      type: Date,
      required: false,
    },
  },
  locationInfo: {
    locationAccuracy: {
      type: Number,
      required: true,
    },
    lastTransmistedDate: {
      type: Date,
      required: true,
    },
    lastThreeKnownLocation: [
      {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});
trackingSchema.index({ trackingID: 1 });
const studentsTrackingData = mongoose.model(
  "studentsTrackingData",
  trackingSchema,
);
module.exports = studentsTrackingData;
