const mongoose = require("mongoose");

const appTestingSchema = new mongoose.Schema(
  {
    plateformType: { type: Number, enum: [1, 2] }, //1.Android 2.IOS
    deviceName: { type: String, trim: true, default: "" },
    identity: { type: String, trim: true, default: "" },
    user: { type: String, trim: true, default: "" },
    date: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("AppTesting", appTestingSchema);
