const mongoose = require("mongoose");

const suggestedServiceSchema = new mongoose.Schema(
  {
    name:  String,
    description:  String,
    doctor:  String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports =  mongoose.model("SuggestedService", suggestedServiceSchema);
