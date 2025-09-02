const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    reason: { type: String, default: "Doctor is not available On This Day" },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Holiday", holidaySchema);
