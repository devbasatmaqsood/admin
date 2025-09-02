const Review = require("../../models/review.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const Appointment = require("../../models/appointment.model");
const CallHistory = require("../../models/callHistory.model");

exports.postReview = async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.rating) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    if (req.body.type === 1) {
      if (!req.body.appointmentId) {
        return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
      }

      const appointment = await Appointment.findOne({
        appointmentId: req.body.appointmentId,
      });
      if (!appointment) {
        return res.status(200).send({ status: false, message: "appointment Not Found!!" });
      }

      if (appointment.isReviewed) {
        return res.status(200).send({
          status: false,
          message: "You already submitted review for this appointment!!",
        });
      }
      if (appointment.status !== 3) {
        return res.status(200).send({
          status: false,
          message: "This appointment ss not completed yet!!",
        });
      }

      const doctor = await Doctor.findOne({ _id: appointment.doctor });

      if (!doctor) {
        return res.status(200).send({ status: false, message: "doctor Not Found!!" });
      }

      if (parseInt(req.body.rating) > 5 || req.body.rating < 1) {
        return res.status(200).send({ status: false, message: "Invalid Rating!!" });
      }

      const totalDoctorReviewAmount = doctor.rating * doctor.reviewCount;
      doctor.reviewCount += 1;
      doctor.rating = (totalDoctorReviewAmount + req.body.rating) / doctor.reviewCount;

      const review = new Review();
      review.appointment = appointment?._id;
      review.user = appointment.user;
      review.doctor = appointment.doctor;
      review.review = req.body.review ? req.body.review : "";
      review.rating = req.body.rating;

      appointment.isReviewed = true;
      await Promise.all([doctor.save(), appointment.save(), review.save()]);

      const data = await Review.findById(review._id).populate([
        { path: "user", select: "name image" },
        {
          path: "appointment",
          select: "time serviceId _id isReviewed paymentStatus amount",
        },
        { path: "doctor", select: "name image" },
      ]);

      return res.status(200).send({
        status: true,
        message: "Review Created Successful !!",
        review: data,
      });
    } else if (req.body.type === 2) {
      if (!req.body.doctorId || !req.body.userId) {
        return res.status(200).send({ status: false, message: "Invalid details" });
      }

      const [user, doctor] = await Promise.all([User.findOne({ _id: req.body.userId }), Doctor.findOne({ _id: req.body.doctorId })]);

      if (!user) {
        return res.status(200).send({ status: false, message: "User Not Found!!" });
      }

      if (!doctor) {
        return res.status(200).send({ status: false, message: "Doctor Not Found!!" });
      }

      const callHistory = await CallHistory.find({
        doctor: doctor._id,
        user: user._id,
      }).sort({ createdAt: -1 });

      const totalDoctorReviewAmount = doctor.rating * doctor.reviewCount;
      doctor.reviewCount += 1;
      doctor.rating = (totalDoctorReviewAmount + req.body.rating) / doctor.reviewCount;

      const review = new Review();
      review.user = user._id;
      review.doctor = doctor._id;
      review.review = req.body.review ? req.body.review : "";
      review.rating = req.body.rating;
      review.callId = callHistory[0].callId;
      await Promise.all([doctor.save(), review.save()]);

      return res.status(200).send({
        status: true,
        message: "Review Created Successful !!",
        data: review,
      });
    } else {
      return res.status(200).send({ status: false, message: "Invalid type" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.doctorReview = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;
    if (!req.query.doctorId) {
      return res.status(400).json({ status: false, message: "DoctorId is required" });
    }

    let dateFilter = {};

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    if (startDate !== "ALL" && endDate !== "ALL") {
      dateFilter = {
        createdAt: {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
    }

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");

    if (!doctor) {
      return res.status(404).json({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).json({
        status: false,
        message: "You are blocked by admin, contact admin for further details",
      });
    }

    const [reviews, total] = await Promise.all([
      Review.find({ doctor: doctor._id, ...dateFilter })
        .populate({
          path: "doctor",
          select: "name image",
        })
        .populate({
          path: "user",
          select: "name image",
        })
        .skip(skipAmount)
        .limit(limit),
      Review.countDocuments({ doctor: doctor._id, ...dateFilter }),
    ]);

    const formattedReviews = reviews.map((review) => {
      const createdAt = new Date(review.createdAt);
      const now = new Date();
      const diffMs = now - createdAt;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = diffDays / 365;

      if (diffDays < 1) {
        review.relativeTime = "just now";
      } else if (diffDays === 1) {
        review.relativeTime = "1 day ago";
      } else if (diffDays < 30) {
        review.relativeTime = `${diffDays} days ago`;
      } else if (diffMonths === 1) {
        review.relativeTime = "1 month ago";
      } else if (diffMonths < 12) {
        review.relativeTime = `${diffMonths} months ago`;
      } else if (diffYears === 1) {
        review.relativeTime = "1 year ago";
      } else {
        review.relativeTime = `${diffYears.toFixed(1)} years ago`;
      }

      return review;
    });

    return res.status(200).json({
      status: true,
      message: "Review fetch Successfully !!",
      total,
      data: formattedReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
