const Appointment = require("../../models/appointment.model");
const Doctor = require("../../models/doctor.model");
const User = require("../../models/user.model");
const Holiday = require("../../models/doctorHoliday.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Wallet = require("../../models/userWallet.model");
const DoctorWalletHistory = require("../../models/doctorWalletHistory.model");
const WalletHistory = require("../../models/userWalletHistory.model");
const UString = require("../../models/uniqueString.model");
const admin = require("../../firebase");
const Notification = require("../../models/notification.model");

const moment = require("moment");

exports.appointMentForDoctor = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor Not Found" });
    }

    const status = parseInt(req.query.status);

    const search = req.query.search || "";
    const searchQuery = {};

    if (search !== "ALL" && search !== "") {
      const searchRegex = new RegExp(search, "i");

      searchQuery.$or = [
        { "user.name": { $regex: searchRegex } },
        { "user.email": { $regex: searchRegex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$user.mobile" },
              regex: searchRegex,
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$user.uniqueId" },
              regex: searchRegex,
            },
          },
        },
      ];
    }

    if (status && status !== 1 && status !== 3 && status !== 4) {
      return res.status(200).send({ status: false, message: "Invalid appointment Type" });
    }

    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      if (req.query.startDate != "ALL" && req.query.endDate != "ALL") {
        dateFilter = {
          date: {
            $gte: req.query.startDate,
            $lte: req.query.endDate,
          },
        };
      }
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const pipeline = [
      { $match: { doctor: doctor._id, ...dateFilter } },
      { $match: getStatusFilter(status) },
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
      { $match: searchQuery },
      //   {
      //     $lookup: {
      //       from: "doctors",
      //       localField: "doctor",
      //       foreignField: "_id",
      //       as: "doctor",
      //     },
      //   },
      //   { $unwind: "$doctor" },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      { $sort: { date: -1, time: 1 } },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, name: 1, image: 1, gender: 1, email: 1, mobile: 1 },
          service: 1,
          date: 1,
          time: 1,
          paymentStatus: 1,
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

    const totalPipeline = [
      { $match: { doctor: doctor._id, ...dateFilter } },
      { $match: getStatusFilter(status) },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: searchQuery },
    ];

    const [appointment, total] = await Promise.all([Appointment.aggregate(pipeline), Appointment.aggregate(totalPipeline)]);

    return res.status(200).send({
      status: true,
      message: "Success",
      data: appointment,
      total: total?.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.appointmentTypeStatusWise = async (req, res) => {
  try {
    const { type, status, doctorId, month } = req.query;

    // type 1 = today, 2 = yesterday, 3 = this week, 4 = this month
    if (type) {
      if (type != 1 && type != 2 && type != 3 && type != 4) {
        return res.status(200).send({ status: false, message: "Invalid Type" });
      }
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res.status(200).send({ status: false, message: "Invalid appointment Status" });
    }

    if (!doctorId || !status || !month) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const currentMonth = moment().format("YYYY-MM");
    if (month == currentMonth) {
      if (!type) {
        return res.status(200).send({ status: false, message: "Type is required" });
      }
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor Not Found" });
    }

    let dateFilterQuery = {};

    if (type == 1) {
      const startOfDay = moment().startOf("day");
      const endOfDay = moment().endOf("day");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 2) {
      const startOfDay = moment().startOf("day").subtract(1, "days");
      const endOfDay = moment().endOf("day").subtract(1, "days");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 3) {
      const startOfDay = moment().startOf("week");
      const endOfDay = moment().endOf("week");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 4) {
      const startOfDay = moment().startOf("month");
      const endOfDay = moment().endOf("month");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (!type && month) {
      const startOfMonth = moment(month, "YYYY-MM").startOf("month");
      const endOfMonth = moment(month, "YYYY-MM").endOf("month");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) },
      };
    }

    if (status == "ALL") {
      statusQuery = { $in: [1, 2, 3, 4] };
    } else if (status == 1) {
      statusQuery = { $in: [1, 2] };
    } else if (status == 3) {
      statusQuery = 3;
    } else if (status == 4) {
      statusQuery = 4;
    } else {
      return res.status(200).send({ status: false, message: "Invalid Type" });
    }

    const data = await Appointment.aggregate([
      {
        $addFields: {
          analytic: { $toDate: "$date" },
        },
      },
      {
        $match: {
          doctor: doctor._id,
          $or: [{ status: statusQuery }, { status: { $eq: statusQuery } }],
          ...dateFilterQuery,
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "services",
        },
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
        $facet: {
          pendingAppointment: [
            {
              $match: { status: 1 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
          completedAppointment: [
            {
              $match: { status: 3 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                amount: { $sum: "$doctorEarning" },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
          cancelAppointment: [
            {
              $match: { status: 4 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
        },
      },
    ]);

    const stats = {
      amount: data[0]?.completedAppointment[0]?.amount || 0,
      pendingAppointment: data[0]?.pendingAppointment[0]?.total || 0,
      completedAppointment: data[0]?.completedAppointment[0]?.total || 0,
      cancelAppointment: data[0]?.cancelAppointment[0]?.total || 0,
      pendingAppointmentsArray: data[0]?.pendingAppointment[0]?.appointments || [],
      completedAppointmentsArray: data[0]?.completedAppointment[0]?.appointments || [],
      cancelledAppointmentsArray: data[0]?.cancelAppointment[0]?.appointments || [],
    };

    return res.status(200).send({
      status: true,
      message: "Success",
      data: stats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.query;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(200).send({ status: false, message: "Appointment not found" });
    }

    const [user, doctor] = await Promise.all([User.findById(appointment.user), Doctor.findById(appointment.doctor)]);

    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    if (!user) {
      return res.status(200).send({ status: false, message: "user not found" });
    }

    if (appointment.status !== 1) {
      return res.status(200).send({ status: false, message: "This appointment is not pending" });
    }

    const existingActiveAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: 2, // Status 2 => Check-in or Active
      _id: { $ne: appointment._id }, // exclude current appointment
    });

    if (existingActiveAppointment) {
      return res.status(200).send({
        status: false,
        message: `Doctor already has an ongoing appointment (ID: ${existingActiveAppointment.appointmentId}). Please complete or check-out that appointment before checking in another.`,
      });
    }

    res.status(200).send({ status: true, message: "Patient successfully check In" });

    appointment.status = 2;
    appointment.checkInTime = moment().format("hh:mm A");

    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment is Starting soon by doctor with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment time is starting",
      },
    };

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
          token: user.webFcmToken,
          notification: {
            body: `Your appointment is Starting soon by doctor with appointmentId ${appointment.appointmentId}.`,
            title: "Appointment time is starting",
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    await appointment.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.query;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(200).send({ status: false, message: "Appointment not found" });
    }

    const [user, doctor] = await Promise.all([await User.findById(appointment.user), await Doctor.findById(appointment.doctor)]);

    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor not found" });
    }

    if (!user) {
      return res.status(200).send({ status: false, message: "user not found" });
    }

    appointment.status = 3;
    appointment.checkOutTime = moment().format("hh:mm A");

    doctor.wallet += appointment.doctorEarning;
    doctor.totalWallet += appointment.doctorEarning;

    doctor.patients += 1;

    const doctorWallet = await DoctorWalletHistory.create({
      amount: appointment.doctorEarning,
      doctor: doctor._id,
      appointment: appointment._id,
      type: 1,
    });

    await Promise.all([appointment.save(), doctor.save(), doctorWallet.save(), UString.findOneAndDelete({ appointment: appointment._id })]);

    res.status(200).send({ status: true, message: "Patient successfully check out" });

    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment is completed by doctor with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment completed",
      },
    };

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
          token: user.webFcmToken,
          notification: {
            body: `Your appointment is completed by doctor with appointmentId ${appointment.appointmentId}.`,
            title: "Appointment completed",
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully webFcmToken sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    if (!req.query.appointmentId || !req.query.reason) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }

    const appointment = await Appointment.findById(req.query.appointmentId);
    if (!appointment) {
      return res.status(200).send({ status: false, message: "Appointment not found!" });
    }

    const user = await User.findById(appointment.user);
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
    appointment.cancel.person = 3;
    appointment.cancel.time = moment().format("HH:mm:ss");
    appointment.cancel.date = moment().format("YYYY-MM-DD");
    appointment.cancel.reason = req.query.reason;
    userWallet.amount += appointment.amount;

    await Promise.all([WalletHistory.findOneAndDelete({ appointment: appointment._id }), UString.findOneAndDelete({ appointment: appointment._id })]);

    await Promise.all([appointment.save(), userWallet.save(), UString.findOneAndDelete({ appointment: appointment._id })]);

    res.status(200).send({
      status: true,
      message: "Appointment cancel successfully",
      data: appointment,
    });

    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment cancelled",
      },
    };

    const notification = new Notification({
      user: user._id,
      title: "Appointment cancelled",
      message: `Your appointment has been cancelled by doctor with appointmentId ${appointment.appointmentId}.`,
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await notification.save();

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
          token: user.webFcmToken,
          notification: {
            body: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
            title: "Appointment cancelled",
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully webFcmToken sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
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

exports.checkDates = async (req, res) => {
  try {
    if (!req.query.date || !req.query.doctorId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }
    const dayOfWeek = moment(req.query.date).format("dddd");

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor Not Found!!!" });
    }
    const holiday = await Holiday.findOne({
      date: req.query.date,
      doctor: doctor._id,
    }).lean();

    if (holiday) {
      return res.status(200).send({
        status: true,
        timeSlots: [],
        isOpen: false,
        message: "Doctor is not available !!!",
      });
    }

    const appointmentDay = doctor.schedule.find((time) => time.day == dayOfWeek);
    console.log("appointmentDay", appointmentDay);
    if (!appointmentDay) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available this day!!!",
      });
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          status: { $in: [1, 2] },
          date: req.query.date,
        },
      },
    ]);

    const timeSlots = [].concat(...appointments.map((appointment) => appointment.time));
    const busyDoctor = await DoctorBusy.findOne({
      doctor: doctor._id,
      date: req.query.date,
    });
    const mergedTimeSlots = busyDoctor ? [...timeSlots, ...busyDoctor.time] : timeSlots;

    return res.status(200).send({
      status: true,
      message: "success",
      data: mergedTimeSlots,
      appointmentDay,
      isOpen: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    if (!req.query.appointmentId) {
      return res.status(200).send({
        status: false,
        message: "Invalid Details",
      });
    }

    const appointment = await Appointment.findById(req.query.appointmentId)
      .populate({
        path: "user",
        select: "name image email phone address city state country mobile",
      })
      .populate({
        path: "doctor",
        select: "latitude longitude service",
        populate: {
          path: "service",
          select: "name",
        },
      })
      .populate("patient")
      .lean();

    if (!appointment) {
      return res.status(200).send({
        status: false,
        message: "appointment not found",
      });
    }
    return res.status(200).send({
      status: true,
      message: "Success",
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

exports.upcomingBookings = async (req, res) => {
  try {
    const { type } = req.query;

    const todayDate = moment().format("YYYY-MM-DD");
    const user = await User.findById(req.query.userId);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    let appointments = await Appointment.find({
      date: todayDate,
      status: 1,
      user: user._id,
    })
      .populate({
        path: "user",
        select: "name image gender name mobile email",
      })
      .populate({
        path: "doctor",
        select: "name image degree designation gender mobile email",
      })
      .populate({
        path: "service",
        select: "name image",
      })
      .sort({ time: 1 })
      .lean();

    return res.status(200).send({ status: true, message: "success", data: appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAppointmentCountsByStatus = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;

    if (!doctorId || !startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message: "DoctorappointmentId, startDate, and endDate are required.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: false,
        message: "Doctorappointment Not Found.",
      });
    }

    // Build dynamic match stage
    const matchStage = { doctor: doctor._id };

    // Apply date range only if both are not "ALL"
    if (startDate !== "All" && endDate !== "All") {
      matchStage.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const counts = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      1: "PENDING",
      2: "CONFIRM",
      3: "COMPLETE",
      4: "CANCEL",
    };

    const result = {
      PENDING: 0,
      CONFIRM: 0,
      COMPLETE: 0,
      CANCEL: 0,
    };

    counts.forEach(({ _id, count }) => {
      const key = statusMap[_id];
      if (key) result[key] = count;
    });

    return res.status(200).json({
      status: true,
      message: "Appointment counts by status",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.nextAppointment = async (req, res) => {
  try {
    const { doctorId, time } = req.query;

    if (!doctorId) {
      return res.status(400).json({ status: false, message: "ExpertId is required." });
    }

    const moment = require("moment");

    const today = moment().format("YYYY-MM-DD"); // e.g., "2025-05-01"

    // Full datetime moment object for current time or provided time
    const now = time ? moment(`${today} ${time}`, "YYYY-MM-DD HH:mm") : moment();

    // Fetch today's appointments
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: today,
      status: 1,
    }).populate("user", "name image mobile email uniqueId");

    // Filter and sort upcoming appointments
    const upcomingAppointments = appointments
      .filter((app) => moment(`${today} ${app.time}`, "YYYY-MM-DD HH:mm").isAfter(now))
      .sort((a, b) => {
        const timeA = moment(`${today} ${a.time}`, "YYYY-MM-DD HH:mm");
        const timeB = moment(`${today} ${b.time}`, "YYYY-MM-DD HH:mm");
        return timeA.diff(timeB);
      });

    return res.status(200).json({
      status: true,
      message: "Next upcoming appointment",
      data: upcomingAppointments || {},
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
