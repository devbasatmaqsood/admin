const mongoose = require("mongoose");
const generateId = require("../middleware/generateId");

const callHistorySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null, // Set default to null instead of an empty string
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Set default to null instead of an empty string
    },
    callConnect: {
      type: Boolean,
      default: false,
    },
    callStartTime: {
      type: String,
      default: "",
    },
    callEndTime: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "00:00:00",
    },
    role: {
      type: String,
      default: "",
    },
    callId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

callHistorySchema.index({ createdAt: -1 });
callHistorySchema.index({ callerId: 1 });
callHistorySchema.index({ doctor: 1 });
callHistorySchema.index({ user: 1 });

module.exports = mongoose.model("CallHistory", callHistorySchema);
