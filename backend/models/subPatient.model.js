const mongoose = require("mongoose");

const subPatientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "" },
    gender: { type: String, default: "" },
    relation: { type: String, default: "" },
    age: { type: Number, default: null },
    image: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("SubPatient", subPatientSchema);
