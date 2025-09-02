const Doctor = require("../../models/doctor.model");
const moment = require("moment");
const { deleteFile } = require("../../middleware/deleteFile");
const Appointment = require("../../models/appointment.model");
const DoctorRequest = require("../../models/doctorRequest.model");

exports.checkDoctorRequestStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(200).json({
        status: false,
        message: "Email is required.",
      });
    }

    const doctorRequest = await DoctorRequest.findOne({ email }).select("email status").lean();

    if (!doctorRequest) {
      return res.status(200).json({
        status: false,
        message: "No registration request found for this email.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Doctor request found.",
      data: {
        email: doctorRequest.email,
        status: doctorRequest.status,
      },
    });
  } catch (error) {
    console.error("Check Doctor Request Status error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, fcmToken, webFcmToken, latitude, longitude } = req.body;

    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Oops Invalid Details" });
    }

    const [doctor, doctorRequest] = await Promise.all([Doctor.findOne({ email, password, isDelete: false }), DoctorRequest.findOne({ email, password })]);

    if (doctorRequest) {
      if (doctorRequest.status === 1) {
        return res.status(200).json({
          status: false,
          message: "Your registration request is still pending approval.",
        });
      }

      if (doctorRequest.status === 3) {
        return res.status(200).json({
          status: false,
          message: "Your registration request was rejected.",
        });
      }
    }

    if (doctor) {
      if (doctor.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin!!" });
      }

      doctor.fcmToken = fcmToken || doctor.fcmToken;
      doctor.webFcmToken = webFcmToken || doctor.fcmToken;
      doctor.latitude = latitude || doctor.latitude;
      doctor.longitude = longitude || doctor.longitude;
      await doctor.save();

      return res.status(200).json({
        status: true,
        message: "Finally, doctor login successfully!!",
        data: doctor,
      });
    }

    return res.status(200).send({ status: false, message: "Doctor not found" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
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

    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
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

exports.updateTime = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.day || req.body.isBreak === undefined) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    console.log("req,body", req.body);

    const day = moment(req.query.day, "dddd").format("dddd");

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");

    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }
    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "You are blocked by admin, contact admin for further details",
      });
    }

    const today = moment().format("YYYY-MM-DD");

    const existingAppointments = await Appointment.find({
      doctor: req.query.doctorId,
      date: { $gte: today },
      status: 1,
    });

    const appointmentsWithDay = existingAppointments.map((appointment) => ({
      ...appointment.toObject(),
      dayOfWeek: moment(appointment.date).format("dddd"),
    }));

    console.log("appointmentsWithDay", appointmentsWithDay);

    const weekDay = doctor.schedule.find((time) => time.day === day);

    if (!weekDay) {
      return res.status(200).send({
        status: false,
        message: "Invalid day format or something went wrong",
      });
    }

    const matched = appointmentsWithDay.filter((appointment) => appointment.dayOfWeek === weekDay.day);

    // Count the matched appointments
    const matchedAppointments = matched.length;

    console.log("matchedAppointments", matchedAppointments);

    if (matchedAppointments > 0) {
      return res.status(200).send({
        status: false,
        message: `You have ${matchedAppointments} appointment scheduled on ${day}, please complete or cancel those appointments first to update schedule`,
      });
    }

    const convertTo24HourFormat = (time) => moment(time, ["hh:mm A"]).format("HH:mm");

    const startTime = req.body.startTime ? convertTo24HourFormat(req.body.startTime) : convertTo24HourFormat(weekDay.startTime);
    const endTime = req.body.endTime ? convertTo24HourFormat(req.body.endTime) : convertTo24HourFormat(weekDay.endTime);
    const breakStartTime = req.body.breakStartTime ? convertTo24HourFormat(req.body.breakStartTime) : convertTo24HourFormat(weekDay.breakStartTime);
    const breakEndTime = req.body.breakEndTime ? convertTo24HourFormat(req.body.breakEndTime) : convertTo24HourFormat(weekDay.breakEndTime);

    weekDay.startTime = req.body.startTime ? req.body.startTime : weekDay.startTime;
    weekDay.endTime = req.body.endTime ? req.body.endTime : weekDay.endTime;

    if (req.body.isBreak === false) {
      weekDay.breakStartTime = "";
      weekDay.breakEndTime = "";
      weekDay.isBreak = false;

      if (endTime < startTime) {
        return res.status(200).send({
          status: false,
          message: "End time cannot be before start time.",
        });
      }
    } else {
      weekDay.breakStartTime = req.body.breakStartTime ? req.body.breakStartTime : weekDay.breakStartTime;
      weekDay.breakEndTime = req.body.breakEndTime ? req.body.breakEndTime : weekDay.breakEndTime;
      weekDay.isBreak = true;

      if (breakStartTime < startTime) {
        return res.status(200).send({
          status: false,
          message: "Break start time cannot be before start time.",
        });
      }

      if (breakEndTime < breakStartTime) {
        return res.status(200).send({
          status: false,
          message: "Break end time cannot be before break start time.",
        });
      }

      if (breakEndTime > endTime) {
        return res.status(200).send({
          status: false,
          message: "Break end time cannot be after end time.",
        });
      }

      if (endTime < startTime) {
        return res.status(200).send({
          status: false,
          message: "End time cannot be before start time.",
        });
      }
    }

    weekDay.timeSlot = req.body.timeSlot ? req.body.timeSlot : weekDay.timeSlot;

    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Your schedule updated successfully",
      data: doctor.schedule,
    });
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

    doctor.name = req.body.name || doctor.name;
    doctor.age = req.body.age || doctor.age;
    doctor.mobile = req.body.mobile || doctor.mobile;
    doctor.gender = req.body.gender || doctor.gender;
    doctor.dob = req.body.dob || doctor.dob;
    doctor.country = req.body.country || doctor.country;
    doctor.designation = req.body.designation || doctor.designation;
    doctor.countryCode = req.body.countryCode || doctor.countryCode;

    doctor.service = req.body.service ? req.body.service.split(",") : doctor.service;
    doctor.degree = req.body.degree ? req.body.degree.split(",") : doctor.degree;
    doctor.language = req.body.language ? req.body.language.split(",") : doctor.language;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.charge = req.body.charge || doctor.charge;
    doctor.type = req.body.type || doctor.type;
    doctor.clinicName = req.body.clinicName || doctor.clinicName;
    doctor.address = req.body.address || doctor.address;
    doctor.awards = req.body.awards ? req.body.awards.split(",") : doctor.awards;
    doctor.yourSelf = req.body.yourSelf || doctor.yourSelf;
    doctor.education = req.body.education || doctor.education;

    doctor.expertise = req.body.expertise ? req.body.expertise.split(",") : doctor.expertise;
    doctor.experienceDetails = req.body.experienceDetails ? req.body.experienceDetails.split(",") : doctor.experienceDetails;
    doctor.image = req.file ? process.env.baseURL + req.file.path : doctor.image;
    doctor.latitude = req.body.latitude || doctor.latitude;
    doctor.longitude = req.body.longitude || doctor.longitude;
    doctor.webFcmToken = req.body.webFcmToken || doctor.webFcmToken;
    doctor.fcmToken = req.body.fcmToken || doctor.fcmToken;

    await doctor.save();

    return res.status(200).send({
      status: true,
      message: "Doctor update successfully",
      data: doctor,
    });
  } catch (error) {
    // if (req.file) deleteFile(req.file);
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.day) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const day = moment(req.query.day, "dddd").format("dddd");

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");
    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }
    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    const weekDay = doctor.schedule.find((time) => time.day === day);

    if (!weekDay) {
      return res.status(200).send({
        status: false,
        message: "Invalid day format or something went wrong",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Your schedule update successfully",
      data: weekDay,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.statsByType = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).send({ status: false, message: "DoctorId is required." });
    }

    const formatDate = (date) => date.toISOString().split("T")[0];
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    const currentMonthStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const currentMonthEnd = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    const previousMonthStart = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const previousMonthEnd = formatDate(new Date(today.getFullYear(), today.getMonth(), 0));

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ status: false, message: "Doctor Not Found." });
    }

    const [todayAppointments, yesterdayAppointments, currentMonthAppointments, previousMonthAppointments] = await Promise.all([
      Appointment.find({ doctor: doctorId, date: todayStr }),
      Appointment.find({ doctor: doctorId, date: yesterdayStr }),
      Appointment.find({
        doctor: doctorId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
      Appointment.find({
        doctor: doctorId,
        date: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
    ]);

    const getProgress = (current, previous) => {
      if (previous > 0) {
        const percent = ((current - previous) / previous) * 100;
        return {
          percentage: parseFloat(percent.toFixed(2)),
          type: percent >= 0 ? "increase" : "decrease",
        };
      } else if (current > 0) {
        return { percentage: 100, type: "increase" };
      } else {
        return { percentage: 0, type: "noChange" };
      }
    };

    const dayStats = {
      currentCount: todayAppointments.length,
      previousCount: yesterdayAppointments.length,
      ...getProgress(todayAppointments.length, yesterdayAppointments.length),
    };

    const monthStats = {
      currentCount: currentMonthAppointments.length,
      previousCount: previousMonthAppointments.length,
      ...getProgress(currentMonthAppointments.length, previousMonthAppointments.length),
    };

    return res.status(200).json({
      status: true,
      message: "Stats by day and month",
      data: {
        day: dayStats,
        month: monthStats,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.weeklyStats = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ status: false, message: "DoctorId is required." });
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(today);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setMilliseconds(-1);

    const [currentAppointments, previousAppointments] = await Promise.all([
      Appointment.find({
        doctor: doctorId,
        createdAt: {
          $gte: currentWeekStart.toISOString(),
          $lte: currentWeekEnd.toISOString(),
        },
      }),
      Appointment.find({
        doctor: doctorId,
        createdAt: {
          $gte: previousWeekStart.toISOString(),
          $lte: previousWeekEnd.toISOString(),
        },
      }),
    ]);

    const currentRevenue = currentAppointments.reduce((sum, appt) => sum + (appt.doctorEarning || 0), 0);

    const previousRevenue = previousAppointments.reduce((sum, appt) => sum + (appt.doctorEarning || 0), 0);

    const currentCount = currentAppointments.length;
    const previousCount = previousAppointments.length;

    // Calculate progress for revenue
    let revenueProgress = 0;
    let revenueProgressType = "noChange";
    if (previousRevenue > 0) {
      revenueProgress = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      revenueProgressType = revenueProgress >= 0 ? "increase" : "decrease";
    } else if (currentRevenue > 0) {
      revenueProgress = 100;
      revenueProgressType = "increase";
    }

    // Calculate progress for appointment count
    let countProgress = 0;
    let countProgressType = "noChange";
    if (previousCount > 0) {
      countProgress = ((currentCount - previousCount) / previousCount) * 100;
      countProgressType = countProgress >= 0 ? "increase" : "decrease";
    } else if (currentCount > 0) {
      countProgress = 100;
      countProgressType = "increase";
    }

    return res.status(200).json({
      status: true,
      message: "Weekly stats with revenue and count comparison",
      data: {
        currentWeek: {
          count: currentCount,
          revenue: parseFloat(currentRevenue.toFixed(2)),
        },
        previousWeek: {
          count: previousCount,
          revenue: parseFloat(previousRevenue.toFixed(2)),
        },
        progress: {
          revenuePercentage: parseFloat(revenueProgress.toFixed(2)),
          revenueType: revenueProgressType,
          countPercentage: parseFloat(countProgress.toFixed(2)),
          countType: countProgressType,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.recentAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({
        status: false,
        message: "DoctorId is required in query parameters.",
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId }).sort({ createdAt: -1 }).populate("user", "name image mobile email uniqueId").limit(5).lean();

    return res.status(200).json({
      status: true,
      message: "Success",
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.weeklyDailyBreakdown = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ status: false, message: "DoctorId is required." });
    }

    const today = new Date();
    const dailyStats = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        doctor: doctorId,
        createdAt: { $gte: dayStart.toISOString(), $lte: dayEnd.toISOString() },
      });

      const revenue = appointments.reduce((sum, appt) => sum + (appt.doctorEarning || 0), 0);

      dailyStats.push({
        date: dayStart.toISOString().split("T")[0],
        count: appointments.length,
        revenue: parseFloat(revenue.toFixed(2)),
      });
    }

    return res.status(200).json({
      status: true,
      message: "Daily stats for last 7 days",
      data: dailyStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
