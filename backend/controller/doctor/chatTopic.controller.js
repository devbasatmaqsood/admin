const ChatTopic = require("../../models/chatTopic.model");

//import model
const Doctor = require("../../models/doctor.model");
const Chat = require("../../models/chat.model");

//day.js
const dayjs = require("dayjs");

//mongoose
const mongoose = require("mongoose");

//get thumb list of chat between the users
exports.getChatList = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).json({ status: false, message: "doctorId must be required." });
    }

    let now = dayjs();

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);
    const userIdParam = req.query.userId ? new mongoose.Types.ObjectId(req.query.userId) : null;

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const searchString = req.query.search || "";

    let matchQuery = {};

    if (searchString !== "All" && searchString !== "") {
      const searchRegex = new RegExp(searchString, "i");

      matchQuery.$or = [
        { "user.name": { $regex: searchRegex } },
        { "user.email": { $regex: searchRegex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$user.uniqueId" },
              regex: searchRegex,
            },
          },
        },
      ];
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor does not found." });
    }

    if (doctor.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    // Optional: create new ChatTopic if doctorId and userId are both provided
    let topChatTopic = null;
    if (userIdParam) {
      let topic = await ChatTopic.findOne({ doctor: doctorId, user: userIdParam }).populate("doctor").populate("user");

      if (!topic) {
        topic = new ChatTopic({ doctor: doctorId, user: userIdParam });
        await topic.save();
        topic = await ChatTopic.findById(topic._id).populate("doctor").populate("user");
      }

      const latestChat = await Chat.findOne({ chatTopic: topic.chat }).sort({ createdAt: -1 }).lean();

      const timeDiff = dayjs().diff(latestChat?.createdAt || topic.createdAt);
      let formattedTime = "Just now";

      if (timeDiff >= 31536000000) formattedTime = `${Math.floor(timeDiff / 31536000000)} years ago`;
      else if (timeDiff >= 2592000000) formattedTime = `${Math.floor(timeDiff / 2592000000)} months ago`;
      else if (timeDiff >= 604800000) formattedTime = `${Math.floor(timeDiff / 604800000)} weeks ago`;
      else if (timeDiff >= 86400000) formattedTime = `${Math.floor(timeDiff / 86400000)} days ago`;
      else if (timeDiff >= 3600000) formattedTime = `${Math.floor(timeDiff / 3600000)} hours ago`;
      else if (timeDiff >= 60000) formattedTime = `${Math.floor(timeDiff / 60000)} minutes ago`;
      else if (timeDiff >= 1000) formattedTime = `${Math.floor(timeDiff / 1000)} seconds ago`;

      topChatTopic = {
        chatTopic: latestChat?.chatTopic || null,
        sender: topic.doctor._id,
        senderName: topic.doctor.name,
        senderImage: topic.doctor.image,
        message: latestChat?.message || "",
        role: latestChat?.role || "",
        name: topic.user.name,
        image: topic.user.image,
        user: topic.user._id,
        gender: topic.user.gender,
        time: formattedTime,
      };
    }

    let chatList = await ChatTopic.aggregate([
      { $match: { doctor: doctorId } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: matchQuery },
      {
        $lookup: {
          from: "chats",
          localField: "chat",
          foreignField: "_id",
          as: "chat",
        },
      },
      {
        $unwind: {
          path: "$chat",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          chatTopic: "$chat.chatTopic",
          sender: "$doctor",
          senderName: "$doctor.name",
          senderImage: "$doctor.image",
          message: "$chat.message",
          role: "$chat.role",
          name: "$user.name",
          image: "$user.image",
          user: "$user._id",
          gender: "$user.gender",
          time: {
            $let: {
              vars: {
                timeDiff: { $subtract: [now.toDate(), "$chat.createdAt"] },
              },
              in: {
                $concat: [
                  {
                    $switch: {
                      branches: [
                        {
                          case: { $gte: ["$$timeDiff", 31536000000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 2592000000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 604800000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 86400000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 3600000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 60000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"],
                          },
                        },
                        {
                          case: { $gte: ["$$timeDiff", 1000] },
                          then: {
                            $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"],
                          },
                        },
                        { case: true, then: "Just now" },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { time: -1 } },
      { $skip: start * limit },
      { $limit: limit },
    ]);

    if (topChatTopic) {
      chatList = [topChatTopic, ...chatList.filter((c) => String(c.chatTopic) !== String(topChatTopic.chatTopic))];
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      data: chatList,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.errorMessage || "Internal Server Error",
    });
  }
};
