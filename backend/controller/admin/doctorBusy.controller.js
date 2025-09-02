const Doctor = require("../../models/doctor.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Holiday = require("../../models/doctorHoliday.model");

exports.doctorHoliday = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;
    let holiday;
    let total;

    if (req.query.doctorId === "All") {
      // Query all holidays with non-deleted doctors
      const [holidays, totals] = await Promise.all([
        Holiday.aggregate([
          {
            $lookup: {
              from: "doctors", // The name of the doctor collection
              localField: "doctor",
              foreignField: "_id",
              as: "doctor",
            },
          },
          {
            $match: {
              "doctor.isDelete": false,
            },
          },
          {
            $sort:{date:-1}
          },
          {
            $skip: skipAmount,
          },
          {
            $limit: limit,
          },
        ]),
        Holiday.find({}).countDocuments(),
      ]);

      holiday = holidays.map((h) => ({
        ...h,
        doctor: h.doctor[0], // Assuming only one doctor per holiday
      }));

      total = totals;
    } else {
      // Query holidays for a specific doctor
      const doctor = await Doctor.findOne({
        _id: req.query.doctorId,
        isDelete: false,
      });
      if (!doctor) {
        return res
          .status(404)
          .json({ status: false, message: "Doctor not found" });
      }

      holiday = await Holiday.find({ doctor: doctor._id })
        .populate("doctor", "name _id uniqueId").sort({createdAt:-1})
        .skip(skipAmount)
        .limit(limit);

      total = await Holiday.countDocuments({ doctor: doctor._id });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", data: holiday, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



exports.delete = async (req, res) => {
  try {
    if (!req.query.id) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }

    const doctorBusy = await Holiday.findById(req.query.id);
    if (!doctorBusy) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor Busy Not Exist" });
    }
    await doctorBusy.deleteOne();
    return res
      .status(200)
      .send({ status: true, message: "Doctor Busy deleted successfully" });
  } catch {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
