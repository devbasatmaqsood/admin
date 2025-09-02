const mongoose = require("mongoose");

const uniqueStringSchema = new mongoose.Schema(
  {
    string: { type: String, unique: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("UniqueString", uniqueStringSchema);
