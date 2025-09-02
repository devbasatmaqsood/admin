const Video = require("../../models/video.model");
const User = require("../../models/user.model");
const VideoComment = require("../../models/videoComment.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfvideo.model");
const WatchHistory = require("../../models/watchHistory.model");
const Doctor = require("../../models/doctor.model");
const Notification = require("../../models/notification.model");

const admin = require("../../firebase");
const mongoose = require("mongoose");
const dayjs = require("dayjs");

//get all videos of doctors
exports.doctorVideos = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let userId;

    if (req.query.userId && req.query.userId != null) {
      userId = new mongoose.Types.ObjectId(req.query.userId);

      const user = await User.findOne({ _id: userId }).lean();

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found.", data: [] });
      }

      if (user.isBlock) {
        return res.status(200).json({
          status: false,
          message: "You are blocked by the admin.",
          data: [],
        });
      }
    }

    const videos = await Video.aggregate([
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
        $match: {
          "doctor.isDelete": false,
        },
      },
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
          isLike: userId ? { $in: [userId, "$likes.user"] } : false,
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
          isCommentAllowed: 1,
          doctorId: "$doctor._id",
          name: "$doctor.name",
          image: "$doctor.image",
          degree: "$doctor.degree",
          isLike: 1,
          totalLikes: 1,
          totalComments: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: start * limit },
      { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "Videos of the particular user.",
      data: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//like or dislike of particular video by the particular user
exports.likeOrDislikeOfVideo = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.videoId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [user, video, alreadylikedVideo] = await Promise.all([
      User.findOne({ _id: userId }),
      Video.findById(videoId),
      LikeHistoryOfVideo.findOne({
        user: userId,
        video: videoId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found." });
    }

    if (alreadylikedVideo) {
      await LikeHistoryOfVideo.deleteOne({
        user: user._id,
        video: video._id,
      });

      return res.status(200).json({
        status: true,
        message: "The Video was marked with a dislike by the user.",
        isLike: false,
      });
    } else {
      console.log("else");

      const likeHistory = new LikeHistoryOfVideo();
      likeHistory.user = user._id;
      likeHistory.video = video._id;
      await likeHistory.save();

      res.status(200).json({
        status: true,
        message: "The Video was marked with a like by the user.",
        isLike: true,
      });

      const doctor = await Doctor.findOne({ _id: video?.doctor });

      //checks if the doctor has an fcmToken
      if (doctor && doctor.fcmToken && doctor.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: doctor.fcmToken,
          notification: {
            title: "🔔 Video Liked Alert! 🔔",
            body: "Hey there! A user has just liked your video. Check it out now!",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.title = "🔔 Video Liked Alert! 🔔";
            notification.message = "Hey there! A user has just liked your video. Check it out now!";
            notification.user = user?._id;
            notification.image = video.videoImage;
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }

      if (doctor && doctor.webFcmToken && doctor.webFcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: doctor.webFcmToken,
          notification: {
            title: "🔔 Video Liked Alert! 🔔",
            body: "Hey there! A user has just liked your video. Check it out now!",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.title = "🔔 Video Liked Alert! 🔔";
            notification.message = "Hey there! A user has just liked your video. Check it out now!";
            notification.user = user?._id;
            notification.image = video.videoImage;
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//when user share the video then shareCount of the particular video increased
exports.shareCountOfVideo = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.videoId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [user, video] = await Promise.all([User.findOne({ _id: userId }), Video.findById(videoId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found." });
    }

    video.shareCount += 1;
    await video.save();

    return res.status(200).json({
      status: true,
      message: "video has been shared by the user then shareCount has been increased.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//create comment of particular video by user
exports.commentOfVideo = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.commentText || !req.query.videoId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [user, video] = await Promise.all([User.findOne({ _id: userId }), Video.findOne({ _id: videoId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "video does not found." });
    }

    if (!video.isCommentAllowed) {
      return res.status(200).json({
        status: false,
        message: "You do not have permission to comment on this video.",
      });
    }

    const videoComment = await VideoComment.create({
      user: userId,
      video: videoId,
      commentText: req.query.commentText.trim(),
    });

    return res.status(200).json({
      status: true,
      message: "Comment passed on video by that user.",
      data: videoComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//when user view the video create watchHistory of the particular video
exports.createWatchHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.videoId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [user, video] = await Promise.all([User.findOne({ _id: userId }), Video.findOne({ _id: videoId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!video) {
      return res.status(200).json({ status: false, message: "video does not found." });
    }

    const watchHistory = new WatchHistory();
    watchHistory.user = user._id;
    watchHistory.video = video._id;
    await watchHistory.save();

    return res.status(200).json({
      status: true,
      message: "When user view the video then created watchHistory for that video.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get all comments for particular video by user or doctor
exports.getvideoComments = async (req, res) => {
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
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive Comments for particular video.",
      data: videoComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
