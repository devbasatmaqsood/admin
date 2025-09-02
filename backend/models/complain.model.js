const mongoose = require("mongoose");
const { COMPLAIN_TYPE, COMPLAIN_PERSON } = require("../types/constant");

const complainSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    appointmentId: { type: Number, default: "" },
    details: { type: String, default: "" },
    image: { type: String, default: "" },
    type: { type: Number, default: 1, enum: COMPLAIN_TYPE }, // 1 for pending,2 for solved
    solvedDate: { type: String },
    person: { type: Number, enum: COMPLAIN_PERSON },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    isComplain: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

complainSchema.index({ doctor: 1 });
complainSchema.index({ user: 1 });
complainSchema.index({ appointmentId: 1 });

module.exports = mongoose.model("Complain", complainSchema);
