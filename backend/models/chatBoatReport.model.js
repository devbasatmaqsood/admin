const mongoose = require("mongoose");

const chatBoatReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    text: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatBoatReportSchema.index({ user: 1 });

module.exports = mongoose.model("ChatBoatReport", chatBoatReportSchema);
