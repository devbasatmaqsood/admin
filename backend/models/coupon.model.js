const mongoose = require("mongoose");
const { COUPON_TYPE, DISCOUNT_TYPE } = require("../types/constant");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    discountPercent: { type: Number},
    maxDiscount: { type: Number},
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    type: { type: Number, default: 1, enum: COUPON_TYPE },
    discountType: { type: Number, default: 1, enum: DISCOUNT_TYPE },
    isActive: { type: Boolean, default: true },
    minAmountToApply: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
