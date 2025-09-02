const Doctor = require("../../models/doctor.model");
const Video = require("../../models/video.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfvideo.model");
const VideoComment = require("../../models/videoComment.model");
const WatchHistory = require("../../models/watchHistory.model");
const Notification = require("../../models/notification.model");

const { deleteFile } = require("../../middleware/deleteFile");
const fs = require("fs");

exports.getAllDoctors = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 25;
    const skipAmount = start * limit;

    let matchQuery;
    const searchString = req.query.search || "";
    if (req.query.search !== "ALL" && req.query.search !== "") {
      const searchRegex = new RegExp(searchString, "i");
      matchQuery = {
        $or: [
          { name: { $regex: searchRegex } },
          { designation: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { clinicName: { $regex: searchRegex } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobile" },
                regex: searchRegex,
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$uniqueId" },
                regex: searchRegex,
              },
            },
          },
        ],
      };
    }

    const [data, total] = await Promise.all([
      Doctor.aggregate([
        {
          $match: { isDelete: false, ...matchQuery },
        },
        {
          $lookup: {
            from: "services",
            localField: "service",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $skip: skipAmount,
        },
        {
          $limit: limit,
        },
      ]),
      Doctor.countDocuments({
        isDelete: false,
        ...matchQuery,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Data found",
      total,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getDoctorDropDown = async (req, res) => {
  try {
    const data = await Doctor.find({ isDelete: false }).select("_id name").lean();
    return res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    })
      .populate("service")
      .lean();
    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    return res.status(200).send({
      status: true,
      message: "Doctor found successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.blockUnblock = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");
    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    doctor.isBlock = !doctor.isBlock;
    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Doctor update successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res.status(200).send({ status: false, message: "DoctorId is required" });
    }

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");

    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    doctor.isDelete = true;
    await doctor.save();

    res.status(200).send({
      status: true,
      message: "Doctor delete successfully",
    });

    const [videos, notifications] = await Promise.all([Video.find({ doctor: doctor._id }), Notification.find({ doctor: doctor._id })]);

    for (const video of videos) {
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
    }

    for (const notification of notifications) {
      const image = notification?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      await Notification.deleteOne({ _id: notification._id });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({ status: false, message: "DoctorId is required" });
    }

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");

    if (!doctor) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    doctor.name = req.body.name ? req.body.name : doctor.name;
    doctor.age = req.body.age ? req.body.age : doctor.age;
    doctor.mobile = req.body.mobile ? req.body.mobile : doctor.mobile;
    doctor.gender = req.body.gender ? req.body.gender : doctor.gender;
    doctor.dob = req.body.dob ? req.body.dob : doctor.dob;
    doctor.country = req.body.country ? req.body.country : doctor.country;
    doctor.designation = req.body.designation ? req.body.designation : doctor.designation;
    doctor.service = req.body.service ? req.body.service.split(",") : doctor.service;
    doctor.degree = req.body.degree ? req.body.degree.split(",") : doctor.degree;
    doctor.language = req.body.language ? req.body.language.split(",") : doctor.language;
    doctor.experience = req.body.experience ? req.body.experience : doctor.experience;
    doctor.charge = req.body.charge ? req.body.charge : doctor.charge;
    doctor.type = req.body.type ? req.body.type : doctor.type;
    doctor.clinicName = req.body.clinicName ? req.body.clinicName : doctor.clinicName;
    doctor.address = req.body.address ? req.body.address : doctor.address;
    doctor.awards = req.body.awards ? req.body.awards.split(",") : doctor.awards;
    doctor.yourSelf = req.body.yourSelf ? req.body.yourSelf : doctor.yourSelf;
    doctor.education = req.body.education ? req.body.education : doctor.education;
    doctor.experienceDetails = req.body.experienceDetails ? req.body.experienceDetails.split(",") : doctor.experienceDetails;
    doctor.image = req.file ? process.env.baseURL + req.file.path : doctor.image;
    doctor.commission = req.body.commission ? req.body.commission : doctor.commission;
    doctor.email = req.body.email ? req.body.email.trim() : doctor.email;

    await doctor.save();

    return res.status(200).send({
      status: true,
      message: "Doctor update successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
