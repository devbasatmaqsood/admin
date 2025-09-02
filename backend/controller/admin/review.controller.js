const Review = require("../../models/review.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;
    const search = req.query.search || "";
    let query;

    if (search !== "ALL" && search !== "") {
      const searchRegex = new RegExp(search);
      query = {
        $or: [
          { userName: { $regex: searchRegex, $options: "i" } },
          { doctorName: { $regex: searchRegex, $options: "i" } },
          { appointmentId: { $regex: searchRegex, $options: "i" } },
          { review: { $regex: searchRegex, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$rating" },
                regex: searchRegex,
              },
            },
          },
        ],
      };
    }
    const [reviews, total] = await Promise.all([
      Review.aggregate([
        {
          $sort: { createAt: -1 },
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "appointments",
            localField: "appointment",
            foreignField: "_id",
            as: "appointment",
          },
        },
  
        {
          $unwind: {
            path: "$appointment",
            preserveNullAndEmptyArrays: true,
          },
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
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            review: 1,
            rating: 1,
            user: "$user.name",
            image: "$user.image",
            userImage: "$user.image",
            doctor: "$doctor.name",
            createdAt: 1,
            updatedAt: 1,
            appointmentId: "$appointment.appointmentId",
            createdAt: 1,
          },
        },
        {
          $match: { ...query },
        },
        {
          $skip: skipAmount,
        },
        {
          $limit: limit,
        },
      ]),

      Review.countDocuments({
        ...query,
      }),
    ]);


    const response = {
      status: true,
      message: "Reviews found",
      total: total ? total : 0,
      data: reviews,
    };


    return res.status(200).json({
      status: true,
      message: "Reviews found",
      total: total ? total : 0,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.doctorReview = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;
    if (!req.query.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }
    const [review, total] = await Promise.all([
      Review.find({ doctor: doctor._id })
        .populate({
          path: "doctor",
          select: "name image",
        })
        .skip(skipAmount)
        .limit(limit),
      Review.countDocuments({
        doctor: doctor._id,
      }),
    ]);

    return res.status(200).send({
      status: true,
      message: "Review fetch Successfully !!",
      total,
      data: review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.reviewId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const review = await Review.findById(req.query.reviewId);
    if (!review) {
      return res
        .status(200)
        .send({ status: false, message: "Review Not Exist" });
    }
    await review.deleteOne();
    return res.status(200).send({ status: true, message: "Review Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
