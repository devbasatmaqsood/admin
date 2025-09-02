require("dotenv").config();
const Appointment = require("../../models/appointment.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const moment  = require('moment')




// get various stats for dashboard
exports.allStats = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const [appointments, users, doctors] = await Promise.all([
      Appointment.find({ status: 3, ...dateFilter }),
      User.find({ isDelete: false }),
      Doctor.find({ isBlock: false, isDelete: false }),
    ]);

    let totalAmount = 0;
    appointments.forEach((data) => {
      totalAmount += data?.adminEarning;
    });

    let totalRevenue = 0;
    appointments.forEach((booking) => {
      totalRevenue += booking.amount;
    });

    const totalUsers = users.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;

    const data = {
      earning: totalAmount,
      appointments: totalAppointments,
      revenue: totalRevenue,
      users: totalUsers,
      doctors: totalDoctors,
    };

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};


// chart api for penal
exports.chartApiForPenal = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          status: 3,
          ...dateFilter,
        },
      },

      {
        $group: {
          _id: "$date",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
          serviceIds: { $addToSet: "$service" },
        },
      },
      {
        $addFields: {
          services: { $size: "$serviceIds" },
          revenue: { $toInt: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          amount: 1,
          count: 1,
          services: 1,
          revenue: { $round: ["$revenue", 2] },
          amount: 1,
          date: "$_id",
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res
      .status(200)
      .send({ status: true, message: "success", data: appointments });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};


// top doctors by revenue
exports.topDoctors = async (req, res) => {
  try {
    let dateFilter = {};

    if (req?.query?.startDate != "ALL" && req?.query?.endDate != "ALL") {
      const startDate = req?.query?.startDate;
      const endDate = req?.query?.endDate;
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const doctors = await Appointment.aggregate([
      {
        $match: { status: 3, ...dateFilter },
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
        $group: {
          _id: "$doctor",
          amount: { $sum: "$amount" },
          adminEarning: { $sum: "$adminEarning" },
          doctorEarning: { $sum: "$doctorEarning" },
          appointment: { $sum: 1 },
        },
      },
      {
        $project: {
          doctorId: { $arrayElemAt: ["$_id._id", 0] },
          name: { $arrayElemAt: ["$_id.name", 0] },
          doctorImage: { $arrayElemAt: ["$_id.image", 0] },
          adminEarning: 1,
          doctorEarning: 1,
          appointment: 1,
          amount: 1,
          _id: 0,
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    return res
      .status(200)
      .json({ status: true, message: "success", data: doctors });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};


// upcoming today's appointments
exports.upcomingBookings = async (req, res) => {
  try {
    const { type } = req.query;

    const todayDate = moment().format("YYYY-MM-DD");

    let appointments = await Appointment.find({
      date: todayDate,
      status: 1,
    })
      .populate({
        path: "user",
        select: "name image",
      })
      .populate({
        path: "doctor",
        select: "name image",
      })
      .populate({
        path: "service",
        select: "name image",
      })
      .sort({ time: 1 });

    let bookings;

    if (type == "1") {
      bookings = appointments.slice(0, 5);
    } else bookings = appointments;

    return res
      .status(200)
      .send({ status: true, message: "success", data: bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
