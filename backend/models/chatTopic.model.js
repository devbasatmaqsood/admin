const mongoose = require("mongoose");

const chatTopicSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatTopicSchema.index({ createdAt: -1 });
chatTopicSchema.index({ senderUser: 1 });
chatTopicSchema.index({ receiverUser: 1 });
chatTopicSchema.index({ chat: 1 });

module.exports = mongoose.model("ChatTopic", chatTopicSchema);
