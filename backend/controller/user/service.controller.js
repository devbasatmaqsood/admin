const Service = require("../../models/service.model");
const Doctor = require("../../models/doctor.model");

// exports.getAll = async (req, res) => {
//   try {
//     const services = await Service.find({ isDelete: false, status: true }).sort({
//       isDemo: -1, // First sort by isDemo (true will come before false)
//       createdAt: -1, // Then sort by createdAt
//     });

//     return res.status(200).send({
//       status: true,
//       message: "services Found",
//       data: services,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       error: error.message || "Internal Server Error!!",
//     });
//   }
// };

exports.getAll = async (req, res) => {
  try {
    const services = await Service.find({ isDelete: false, status: true }).sort({ createdAt: -1 }).lean();

    const serviceDoctorCounts = await Doctor.aggregate([
      { $match: { isDelete: false } },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const doctorCountMap = {};
    serviceDoctorCounts.forEach(({ _id, count }) => {
      doctorCountMap[_id] = count;
    });

    const servicesWithDoctorCount = services.map((service) => ({
      ...service,
      doctorCount: doctorCountMap[service._id] || 0,
    }));

    return res.status(200).send({
      status: true,
      message: "Services Found",
      data: servicesWithDoctorCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
