const mongoose = require("mongoose");

const chatBoatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    message: {
      type: [
        {
          text: { type: String, required: true },
          time: { type: String, required: true },
          isSendByUser: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatBoatSchema.index({ user: 1 });

module.exports = mongoose.model("ChatBoat", chatBoatSchema);
