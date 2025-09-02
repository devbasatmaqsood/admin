const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    review: { type: String, default: "" },
    relativeTime: { type: String },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    rating: { type: Number, default: 0 },
    callId: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({ user: 1 });
reviewSchema.index({ doctor: 1 });
reviewSchema.index({ appointment: 1 });

module.exports = mongoose.model("Review", reviewSchema);
