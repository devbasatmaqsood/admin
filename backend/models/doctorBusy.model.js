const mongoose = require("mongoose");

const doctorBusySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    time: [{ type: String, default: "" }],
    date: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

doctorBusySchema.index({ doctor: 1 });

module.exports = mongoose.model("DoctorBusy", doctorBusySchema);
