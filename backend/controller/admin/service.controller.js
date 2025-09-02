const Service = require('../../models/service.model')
const Doctor = require('../../models/doctor.model')
const { deleteFile } = require('../../middleware/deleteFile')
const fs = require('fs')

exports.create = async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.file
    ) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details" });
    }

    const service = new Service();
    const existingService = await Service.findOne({
      name: capitalizeFirstLetter(req.body.name),
      isDelete: false,
    });
    if (existingService) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({
        status: false,
        message: "Service with the same name is  already exists",
      });
    }

    service.name = capitalizeFirstLetter(req.body.name);
    service.image = req.file ? process.env.baseURL + req.file.path : "";

    await service.save();
    return res.status(200).send({
      status: true,
      message: "Service Created Successful !",
      data: service,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const search = req.query.search || "";
    let query = {};

    if (search !== "ALL") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { categoryname: { $regex: search, $options: "i" } },
        ],
      };
    }

    const aggregationPipeline = [
      {
        $match: { isDelete: false },
      },
      {
        $match: { ...query },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt field in descending order
      },

    ];

    const result = await Service.aggregate(aggregationPipeline);

    return res.status(200).json({
      status: true,
      message: "Services found",
      services: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      if (req.files.image) deleteFile(req.files.image[0]);
      return res
        .status(200)
        .send({ status: false, message: "service not exist" });
    }
    service.name = req.body.name ? req.body.name : service.name;
    if (req.file) {
      var image_ = service.image.split("storage");
      if (image_[1] !== "/noImage.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      service.image = req.file
        ? process?.env?.baseURL + req?.file?.path
        : service.image;
    }
    await service.save();
    return res.status(200).send({
      status: true,
      message: "service Updated Successfully",
      service,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }

    if(service.name === "All"){
      return res
        .status(200)
        .send({ status: false, message: "You can not delete this service" });
    }
    service.isDelete = true;
    await service.save();

    return res
      .status(200)
      .send({ status: true, message: "service deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.handleStatus = async (req, res) => {
  try {
    if (!req.query.serviceId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const service = await Service.findById(req.query.serviceId);
    if (!service) {
      return res
        .status(200)
        .send({ status: false, message: "service not exists" });
    }

    service.status = !service.status
    await  service.save()

    if(service.status === false){
      await Doctor.updateMany(
        { service: service._id },
        { $pull: { service: service._id } }
      )
    }

    return res
      .status(200)
      .send({ status: true, message: "service status updated", data: service });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.getAllForDropdown = async (req, res) => {
  try {
    const data = await Service.find({isDelete:false,status:true}).select("_id name").lean()
    return res.status(200).json({
      status: true,
      message: "Services found",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};


const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};