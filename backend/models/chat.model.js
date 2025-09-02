const mongoose = require("mongoose");

const { MESSAGE_TYPE, CALL_TYPE } = require("../types/constant");

const chatSchema = mongoose.Schema(
  {
    chatTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatTopic",
      default: null,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Doctor",
    }, //1.user 2.doctor
    user: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "User" }, //1.user 2.doctor
    role: { type: String, enum: ["user", "doctor"] },

    messageType: { type: String, enum: MESSAGE_TYPE }, //1.message 2.image 3.video 4.audio 5.videoCall
    message: { type: String, default: "" },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    thumbnail: { type: String, default: "" },

    isRead: { type: Boolean, default: false },
    date: { type: String, default: "" },

    //for videoCall
    callType: { type: Number, enum: CALL_TYPE }, //1.received 2.declined 3.missCalled
    callDuration: { type: String },
    callId: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatSchema.index({ createdAt: -1 });
chatSchema.index({ chatTopic: 1 });
chatSchema.index({ sender: 1 });
chatSchema.index({ receiver: 1 });
chatSchema.index({ callId: 1 });

module.exports = mongoose.model("Chat", chatSchema);
