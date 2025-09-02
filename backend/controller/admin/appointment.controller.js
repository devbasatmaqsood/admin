const Appointment = require("../../models/appointment.model");
const Doctor = require("../../models/doctor.model");
const User = require("../../models/user.model");
const Wallet = require("../../models/userWallet.model");
const WalletHistory = require("../../models/userWalletHistory.model");
const UString = require("../../models/uniqueString.model");
const Notification = require("../../models/notification.model");

const moment = require("moment");
const admin = require("../../firebase");

// get all appointment status wise,with analytics
exports.getAppointMent = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    let status;
    if (req.query.status === "ALL") {
      status = "ALL";
    } else {
      status = parseInt(req.query.status);
    }

    if (status != "ALL" && status != 1 && status != 2 && status != 3 && status != 4) {
      return res.status(200).send({ status: false, message: "Invalid appointment Type" });
    }
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    let matchQuery;
    if (status !== "ALL") {
      matchQuery = {
        status,
      };
    }

    const pipeline = [
      { $match: { ...matchQuery, ...dateFilter } },
      { $sort: { date: -1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, name: 1, image: 1 },
          service: 1,
          date: 1,
          time: 1,
          doctor: { _id: 1, name: 1, image: 1 },
          paymentStatus: 1,
          appointmentId: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          adminEarning: 1,
          type: 1,
          service: "$service.name",
          checkInTime: 1,
          checkOutTime: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    let amount = 0;
    let adminEarning = 0;
    let doctorEarning = 0;

    const [appointment, total] = await Promise.all([Appointment.aggregate(pipeline), Appointment.countDocuments({ ...getStatusFilter(status), ...dateFilter })]);

    for (const appointmentData of appointment) {
      amount += appointmentData.amount;
      adminEarning += appointmentData.adminEarning;
      doctorEarning += appointmentData.doctorEarning;
    }
    const totalData = {
      amount: amount.toFixed(2),
      adminEarning: adminEarning.toFixed(2),
      doctorEarning: doctorEarning.toFixed(2),
    };

    return res.status(200).send({
      status: true,
      message: "Success",
      totalData,
      total,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

// get particular user appointment status wise,with analytics
exports.getParticularUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "doctor Not Found" });
    }

    let status;
    if (req.query.status === "ALL") {
      status = "ALL";
    } else {
      status = parseInt(req.query.status);
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res.status(200).send({ status: false, message: "Invalid appointment Type" });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const pipeline = [
      { $match: { user: user._id, ...dateFilter, ...getStatusFilter(status) } },
      { $sort: { date: -1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },

      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, name: 1, image: 1 },
          service: "$service.name",
          date: 1,
          time: 1,
          doctor: { _id: 1, name: 1, image: 1 },
          paymentStatus: 1,
          appointmentId: 1,
          adminEarning: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          type: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const appointment = await Appointment.aggregate(pipeline);
    const total = await Appointment.countDocuments({
      ...getStatusFilter(status),
      user: user._id,
      ...dateFilter,
    });

    return res.status(200).send({ status: true, message: "Success", total, data: appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

// get particular doctor appointment status wise,with analytics
exports.getParticularDoctor = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    let status;
    if (req.query.status === "ALL") {
      status = "ALL";
    } else {
      status = parseInt(req.query.status);
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res.status(200).send({ status: false, message: "Invalid appointment Type" });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const pipeline = [
      {
        $match: {
          doctor: doctor._id,
          ...dateFilter,
          ...getStatusFilter(status),
        },
      },
      { $sort: { date: -1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, name: 1, image: 1 },
          service: "$service.name",
          date: 1,
          time: 1,
          doctor: { _id: 1, name: 1, image: 1 },
          paymentStatus: 1,
          adminEarning: 1,
          appointmentId: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          type: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const appointment = await Appointment.aggregate(pipeline);
    const total = await Appointment.countDocuments({
      ...getStatusFilter(status),
      doctor: doctor._id,
      ...dateFilter,
    });

    let amount;
    let adminEarning;
    let doctorEarning;

    const totalData = appointment.map((a) => {
      amount += a.amount;
      adminEarning += a.adminEarning;
      doctorEarning += a.doctorEarning;
    });

    return res.status(200).send({
      status: true,
      message: "Success",
      total,
      data: appointment,
      totalData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

// cancel appointment by admin
exports.cancelAppointment = async (req, res) => {
  try {
    if (!req.query.appointmentId || !req.query.reason) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }

    const appointment = await Appointment.findById(req.query.appointmentId);
    if (!appointment) {
      return res.status(200).send({ status: false, message: "Appointment not found!" });
    }

    const [user, doctor] = await Promise.all([User.findById(appointment.user), Doctor.findById(appointment.doctor)]);

    if (!user) {
      return res.status(200).send({ status: false, message: "user not found!" });
    }
    const userWallet = await Wallet.findOne({ user: user._id });

    if (!userWallet) {
      return res.status(200).send({
        status: false,
        message: "user wallet details not found!,contact admin for further details",
      });
    }

    if (appointment.status != 1) {
      return res.status(200).send({
        status: false,
        message: "You can only cancel pending appointments!",
      });
    }

    appointment.status = 4;
    appointment.cancel.person = 1;
    appointment.cancel.time = moment().format("HH:mm:ss");
    appointment.cancel.date = moment().format("YYYY-MM-DD");
    appointment.cancel.reason = req.query.reason;
    userWallet.amount += appointment.amount;

    await Promise.all([WalletHistory.findOneAndDelete({ appointment: appointment._id }), UString.findOneAndDelete({ appointment: appointment._id })]);

    const payload2 = {
      token: doctor?.fcmToken,
      notification: {
        body: `Your appointment has been cancelled by admin with appointmentId ${appointment?.appointmentId}.`,
        title: "Appointment cancelled",
      },
      data: {
        appointmentId: appointment.appointmentId,
        reason: req.query.reason,
      },
    };

    const payload = {
      token: user?.fcmToken,
      notification: {
        body: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment cancelled",
      },
      data: {
        appointmentId: appointment.appointmentId,
        reason: req.query.reason,
      },
    };

    const notification = new Notification({
      user: user._id,
      stateType: 5,
      title: "Appointment cancelled",
      message: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    const notification2 = new Notification({
      doctor: doctor._id,
      stateType: 5,
      title: "Appointment cancelled",
      message: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
      notificationType: 2,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await Promise.all([notification.save(), notification2.save(), appointment.save(), userWallet.save(), UString.findOneAndDelete({ appointment: appointment._id })]);

    const adminPromise = await admin;
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (user && user.webFcmToken !== null) {
      try {
        const payload = {
          token: user?.webFcmToken,
          notification: {
            body: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
            title: "Appointment cancelled",
          },
          data: {
            appointmentId: appointment.appointmentId,
            reason: req.query.reason,
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully webFcmToken sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload2);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.webFcmToken !== null) {
      try {
        const payload2 = {
          token: doctor?.webFcmToken,
          notification: {
            body: `Your appointment has been cancelled by admin with appointmentId ${appointment?.appointmentId}.`,
            title: "Appointment cancelled",
          },
          data: {
            appointmentId: appointment.appointmentId,
            reason: req.query.reason,
          },
        };

        const response = await adminPromise.messaging().send(payload2);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status.send({
      status: true,
      message: "Appointment cancel successfully",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// appointment data for daily basis
exports.dailyAppointments = async (req, res) => {
  try {
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const dailyData = await Appointment.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 3,
        },
      },
      {
        $group: {
          _id: "$date",
          totalAmount: { $sum: "$amount" },
          totalTax: { $sum: "$tax" },
          totalWithoutTax: { $sum: "$withoutTax" },
          totalAppointments: { $sum: 1 },
          doctor: { $addToSet: "$doctor" },
          adminEarning: { $sum: "$adminEarning" },
          doctorEarning: { $sum: "$doctorEarning" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: 1,
          totalTax: 1,
          totalWithoutTax: 1,
          totalAppointments: 1,
          doctor: { $size: "$doctor" },
          adminEarning: 1,
          doctorEarning: 1,
        },
      },
      { $sort: { date: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $group: { _id: null, totalRecord: { $sum: 1 } } }],
        },
      },
    ]);

    res.status(200).json({
      status: true,
      message: "success",
      total: dailyData[0].totalCount.length > 0 ? dailyData[0].totalCount[0].totalRecord : 0,
      data: dailyData[0].data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// monthly appointment state for admin
exports.monthlyState = async (req, res) => {
  try {
    const currentYear = moment().format("YYYY");
    const year = req.query.year || currentYear;
    let dateFilter;
    if (year !== "ALL") {
      dateFilter = {
        year: {
          $eq: req.query.year,
        },
      };
    }
    const result = await Appointment.aggregate([
      {
        $addFields: {
          year: { $substr: ["$date", 0, 4] },
        },
      },
      {
        $match: { status: 3, ...dateFilter },
      },
      {
        $addFields: {
          month: { $substr: ["$date", 0, 7] },
        },
      },
      {
        $project: {
          month: "$month",
          doctor: "$doctor",
          amount: "$amount",
          tax: "$tax",
          adminEarning: "$adminEarning",
          withoutTax: "$withoutTax",
          doctorEarning: "$doctorEarning",
        },
      },
      {
        $group: {
          _id: { month: "$month", doctor: "$doctor" },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          tax: { $sum: "$tax" },
          platformFee: { $sum: "$platformFee" },
          withoutTax: { $sum: "$withoutTax" },
          adminEarning: { $sum: "$adminEarning" },
          doctorEarning: { $sum: "$doctorEarning" },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          uniqueDoctors: { $addToSet: "$_id.doctor" },
          completedAppointments: { $sum: "$count" },
          amount: { $sum: "$amount" },
          tax: { $sum: "$tax" },
          doctorEarning: { $sum: "$doctorEarning" },
          withoutTax: { $sum: "$withoutTax" },
          adminEarning: { $sum: "$adminEarning" },
        },
      },

      {
        $project: {
          _id: 0,
          month: "$_id",
          completedAppointments: 1,
          amount: 1,
          doctors: { $size: "$uniqueDoctors" },
          tax: 1,
          doctorEarning: 1,
          adminEarning: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

function getStatusFilter(status) {
  switch (status) {
    case 1:
      return { status: { $in: [1, 2] } };
    case "ALL":
      return {};
    default:
      return { status };
  }
}
