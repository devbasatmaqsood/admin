const Service = require("../../models/service.model");


exports.getAll = async (req, res) => {
  try {
    const services = await Service.find({ isDelete: false, status: true })
      .select("-isDelete -updatedAt ")
      .sort({
        createdAt: -1,
      }).lean();

    return res.status(200).send({
      status: true,
      message: "services Found",
      data: services,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

