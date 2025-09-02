const Video = require("../../models/video.model");
const Doctor = require("../../models/doctor.model");
const User = require("../../models/user.model");
const Notification = require("../../models/notification.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfvideo.model");
const VideoComment = require("../../models/videoComment.model");
const WatchHistory = require("../../models/watchHistory.model");

const { deleteFiles } = require("../../middleware/deleteFile");
const mongoose = require("mongoose");
const admin = require("../../firebase");
const fs = require("fs");

//generateUniqueVideoId
const { generateUniqueVideoId } = require("../../middleware/generateUniqueVideoId");

//upload video by doctor
exports.uploadvideo = async (req, res, next) => {
  try {
    if (!req.body.doctorId || !req.body.videoTime || !req.files || !req.body.isCommentAllowed) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const doctorId = new mongoose.Types.ObjectId(req.body.doctorId);
    const [uniqueVideoId, doctor] = await Promise.all([generateUniqueVideoId(), Doctor.findOne({ _id: doctorId })]);

    if (!doctor) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Doctor does not found." });
    }

    if (doctor.isBlock) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!settingJSON) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "setting does not found!" });
    }

    console.log("settingJSON.durationOfvideo", settingJSON.durationOfvideo);

    if (settingJSON.durationOfvideo < Number(req.body.videoTime)) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "your duration of Video greater than decided by the admin." });
    }

    const video = new Video();

    video.doctor = doctor._id;
    video.description = req?.body?.description ? req.body.description : "";
    video.videoTime = req?.body?.videoTime;
    video.isCommentAllowed = req?.body?.isCommentAllowed ? req.body.isCommentAllowed : false;

    if (req?.files?.videoImage) {
      video.videoImage = process.env.baseURL + req.files.videoImage[0].path;
    }

    if (req?.files?.videoUrl) {
      video.videoUrl = process.env.baseURL + req.files.videoUrl[0].path;
    }

    video.uniqueId = uniqueVideoId;
    await video.save();

    res.status(200).json({ status: true, message: "Video Uploaded Successfully.", data: video });

    const users = await User.find({
      $or: [{ fcmToken: { $nin: [null, ""] } }, { webFcmToken: { $nin: [null, ""] } }],
    }).distinct("_id");

    await Promise.all(
      users.map(async (userId) => {
        const user = await User.findById(userId);

        if (user.fcmToken && user.fcmToken !== null) {
          const adminPromise = await admin;

          const payload = {
            token: user.fcmToken,
            notification: {
              title: "🔔 New Video Alert! 🔔",
              body: "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!",
            },
          };

          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response: ", response);

              const notification = new Notification();
              notification.title = "🔔 New Video Alert! 🔔";
              notification.message = "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!";
              notification.user = user?._id;
              notification.image = video.videoImage;
              await notification.save();
            })
            .catch((error) => {
              console.log("Error sending message:      ", error);
            });
        }

        if (user.webFcmToken && user.webFcmToken !== null) {
          const adminPromise = await admin;

          const payload = {
            token: user.webFcmToken,
            notification: {
              title: "🔔 New Video Alert! 🔔",
              body: "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!",
            },
          };

          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response webFcmToken: ", response);

              const notification = new Notification();
              notification.title = "🔔 New Video Alert! 🔔";
              notification.message = "Hey there! We're excited to share our latest video. Don't miss out Click here to watch the video now!";
              notification.user = user?._id;
              notification.image = video?.videoImage;
              await notification.save();
            })
            .catch((error) => {
              console.log("Error sending message :      ", error);
            });
        }
      })
    );
  } catch (error) {
    console.log(error);
    if (req.files) deleteFiles(req.files);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//get particular doctor's videos
exports.videosOfDoctor = async (req, res, next) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).json({ status: false, message: "doctorId must be required." });
    }

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);

    const [doctor, videos] = await Promise.all([
      Doctor.findOne({ _id: doctorId }).lean(),
      Video.aggregate([
        { $match: { doctor: doctorId } },
        {
          $lookup: {
            from: "watchhistories",
            localField: "_id",
            foreignField: "video",
            as: "views",
          },
        },
        {
          $addFields: {
            totalViews: { $size: "$views" },
          },
        },
        {
          $project: {
            _id: 1,
            videoImage: 1,
            videoUrl: 1,
            totalViews: 1,
          },
        },
      ]),
    ]);

    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor does not found." });
    }

    if (doctor.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
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

//get particular doctor's videos details
exports.detailsOfVideo = async (req, res, next) => {
  try {
    if (!req.query.doctorId || !req.query.videoId) {
      return res.status(200).json({ status: false, message: "doctorId must be required." });
    }

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [doctor, video, videos] = await Promise.all([
      Doctor.findOne({ _id: doctorId }).lean(),
      Video.findOne({ _id: videoId }).lean(),
      Video.aggregate([
        { $match: { doctor: doctorId, _id: videoId } },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "likehistoryofvideos",
            localField: "_id",
            foreignField: "video",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "videocomments",
            localField: "_id",
            foreignField: "video",
            as: "comments",
          },
        },
        {
          $addFields: {
            totalLikes: { $size: "$likes" },
            totalComments: { $size: "$comments" },
          },
        },
        {
          $project: {
            videoImage: 1,
            videoUrl: 1,
            description: 1,
            shareCount: 1,
            name: "$doctor.name",
            image: "$doctor.image",
            degree: "$doctor.degree",
            totalLikes: 1,
            totalComments: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    if (!video) {
      return res.status(200).json({ status: false, message: "video does not found." });
    }

    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor does not found." });
    }

    if (doctor.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    return res.status(200).json({
      status: true,
      message: `Retrive videos of the particular doctor.`,
      videos: videos[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete video by doctor
exports.deleteVideo = async (req, res) => {
  try {
    if (!req.query.videoId || !req.query.doctorId) {
      return res.status(200).json({ status: false, message: "videoId must be required." });
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

    res.status(200).json({ status: true, message: "Videos Deleted Successfully." });

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
