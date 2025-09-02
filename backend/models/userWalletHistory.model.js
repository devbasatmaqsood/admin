const mongoose = require("mongoose");
const { PAYMENT_GATEWAY, WALLET_HISTORY_TYPE } = require("../types/constant");

const userWalletHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "UserWallet" },
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
    paymentGateway: { type: Number, enum: PAYMENT_GATEWAY },
    paymentType: { type: String, default: "" },
    type: { type: Number, enum: WALLET_HISTORY_TYPE }, // 1 for amount loaded 2 for amount deduct at the time of appointment 3 for appointment cancel
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    couponId: { type: String, default: "" },
    couponAmount: { type: Number },
    uniqueId: { type: String },
    time: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("UserWalletHistory", userWalletHistorySchema);
