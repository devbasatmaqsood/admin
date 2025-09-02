const mongoose = require("mongoose");

const { DOCTOR_PAYMENT_REQUEST_TYPE } = require("../types/constant");

const withdrawRequestSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    amount: { type: Number, default: 0 },
    paymentGateway: { type: String, default: "" },
    paymentDetails: { type: Array, default: [] },
    status: { type: Number, default: 1, enum: DOCTOR_PAYMENT_REQUEST_TYPE },
    payDate: String,
    declineReason: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("WithdrawRequest", withdrawRequestSchema);
