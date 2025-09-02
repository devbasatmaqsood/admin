const Notification = require('../../models/notification.model');
const Doctor = require('../../models/doctor.model');

exports.getNotificationForDoctor = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res
        ?.status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: 'doctor does not exist' });
    }

    const notification = await Notification.find({ doctor: doctor._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      status: true,
      message: 'Success',
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
