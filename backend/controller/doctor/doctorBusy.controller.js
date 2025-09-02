const Doctor = require("../../models/doctor.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Holiday = require("../../models/doctorHoliday.model");
const Appointment = require("../../models/appointment.model");

const moment = require("moment");

exports.busyDoctor = async (req, res, next) => {
  try {
    const doctorId = req.query.doctorId;
    const { date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(200).json({ status: false, message: "Invalid details" });
    }

    let [doctor, existingBusyDoctor] = await Promise.all([Doctor.findOne({ _id: doctorId }), DoctorBusy.findOne({ doctor: doctorId, date })]);

    if (!doctor) {
      return res.status(200).json({ status: false, message: "doctor not found" });
    }

    const timeArray = time.split(",").map((trimmedTime) => trimmedTime.trim());

    if (!existingBusyDoctor) {
      existingBusyDoctor = new DoctorBusy({
        doctor: doctor._id,
        date,
        time: [],
      });
    }

    timeArray.forEach((slot) => {
      if (!existingBusyDoctor.time.includes(slot)) {
        existingBusyDoctor.time.push(slot);
      }
    });

    await existingBusyDoctor.save();

    return res.status(200).json({
      status: true,
      message: "Busy schedule updated successfully",
      data: existingBusyDoctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.addHoliday = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const { doctorId } = req.query;

    if (!startDate || !endDate || !doctorId) {
      return res.status(200).send({ status: false, message: "Oops! Invalid details!" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(200).json({ status: false, message: "Oops! doctor not found!" });
    }

    const formattedStart = moment(startDate).format("YYYY-MM-DD");
    const formattedEnd = moment(endDate).format("YYYY-MM-DD");

    const datesToAdd = [];
    const currentDate = moment(formattedStart);

    while (currentDate <= moment(formattedEnd)) {
      datesToAdd.push(currentDate.format("YYYY-MM-DD"));
      currentDate.add(1, "days");
    }

    for (const dateToAdd of datesToAdd) {
      const alreadyHoliday = await Holiday.findOne({ date: dateToAdd, doctor: doctor._id });
      if (alreadyHoliday) {
        return res.status(200).send({
          status: false,
          message: `Date ${dateToAdd} is already added as a holiday`,
        });
      }
    }

    for (const dateToAdd of datesToAdd) {
      const conflictingAppointments = await Appointment.find({
        doctor: doctor._id,
        date: dateToAdd,
        status: {
          $in: [1, 2],
        },
        $or: [{ checkOutTime: null }, { checkOutTime: "" }],
      });

      if (conflictingAppointments.length > 0) {
        return res.status(200).json({
          status: false,
          message: `Cannot mark ${dateToAdd} as a holiday. Appointments are still active or incomplete.`,
          appointments: conflictingAppointments,
        });
      }
    }

    const addedHolidays = [];
    for (const dateToAdd of datesToAdd) {
      const holiday = new Holiday({
        date: dateToAdd,
        reason: reason || null,
        doctor: doctor._id,
      });
      await holiday.save();
      addedHolidays.push(holiday);
    }

    return res.status(200).send({
      status: true,
      message: "Holiday added successfully!",
      data: addedHolidays,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

exports.removeHoliday = async (req, res) => {
  try {
    if (!req.query.date || !req.query.doctorId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const holidayDate = moment(req.query.date).format("YYYY-MM-DD");

    const today = moment().format("YYYY-MM-DD");
    if (holidayDate < today || holidayDate == today) {
      return res.status(200).send({
        status: false,
        message: `Date ${holidayDate} is already passed.`,
      });
    }

    const [doctor, holiday] = await Promise.all([
      Doctor.findById(req.query.doctorId),
      Holiday.findOne({
        date: holidayDate,
        doctor: req.query.doctorId,
      }),
    ]);

    if (!doctor) {
      return res.status(200).json({ status: false, message: "Doctor not found" });
    }

    if (!holiday) {
      return res.status(200).send({
        status: false,
        message: `Date ${holidayDate} is not a holiday`,
      });
    }

    res.status(200).send({
      status: true,
      message: "Holiday deleted successfully!!",
      isOpen: true,
    });

    await holiday.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error",
    });
  }
};
