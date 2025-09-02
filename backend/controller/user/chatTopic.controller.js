const ChatTopic = require("../../models/chatTopic.model");

//import model
const Doctor = require("../../models/doctor.model");
const User = require("../../models/user.model");
const ChatBoat = require("../../models/chatBoat.model");

//day.js
const dayjs = require("dayjs");

//mongoose
const mongoose = require("mongoose");

//get thumb list of chat between the users
exports.getChatList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "UserId must be required." });
    }

    let now = dayjs();

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const searchString = req.query.search || "";

    let matchQuery = {};

    if (searchString !== "All" && searchString !== "") {
      const searchRegex = new RegExp(searchString, "i");
      matchQuery.$or = [
        { "doctor.name": { $regex: searchRegex } },
        { "doctor.designation": { $regex: searchRegex } },
        { "doctor.clinicName": { $regex: searchRegex } },
        { "doctor.email": { $regex: searchRegex } },
      ];
    }

    const [user, chatList, chatBoat] = await Promise.all([
      User.findById(userId),
      ChatTopic.aggregate([
        {
          $match: { user: userId },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: "$doctor",
        },
        {
          $match: matchQuery,
        },
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
          $lookup: {
            from: "services",
            localField: "doctor.service",
            foreignField: "_id",
            as: "services",
          },
        },
        {
          $project: {
            chatTopic: "$chat.chatTopic",
            sender: "$doctor._id",
            senderName: "$doctor.name",
            senderImage: "$doctor.image",
            isDelete: "$doctor.isDelete",
            services: {
              $map: {
                input: "$services",
                as: "service",
                in: "$$service.name",
              },
            },
            message: "$chat.message",
            role: "$chat.role",
            name: "$user.name",
            image: "$user.image",
            user: "$user._id",
            gender: "$doctor.gender",
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
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 31536000000],
                                    },
                                  },
                                },
                                " years ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 2592000000],
                                    },
                                  },
                                },
                                " months ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 604800000],
                                    },
                                  },
                                },
                                " weeks ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 86400000],
                                    },
                                  },
                                },
                                " days ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 3600000],
                                    },
                                  },
                                },
                                " hours ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: { $divide: ["$$timeDiff", 60000] },
                                  },
                                },
                                " minutes ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: { $divide: ["$$timeDiff", 1000] },
                                  },
                                },
                                " seconds ago",
                              ],
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
        { $sort: { time: 1 } },
        // { $skip: start * limit },
        // { $limit: limit },
      ]),
      ChatBoat.aggregate([
        {
          $match: { user: userId },
        },
        {
          $project: {
            chatTopic: "",
            sender: "",
            senderName: "",
            senderImage: "",
            services: [],
            message: "",
            role: "",
            name: "",
            image: "",
            user: "",
            time: "",
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!chatBoat.length) {
      const newChatBoat = new ChatBoat({ user: user._id });
      await newChatBoat.save();
      chatBoat.push(newChatBoat);
    }

    let topChatTopic = null;

    if (req.query.doctor) {
      const doctorId = new mongoose.Types.ObjectId(req.query.doctor);

      let found = await ChatTopic.findOne({ doctor: doctorId, user: userId }).populate("doctor").populate("user");

      if (!found) {
        found = new ChatTopic({ doctor: doctorId, user: userId });
        await found.save();
        found = await ChatTopic.findById(found._id).populate("doctor").populate("user");
      }

      const latestChat = await Chat.findOne({ chatTopic: found.chat }).sort({ createdAt: -1 }).lean();

      const timeDiff = dayjs().diff(latestChat?.createdAt || found.createdAt);
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
        sender: found.doctor._id,
        senderName: found.doctor.name,
        senderImage: found.doctor.image,
        services: [],
        message: latestChat?.message || "",
        role: latestChat?.role || "",
        name: found.user.name,
        image: found.user.image,
        user: found.user._id,
        gender: found.doctor.gender,
        time: formattedTime,
      };
    }

    let responseList = [...chatBoat];
    if (topChatTopic) {
      responseList.push(topChatTopic);
    }

    const filteredChatList = chatList.filter((c) => {
      return !topChatTopic || String(c.chatTopic) !== String(topChatTopic.chatTopic);
    });

    responseList = responseList.concat(filteredChatList);

    return res.status(200).json({ status: true, message: "Success", data: responseList });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.errorMessage || "Internal Server Error",
    });
  }
};
