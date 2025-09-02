const mongoose = require("mongoose");

const videoCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
    commentText: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

videoCommentSchema.index({ user: -1 });
videoCommentSchema.index({ video: -1 });
videoCommentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("VideoComment", videoCommentSchema);
