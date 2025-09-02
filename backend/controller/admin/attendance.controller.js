const Attendance = require("../../models/attendance.model");
const Doctor = require('../../models/doctor.model')
const Appointment = require('../../models/appointment.model')
const moment = require("moment");


// get attendance details of doctors in a month for admin
exports.getAttendance = async (req, res) => {
  try {
    const doctorId = req.query.doctorId || "ALL"
    if (!req.query.month) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details " });
    }
    let matchQuery;
    if (doctorId !== "ALL") {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res
          .status(200)
          .json({ status: false, message: "doctor not Found" });
      }
      matchQuery = {
        doctor: doctor._id,
      };
    }

    const attendances = await Attendance.aggregate([
      {
        $match: {
          month: req.query.month,
          ...matchQuery,
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
        $unwind: "$doctor",
      },
      {
        $match: {
          "doctor.isDelete": false,
        },
      },

      {
        $project: {
          _id: 1,
          month: 1,
          attendCount: 1,
          absentCount: 1,
          totalDays: 1,
          attendDates: 1,
          absentDates: 1,
          doctor: {
            name: "$doctor.name",
            _id: "$doctor._id",
            image: "$doctor.image",
          },
        },
      },
    ]);

    return res.status(200).json({ status: true, data: attendances });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
