const mongoose = require("mongoose");
const { CANCEL_BY, PAYMENT_STATUS, PAYMENT_GATEWAY, APPOINTMENT_STATUS, APPOINTMENT_TYPE } = require("../types/constant");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubPatient",
    },

    time: { type: String, default: "" },

    status: {
      type: Number,
      enum: APPOINTMENT_STATUS,
      default: 1,
    },

    appointmentId: { type: String, unique: true },

    date: {
      type: String,
      default: "",
    },

    isReviewed: { type: Boolean, default: false },

    type: { type: Number, enum: APPOINTMENT_TYPE },

    paymentGateway: { type: Number, enum: PAYMENT_GATEWAY },

    duration: { type: Number, default: 0 },

    amount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    withoutTax: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    coupon: String,

    adminEarning: { type: Number, default: 0 },
    adminCommissionPercent: { type: Number, default: 0 },

    doctorEarning: { type: Number, default: 0 },

    isSettle: { type: Boolean, default: false },

    cancel: {
      reason: String,
      person: {
        type: String,
        enum: CANCEL_BY,
      },
      time: String,
      date: String,
    },

    checkInTime: { type: String, default: "" },
    checkOutTime: { type: String, default: "" },

    details: String,
    image: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
