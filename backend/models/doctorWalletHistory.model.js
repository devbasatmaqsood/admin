const mongoose = require("mongoose");
const moment = require("moment");

const doctorWalletHistorySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    amount: { type: Number, default: 0 },
    date: { type: String, default: moment().format("YYYY-MM-DD") },
    time: { type: String, default: moment().format("hh:mm: A") },
    type: { type: Number, enum: [1, 2] }, // 1 for deposit when booking complete  2 when withdraw request approve and doctor paid by admin
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("DoctorWalletHistory", doctorWalletHistorySchema);
