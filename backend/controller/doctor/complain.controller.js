const Complain = require('../../models/complain.model');
const Appointment = require('../../models/appointment.model');
const Doctor = require('../../models/doctor.model');

exports.raiseComplain = async (req, res) => {
  try {
    if (!req.body.details || !req.body.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid Details!!' });
    }

    const doctor = await Doctor.findById(req.body.doctorId);

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: 'doctor Not Found!!' });
    }

    let appointment = {};
    let complain = new Complain();
    if (req.body.appointmentId) {
      appointment = await Appointment.findOne({
        appointmentId: req.body.appointmentId,
      });

      if (!appointment) {
        return res
          .status(200)
          .send({ status: false, message: 'appointment Not Found!!' });
      }
      complain.appointmentId = req.body.appointmentId;
      complain.appointment = appointment._id;
    }

    complain.doctor = doctor._id;
    complain.person = 1;
    complain.isComplain = req.body.isComplain;
    complain.details = req.body.details;

    if (req.file) {
      complain.image = req.file ? process.env.baseURL + req.file.path : '';
    }
    await complain.save();

    return res.status(200).send({
      status: true,
      message: 'Your Complain Have Been Raised Successfully',
      complain,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;
    const { type, doctorId } = req.query;
    if (!type || !doctorId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid Details!!' });
    }
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: 'Doctor Not Found!!' });
    }

    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({ status: false, message: 'Invalid type!!' });
    }
    let query = {};

    let result;
    let total;

    if (type == 3) {
      result = await Complain.find({
        doctor: doctor._id,
        person: 1,
        isComplain: true,
      })
        .populate({
          path: 'appointment',
          select: 'appointmentId',
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .lean();
    } else {
      result = await Complain.find({
        doctor: doctor._id,
        person: 1,
        type,
        isComplain: true,
      })
        .populate({
          path: 'appointment',
          select: 'appointmentId',
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .lean();
    }

    if (type == 3) {
      total = await Complain.countDocuments({ person: 1, doctor: doctor._id });
    } else {
      total = await Complain.countDocuments({
        person: 1,
        doctor: doctor._id,
        type,
      });
    }

    return res
      .status(200)
      .send({ status: true, message: 'success', total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

exports.suggestions = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;
    const { doctorId } = req.query;
    const type = parseInt(req.query.type);
    if (!type || !doctorId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid Details!!' });
    }
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: 'Doctor Not Found!!' });
    }

    if (type != 1 && type != 2 && type != 3) {
      return res
        .status(200)
        .send({ doctor: doctor._id, status: false, message: 'Invalid type!!' });
    }
    let query = {};

    let result;
    let total;

    if (type == 3) {
      result = await Complain.find({
        doctor: doctor._id,
        person: 1,
        isComplain: false,
      })
        .populate({
          path: 'appointment',
          select: 'appointmentId',
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .exec();
    } else {
      result = await Complain.find({
        doctor: doctor._id,
        person: 1,
        type,
        isComplain: false,
      })
        .populate({
          path: 'appointment',
          select: 'appointmentId',
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .exec();
    }

    if (type == 3) {
      total = await Complain.countDocuments({
        doctor: doctor._id,
        person: 1,
        isComplain: false,
      });
    } else {
      total = await Complain.countDocuments({
        person: 1,
        type,
        isComplain: false,
        doctor: doctor._id,
      });
    }

    return res
      .status(200)
      .send({ status: true, message: 'success', total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
