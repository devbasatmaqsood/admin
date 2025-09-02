const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, unique: true, default: "" },
    description: { type: String, default: "" },
    videoTime: { type: Number, min: 0 }, //that value always save in millisecond
    videoUrl: { type: String, default: "" },
    videoImage: { type: String, default: "" },
    shareCount: { type: Number, default: 0 }, //when user share the video then shareCount increased
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    isCommentAllowed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

videoSchema.index({ doctor: 1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
