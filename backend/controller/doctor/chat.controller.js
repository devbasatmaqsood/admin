const Chat = require("../../models/chat.model");

const ChatTopic = require("../../models/chatTopic.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const mongoose = require("mongoose");

const admin = require("../../firebase");

exports.createChat = async (req, res) => {
  try {
    const { senderId, receiverId, messageType } = req.body;
    const file = req.file;

    if (!senderId || !receiverId || !messageType) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({ status: false, message: "Oops ! Invalid details." });
    }

    let sender, receiver;

    sender = await Doctor.findById(senderId);
    receiver = await User.findById(receiverId);

    if (!sender) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "sender not found or invalid role." });
    }

    if (!receiver) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "receiver not found or invalid role.",
      });
    }

    let chatTopic;
    try {
      chatTopic = await ChatTopic.findOne({
        sender: sender._id,
        receiver: receiver._id,
      })
        .populate({ path: "sender", select: "name image _id" })
        .populate({ path: "receiver", select: "name image _id" });
    } catch (error) {
      console.error(error);
    }

    if (!chatTopic) {
      chatTopic = new ChatTopic();

      chatTopic.sender = sender._id;
      chatTopic.receiver = receiver._id;
    }

    const chat = new Chat();

    chat.sender = sender._id;
    chat.role = "doctor";
    chat.receiver = receiver._id;
    if (messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req.file ? process?.env?.baseURL + req?.file?.path : null;
    } else if (messageType == 1) {
      chat.messageType = 1;
      chat.message = req.body.message;
    } else {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "messageType must be passed valid." });
    }

    chat.chatTopic = chatTopic._id;
    chat.date = new Date().toLocaleString();

    chatTopic.chat = chat._id;

    await Promise.all([chat.save(), chatTopic.save()]);

    res.status(200).json({
      status: true,
      message: "Success",
      data: chat,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getOldChatForDoctor = async (req, res) => {
  try {
    if (!req.query.doctor || !req.query.user) {
      return res.status(200).json({
        status: false,
        message: "sender and receiver must be required.",
      });
    }
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 100;
    const skipAmount = start * limit;

    const userId = new mongoose.Types.ObjectId(req.query.user);
    const doctorId = new mongoose.Types.ObjectId(req.query.doctor);

    let chatTopic;
    const [doctor, user, foundChatTopic] = await Promise.all([
      Doctor.findById(req.query.doctor),
      User.findById(req.query.user),
      ChatTopic.findOne({
        doctor: doctorId,
        user: userId,
      }),
    ]);

    chatTopic = foundChatTopic;

    if (!doctor) {
      return res.status(200).json({ status: false, message: "Doctor does not found." });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User dose not found." });
    }

    if (!chatTopic) {
      chatTopic = new ChatTopic();

      chatTopic.doctor = doctor._id;
      chatTopic.user = user._id;
    }

    const [savedChatTopic, chat, total] = await Promise.all([
      chatTopic.save(),
      Chat.find({ chatTopic: chatTopic._id }).sort({ createdAt: -1 }).skip(skipAmount).limit(limit).populate("callId").lean(),
      Chat.countDocuments({ chatTopic: chatTopic._id }),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get old chat fetch successfully.",
      chatTopic: savedChatTopic._id,
      chat: chat,
      total,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.createChatDoctor = async (req, res) => {
  try {
    if (!req.query.user || !req.query.doctor || !req.query.messageType) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    let chatTopic;
    const [user, doctor, foundChatTopic] = await Promise.all([User.findById(req.query.user), Doctor.findById(req.query.doctor), ChatTopic.findOne({ doctor: req.query.doctor, user: req.query.user })]);

    if (!user) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (!doctor) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Expert dose not found." });
    }

    chatTopic = foundChatTopic;

    if (!chatTopic) {
      chatTopic = new ChatTopic();

      chatTopic.doctor = doctor._id;
      chatTopic.user = user._id;
    }

    const chat = new Chat();

    chat.doctor = doctor._id;
    chat.user = user._id;
    chat.role = "doctor";

    if (req.query.messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req.files ? process?.env?.baseURL + req?.files?.image[0].path : "";
    } else if (req.query.messageType == 4) {
      chat.messageType = 4;
      chat.message = "🎤 Audio";
      chat.audio = req.files ? process?.env?.baseURL + req?.files?.audio[0].path : "";
    } else if (req.query.messageType == 3) {
      chat.messageType = 3;
      chat.message = "🎞️ VIDEO";
      chat.video = req.files ? process?.env?.baseURL + req?.files?.video[0].path : "";
      chat.thumbnail = req.files ? process?.env?.baseURL + req?.files?.thumbnail[0].path : "";
    } else {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "messageType must be passed valid." });
    }

    chat.chatTopic = chatTopic._id;
    chat.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    chatTopic.chat = chat._id;

    await Promise.all([chat.save(), chatTopic.save()]);

    res.status(200).json({
      status: true,
      message: "Success",
      chat: chat,
    });

    if (!doctor.isBlock) {
      const adminPromise = await admin;
      if (user && user.fcmToken !== null) {
        try {
          const payload = {
            token: user.fcmToken,
            notification: {
              body: req.body.message,
              title: req.body.title,
              image: req.file ? process.env.baseURL + req.file.path : "",
            },
          };

          const response = await adminPromise.messaging().send(payload);
          console.log("Successfully sent message:", response);
        } catch (error) {
          console.log("Error sending message:", error);
        }
      }

      if (user && user.webFcmToken !== null) {
        try {
          const payload = {
            token: user.webFcmToken,
            notification: {
              body: req.body.message,
              title: req.body.title,
              image: req.file ? process.env.baseURL + req.file.path : "",
            },
          };

          const response = await adminPromise.messaging().send(payload);
          console.log("Successfully sent message:", response);
        } catch (error) {
          console.log("Error sending message:", error);
        }
      }
    }
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
