const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, require: true },
    password: { type: String, trim: true, required: true },
    image: { type: String, trim: true },
    userLicenseKey: { type: String, trim: true },
    doctorLicenseKey: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
