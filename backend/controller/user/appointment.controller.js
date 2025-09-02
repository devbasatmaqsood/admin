const Appointment = require("../../models/appointment.model");
const Doctor = require("../../models/doctor.model");
const setting = require("../../setting");
const User = require("../../models/user.model");
const Service = require("../../models/service.model");
const Holiday = require("../../models/doctorHoliday.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Wallet = require("../../models/userWallet.model");
const Coupon = require("../../models/coupon.model");
const SubPatient = require("../../models/subPatient.model");
const WalletHistory = require("../../models/userWalletHistory.model");
const UString = require("../../models/uniqueString.model");
const Notification = require("../../models/notification.model");

const admin = require("../../firebase");
const mongoose = require("mongoose");
const moment = require("moment");

exports.checkDates = async (req, res) => {
  try {
    const { date, doctorId } = req.query;

    if (!date || !doctorId) {
      return res.status(200).send({
        status: false,
        message: "Oops Invalid Details!!",
      });
    }

    const dayOfWeek = moment(date).format("dddd");

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDelete: false,
    });

    if (!doctor) {
      return res.status(200).send({
        status: false,
        message: "Doctor Not Found!!!",
      });
    }

    const holiday = await Holiday.findOne({
      date: date,
      doctor: doctor._id,
    });

    if (holiday) {
      return res.status(200).send({
        status: true,
        timeSlots: [],
        isOpen: false,
        message: "Doctor is not available !!!",
      });
    }

    const appointmentDay = doctor.schedule.find((time) => time.day === dayOfWeek);

    if (!appointmentDay) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available this day!!!",
      });
    }

    const generateTimeSlots = (startTime, endTime, slotSize) => {
      const slots = [];
      let start = moment(startTime, "hh:mm A");
      const end = moment(endTime, "hh:mm A");

      while (start < end) {
        slots.push(start.format("hh:mm A"));
        start.add(slotSize, "minutes");
      }
      return slots;
    };

    const { startTime, endTime, breakStartTime, breakEndTime, timeSlot, isBreak } = appointmentDay;

    const morningSlots = isBreak ? generateTimeSlots(startTime, breakStartTime.trim(), timeSlot) : generateTimeSlots(startTime, endTime.trim(), timeSlot);

    const eveningSlots = isBreak ? generateTimeSlots(breakEndTime.trim(), endTime, timeSlot) : [];

    const managedSlots = {
      morning: morningSlots,
      evening: eveningSlots,
    };

    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          status: { $in: [1, 2] },
          date: date,
        },
      },
      {
        $project: {
          time: 1,
        },
      },
    ]);

    const busySlots = appointments.flatMap((appointment) => appointment.time);

    const busyDoctor = await DoctorBusy.findOne({
      doctor: doctor._id,
      date: date,
    });

    const mergedBusySlots = busyDoctor ? [...busySlots, ...busyDoctor.time] : busySlots;

    return res.status(200).send({
      status: true,
      allSlot: managedSlots,
      busySlots: mergedBusySlots,
      isOpen: true,
      isBreak,
      message: "Doctor is available",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { paymentType, serviceId, userId, doctorId, date, time, amount, withoutTax, duration, type, patient, details } = req.body;

    if (
      !serviceId ||
      !userId ||
      !doctorId ||
      !date ||
      !time ||
      !amount ||
      !withoutTax ||
      // !duration ||
      !type ||
      !paymentType ||
      !patient
    ) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    const today = moment().format("YYYY-MM-DD");

    const [user, doctor, service, wallet] = await Promise.all([
      User.findOne({ _id: userId }),
      Doctor.findOne({ _id: doctorId }),
      Service.findOne({ _id: serviceId, status: true }),
      Wallet.findOne({ user: userId }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: "User is blocked. Please contact admin",
      });
    }

    if (paymentType.trim().toLowerCase() === "wallet") {
      if (!wallet) {
        return res.status(200).send({ status: false, message: "User wallet data not found" });
      }

      if (wallet.amount < amount) {
        return res.status(200).send({
          status: false,
          message: "Insufficient fund to book this appointment",
        });
      }
    }

    if (!doctor || doctor.isBlock) {
      return res.status(200).send({ status: false, message: "doctor not found" });
    }

    if (!service) {
      return res.status(200).send({ status: false, message: "Service not found" });
    }

    let subPatient;
    if (patient !== "self") {
      const patientId = new mongoose.Types.ObjectId(patient);
      subPatient = await SubPatient.findById(patientId);

      if (!subPatient) {
        return res.status(200).send({ status: false, message: "Patient not found" });
      }

      if (!subPatient.user.equals(user._id)) {
        return res.status(200).send({
          status: false,
          message: "Patient not found in user profile",
        });
      }
    }

    const isTimeAlreadyBooked = await Appointment.exists({
      $and: [
        { date: date },
        { doctor: doctor._id },
        { status: { $eq: 1 } },
        {
          time: {
            $eq: time,
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `Selected time slot is already booked for Date ${req.body.date} for Doctor ${" " + doctor.name}`,
      });
    }

    const isValidService = doctor.service.includes(serviceId);

    if (!isValidService) {
      return res.status(200).send({
        status: false,
        message: "Selected service is not valid for the doctor",
      });
    }

    const appointmentDay = moment(date, "YYYY-MM-DD");
    const dayOfWeek = appointmentDay.format("dddd");

    const doctorTime = doctor.schedule.find((time) => time.day == dayOfWeek);

    if (!doctorTime) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available on selected day",
      });
    }

    const doctorOpenTime = moment(doctorTime.startTime, "hh:mm A");
    const doctorCloseTime = moment(doctorTime.endTime, "hh:mm A");

    const breakStartTime = moment(doctorTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(doctorTime.breakEndTime, "hh:mm A");

    const appointmentStartTime = moment(time, "hh:mm A");

    const isWithinDoctorHours = appointmentStartTime.isSameOrAfter(doctorOpenTime) && appointmentStartTime.isSameOrBefore(doctorCloseTime);
    const isDuringBreak = appointmentStartTime.isSameOrAfter(breakStartTime) && appointmentStartTime.isBefore(breakEndTime);

    if (!isWithinDoctorHours || isDuringBreak) {
      return res.status(200).send({
        status: false,
        message: "Selected time slot is outside the doctor's working hours or during a break",
      });
    }

    if (doctor.type == 1 && type == 2) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide on clinic service.select online option to book appoint with ${doctor.name}`,
      });
    }

    if (doctor.type == 2 && type == 1) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide online service.select clinic option to book appoint with ${doctor.name}`,
      });
    }

    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({
        status: false,
        message: `Invalid service type`,
      });
    }

    // const validDuration = parseInt(doctor.timeSlot) == parseInt(duration);

    // if (!validDuration) {
    //   return res.status(200).send({
    //     status: false,
    //     message: "Invalid duration for appointment",
    //   });
    // }

    const todayDate = moment().format("YYYY-MM-DD");
    let coupon;
    let discountAmount;

    if (req.body.coupon) {
      coupon = await Coupon.findOne({
        type: 2,
        _id: req.body.coupon,
        isActive: true,
        // minAmountToApply: { $lte: amount },
        expiryDate: { $gte: todayDate },
        user: { $nin: [userId] },
      });

      if (coupon) {
        if (coupon.type === 2) {
          if (coupon.discountType === 1) {
            discountAmount = coupon.maxDiscount;
          }
          if (coupon.discountType === 2) {
            discountAmount = (amount * coupon.discountPercent) / 100;
            if (discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          }
        } else {
          return res.status(200).send({
            status: false,
            message: "This coupon is not valid for you right now",
          });
        }
      } else {
        return res.status(200).send({
          status: false,
          message: "Coupon is not found or you are not eligible for it",
        });
      }
    }

    const validWithoutTax = withoutTax == doctor.charge;
    if (!validWithoutTax) {
      return res.status(200).send({
        status: false,
        message: "Invalid service amount",
      });
    }

    let totalAmount;
    let validFinalAmount;
    let adminEarning;

    const doctorEarning = parseFloat(withoutTax) - ((doctor.commission * withoutTax) / 100).toFixed(2);

    const tax = parseFloat((setting.tax * withoutTax) / 100);

    if (coupon) {
      totalAmount = parseFloat(withoutTax) + parseFloat(tax) - discountAmount;

      adminEarning = ((doctor.commission * withoutTax) / 100 - discountAmount).toFixed(2);

      coupon.user.push(userId);
      await coupon.save();
    } else {
      totalAmount = parseFloat(withoutTax) + parseFloat(tax);
      validFinalAmount = totalAmount == amount;

      if (!validFinalAmount) {
        return res.status(200).send({
          status: false,
          message: "Invalid total amount",
        });
      }

      adminEarning = ((doctor.commission * withoutTax) / 100).toFixed(2);
    }

    console.log("withoutTax: ", withoutTax);
    console.log("discountAmount: ", discountAmount);
    console.log("totalAmount: ", totalAmount);

    const adminCommissionPercent = doctor.commission;

    const [appointment, updatedDoctor, updatedWallet, userNotification, doctorNotification] = await Promise.all([
      Appointment.create({
        user: user._id,
        doctor: doctor._id,
        date,
        time,
        duration: doctorTime.timeSlot,
        amount: totalAmount,
        tax,
        withoutTax,
        type,
        doctorEarning,
        adminEarning,
        adminCommissionPercent,
        appointmentId: await generateUniqueBookingId(),
        service: service._id,
        patient: subPatient && subPatient._id,
        details,
        image: req.file ? process.env.baseURL + req.file.path : "",
        discount: discountAmount,
        coupon: coupon && coupon.code,
      }),
      Doctor.updateOne(
        { _id: doctorId },
        {
          $inc: {
            bookingCount: 1,
            currentBookingCount: 1,
          },
        }
      ),
      paymentType.trim().toLowerCase() === "wallet"
        ? Wallet.updateOne(
            { user: userId },
            {
              $inc: {
                amount: -amount,
              },
            }
          )
        : Promise.resolve(),
      Notification.create({
        user: user._id,
        type: 1,
        stateType: 1,
        message: `Appointment booked with ${doctor.name}  at ${req.body.time} on date ${req.body.date}`,
        date: moment().format("YYYY-MM-DD"),
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        title: "Appointment booked ✅ ",
      }),
      Notification.create({
        user: doctor._id,
        type: 2,
        stateType: 1,
        message: `Appointment booked with ${user.name} at ${req.body.time} on date ${req.body.date}`,
        date: moment().format("YYYY-MM-DD"),
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        title: "Hey doctor,New appointment ✅",
      }),
    ]);

    const uniqueString = new UString({
      string: today + "-" + doctorId + "-" + time,
      appointment: appointment._id,
    });

    const userPayload = {
      token: user.fcmToken,
      notification: {
        body: userNotification.message,
        title: userNotification.title,
      },
    };

    const doctorPayload = {
      token: doctor.fcmToken,
      notification: {
        body: doctorNotification.message,
        title: doctorNotification.title,
      },
    };

    const walletHistory = new WalletHistory();
    walletHistory.amount = totalAmount;
    walletHistory.type = 2;
    walletHistory.paymentType = paymentType;
    walletHistory.appointment = appointment._id;
    walletHistory.date = moment().format("YYYY-MM-DD");
    walletHistory.user = user._id;
    walletHistory.time = moment().format("HH:MM a");
    walletHistory.uniqueId = await generateId();
    if (coupon) {
      walletHistory.couponId = coupon.code;
      walletHistory.couponAmount = discountAmount;
    }

    const adminPromise = await admin;
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(userPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (user && user.webFcmToken !== null) {
      try {
        const userPayload = {
          token: user.webFcmToken,
          notification: {
            body: userNotification.message,
            title: userNotification.title,
          },
        };

        const response = await adminPromise.messaging().send(userPayload);
        console.log("Successfully webFcmToken sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(doctorPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.webFcmToken !== null) {
      try {
        const doctorPayload = {
          token: doctor.webFcmToken,
          notification: {
            body: doctorNotification.message,
            title: doctorNotification.title,
          },
        };

        const response = await adminPromise.messaging().send(doctorPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    await Promise.all([walletHistory.save(), uniqueString.save()]);

    return res.status(200).send({
      status: true,
      message: "appointment send successfully!!",
      data: appointment,
      walletHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
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
    appointment.cancel.person = 2;
    appointment.cancel.time = moment().format("HH:mm:ss");
    appointment.cancel.date = moment().format("YYYY-MM-DD");
    appointment.cancel.reason = req.query.reason;

    userWallet.amount += appointment.amount;

    const walletHistory = new WalletHistory();
    walletHistory.amount = appointment.amount;
    walletHistory.type = 3;
    walletHistory.appointment = appointment._id;
    walletHistory.date = moment().format("YYYY-MM-DD");
    walletHistory.user = appointment.user;
    walletHistory.time = moment().format("HH:MM a");
    walletHistory.uniqueId = await generateId();

    await Promise.all([
      walletHistory.save(),
      //WalletHistory.findOneAndDelete({ appointment: appointment._id }),
      UString.findOneAndDelete({ appointment: appointment._id }),
    ]);

    await Promise.all([appointment.save(), userWallet.save(), UString.findOneAndDelete({ appointment: appointment._id })]);

    res.status(200).send({
      status: true,
      message: "Appointment cancel successfully",
      data: appointment,
    });

    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment has been cancelled successfully with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment Cancelled",
      },
    };

    const notification = new Notification({
      user: user._id,
      stateType: 5,
      message: "Your appointment has been cancelled successfully",
      title: "Appointment Cancelled",
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    const doctorNotification = new Notification({
      doctor: appointment.doctor,
      stateType: 5,
      message: "Your appointment has been cancelled successfully",
      title: "Appointment Cancelled",
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await Promise.all([notification.save(), doctorNotification.save()]);

    const adminPromise = await admin;
    const userTokens = [];

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
            body: `Your appointment has been cancelled successfully with appointmentId ${appointment.appointmentId}.`,
            title: "Appointment Cancelled",
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

exports.rescheduleAppointment = async (req, res) => {
  try {
    if (!req.body.appointmentId || !req.body.date || !req.body.time) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }
    const type = req.body.type;

    const appointment = await Appointment.findById(req.body.appointmentId);
    if (!appointment) {
      return res.status(200).send({ status: false, message: "Appointment not found!" });
    }

    const user = await User.findById(appointment.user);
    if (!user) {
      return res.status(200).send({ status: false, message: "user not found!" });
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      return res.status(200).send({ status: false, message: "user not found!" });
    }

    const isTimeAlreadyBooked = await Appointment.exists({
      $and: [
        { date: req.body.date },
        { doctor: doctor._id },
        { status: { $eq: 1 } },
        {
          time: {
            $eq: req.body.time,
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `Selected time slot is already booked for Date ${req.body.date} for Doctor ${" " + doctor.name}`,
      });
    }

    const appointmentDay = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = appointmentDay.format("dddd");

    const doctorTime = doctor.schedule.find((time) => time.day == dayOfWeek);

    if (!doctorTime) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available on selected day",
      });
    }

    const doctorOpenTime = moment(doctorTime.startTime, "hh:mm A");
    const doctorCloseTime = moment(doctorTime.endTime, "hh:mm A");

    const breakStartTime = moment(doctorTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(doctorTime.breakEndTime, "hh:mm A");

    const appointmentStartTime = moment(req.body.time, "hh:mm A");

    const isWithinDoctorHours = appointmentStartTime.isAfter(doctorOpenTime) && appointmentStartTime.isBefore(doctorCloseTime);

    const isDuringBreak = appointmentStartTime.isAfter(breakStartTime) && appointmentStartTime.isBefore(breakEndTime);

    if (!isWithinDoctorHours || isDuringBreak) {
      return res.status(200).send({
        status: false,
        message: "Selected time slot is outside the doctor's working hours or during a break",
      });
    }

    if (doctor.type == 1 && type == 2) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide on clinic service.select online option to book appoint with ${doctor.name}`,
      });
    }

    if (doctor.type == 2 && type == 1) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide online service.select clinic option to book appoint with ${doctor.name}`,
      });
    }
    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({
        status: false,
        message: `Invalid service type`,
      });
    }

    appointment.time = req.body.time;
    appointment.date = req.body.date;
    appointment.type = req.body.type ? parseInt(req.body.type) : appointment.type;
    await appointment.save();

    return res.status(200).send({
      status: true,
      message: "Schedule updated successfully",
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

exports.isCallEnableForUser = async (req, res) => {
  try {
    const { doctorId, userId } = req.query;

    if (!doctorId || !userId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const [user, doctor] = await Promise.all([User.findById(userId), Doctor.findOne({ _id: doctorId, isBlock: false })]);

    if (!user) {
      return res.status(200).send({ status: false, message: "user not found!" });
    }

    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor not found!" });
    }
    const today = moment().format("YYYY-MM-DD");
    const data = await Appointment.find({
      status: 1,
      doctor: doctor._id,
      user: user._id,
      date: today,
    }).sort({ time: -1 });

    const timeArray = data.map((appointment) => appointment.time);

    if (data.length > 0) {
      return res.status(200).send({
        status: true,
        message: "Success",
        callEnable: true,
        time: timeArray,
      });
    }
    if (data.length == 0) {
      return res.status(200).send({ status: true, message: "Success", callEnable: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getTax = async (req, res) => {
  try {
    const amount = req.query.amount;
    if (!amount) return res.status(200).send({ status: false, message: "amount is required" });

    const tax = (amount * setting.tax) / 100;
    const taxPercent = setting.tax;
    const finalAmount = parseFloat(amount) + parseFloat(tax);
    const data = {
      tax,
      taxPercent,
      finalAmount,
    };
    return res.status(200).send({ status: true, message: "Success", data });
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
        path: "doctor",
        select: "name image name designation address clinicName degree latitude longitude service email mobile",
        populate: {
          path: "service",
          select: "name",
        },
      })
      .populate("patient");

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

exports.getParticularUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    let matchQuery = {};
    const searchString = req.query.search || "";

    if (req.query.search !== "ALL" && req.query.search !== "") {
      const searchRegex = new RegExp(searchString, "i");

      matchQuery.$or = [
        { "doctor.name": { $regex: searchRegex } },
        { "doctor.designation": { $regex: searchRegex } },
        { "doctor.clinicName": { $regex: searchRegex } },
        { "doctor.email": { $regex: searchRegex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$doctor.mobile" },
              regex: searchRegex,
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$doctor.uniqueId" },
              regex: searchRegex,
            },
          },
        },
      ];
    }

    let status;
    if (req.query.status === "ALL") {
      status = "ALL";
    } else {
      status = parseInt(req.query.status);
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res.status(200).send({ status: false, message: "Invalid Appointment Type" });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const appointments = await Appointment.aggregate([
      {
        $match: {
          ...getStatusFilter(status),
          ...dateFilter,
          user: user._id,
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
      { $match: matchQuery },
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
          user: { _id: 1, name: 1, image: 1, mobile: 1, service: 1, email: 1 },
          service: 1,
          date: 1,
          time: 1,
          doctor: {
            _id: 1,
            name: 1,
            image: 1,
            designation: 1,
            degree: 1,
            email: 1,
            mobile: 1,
            isDelete: 1,
          },
          paymentStatus: 1,
          appointmentId: 1,
          adminEarning: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          type: 1,
          isReviewed: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Appointment.countDocuments({
      ...getStatusFilter(status),
      ...dateFilter,
      user: req.query.userId,
    });

    return res.status(200).send({ status: true, message: "Success", total, data: appointments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.getAppointmentCountsByStatus = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(200).json({
        status: false,
        message: "userId, startDate, and endDate are required.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    // Build dynamic match stage
    const matchStage = { user: user._id };

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

exports.createStripeAppointment = async (req, res) => {
  try {
    const { billing_details, payment_method_id, amount } = req.body;

    if (!billing_details || !payment_method_id) {
      return res.status(200).json({ status: false, message: "Invalid billing or payment details provided." });
    }

    const stripeSecret = global.settingJSON.stripeSecretKey;
    const stripe = require("stripe")(stripeSecret);

    console.log("Stripe secret key:", stripeSecret);
    console.log("Received payment_method_id:", payment_method_id);

    const customer = await stripe.customers.create({
      email: billing_details.email,
      name: billing_details.name,
      description: billing_details?.name || "No description provided",
      address: billing_details.address,
    });

    console.log("Stripe customer created:", customer.id);

    let intent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit
      currency: "inr",
      customer: customer.id,
      description: "Appointment Booking Payment",
      payment_method: payment_method_id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      shipping: {
        name: billing_details.name,
        address: billing_details.address,
      },
    });

    console.log("PaymentIntent created:", intent.id);

    intent = await stripe.paymentIntents.confirm(intent.id);
    console.log("PaymentIntent status after confirmation:", intent.status);

    if (intent.status === "requires_action" && intent.next_action?.type === "use_stripe_sdk") {
      return res.status(200).json({
        status: true,
        requires_action: true,
        message: "Additional authentication is required to complete the payment.",
        payment_intent_client_secret: intent.client_secret,
      });
    } else if (intent.status === "succeeded") {
      return res.status(200).json({
        status: true,
        message: "Payment processed successfully.",
        payment_intent_client_secret: intent.client_secret,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: `Unhandled PaymentIntent status: ${intent.status}`,
      });
    }
  } catch (err) {
    console.error("Stripe payment error:", err);
    return res.status(500).json({ status: false, message: err?.message || "An error occurred while processing the payment." });
  }
};

async function generateUniqueBookingId() {
  let newAppointmentId;

  do {
    newAppointmentId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await Appointment.exists({ appointmentId: newAppointmentId }));

  return newAppointmentId;
}

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

function generateId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
