const Video = require("../../models/video.model");
const Doctor = require("../../models/doctor.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfvideo.model");
const VideoComment = require("../../models/videoComment.model");
const WatchHistory = require("../../models/watchHistory.model");

//mongoose
const mongoose = require("mongoose");

//fs
const fs = require("fs");

//day.js
const dayjs = require("dayjs");

//get particular doctor's videos
exports.doctorVideosByadmin = async (req, res, next) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).json({ status: false, message: "doctorId must be required." });
    }

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);

    const [doctor, videos] = await Promise.all([Doctor.findOne({ _id: doctorId }).lean(), Video.find({ doctor: doctorId }).sort({ createdAt: -1 }).lean()]);

    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor does not found." });
    }

    return res.status(200).json({
      status: true,
      message: `Retrive videos of the particular doctor.`,
      videos: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete video by admin
exports.deleteVideoByadmin = async (req, res) => {
  try {
    if (!req.query.videoId || !req.query.doctorId) {
      return res.status(200).json({ status: false, message: "videoId and doctorId must be required." });
    }

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [doctor, video] = await Promise.all([Doctor.findOne({ _id: doctorId }).lean(), Video.findOne({ doctor: doctorId, _id: videoId })]);

    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor does not found." });
    }

    if (doctor.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found for that doctor." });
    }

    res.status(200).json({ status: true, message: "Videos have been deleted." });

    const videoImage = video?.videoImage?.split("storage");
    if (videoImage) {
      if (fs.existsSync("storage" + videoImage[1])) {
        fs.unlinkSync("storage" + videoImage[1]);
      }
    }

    const videoUrl = video?.videoUrl?.split("storage");
    if (videoUrl) {
      if (fs.existsSync("storage" + videoUrl[1])) {
        fs.unlinkSync("storage" + videoUrl[1]);
      }
    }

    await Promise.all([
      LikeHistoryOfVideo.deleteMany({ video: video._id }),
      VideoComment.deleteMany({ video: video._id }),
      WatchHistory.deleteMany({ video: video._id }),
      Video.deleteOne({ _id: video._id }),
    ]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all comments for particular video by admin
exports.videoComments = async (req, res) => {
  try {
    if (!req.query.videoId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    let now = dayjs();
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [video, videoComment] = await Promise.all([
      Video.findOne({ _id: videoId }),
      VideoComment.aggregate([
        {
          $match: { video: videoId },
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
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            userId: "$user._id",
            name: "$user.name",
            userImage: "$user.image",
            commentText: 1,
            createdAt: 1,

            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now.toDate(), "$createdAt"] },
                },
                in: {
                  $concat: [
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $gte: ["$$timeDiff", 31536000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
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
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found." });
    }

    return res.status(200).json({ status: true, message: "Retrive Comments for particular video.", data: videoComment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete video comment by admin
exports.deleteVideoComment = async (req, res) => {
  try {
    if (!req.query.commentId) {
      return res.status(200).json({ status: false, message: "commentId must be required." });
    }

    const commentId = new mongoose.Types.ObjectId(req.query.commentId);

    const videoComment = await VideoComment.findOne({ _id: commentId });
    if (!videoComment) {
      return res.status(200).json({ status: false, message: "Video Comment does not found." });
    }

    await videoComment.deleteOne();

    return res.status(200).json({ status: true, message: "Video Comment have been deleted." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};