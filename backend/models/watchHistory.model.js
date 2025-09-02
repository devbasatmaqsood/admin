const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

watchHistorySchema.index({ createdAt: -1 });
watchHistorySchema.index({ user: 1 });
watchHistorySchema.index({ video: 1 });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
