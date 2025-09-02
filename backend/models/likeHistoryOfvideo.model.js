const mongoose = require("mongoose");

const likeHistoryOfvideoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

likeHistoryOfvideoSchema.index({ user: 1 });
likeHistoryOfvideoSchema.index({ video: 1 });

module.exports = mongoose.model("LikeHistoryOfvideo", likeHistoryOfvideoSchema);
