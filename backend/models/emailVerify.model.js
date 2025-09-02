const mongoose = require("mongoose");

const emailVerify = new mongoose.Schema(
  {
    email: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("EmailVerify", emailVerify);
