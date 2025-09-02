const mongoose = require("mongoose");

const doctorWithdrawMethodSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    paymentMethods: [
      {
        paymentGateway: { type: String, default: "" },
        paymentDetails: { type: Array, default: [] },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("DoctorWithdrawMethod", doctorWithdrawMethodSchema);
