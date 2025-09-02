const Suggestion = require("../../models/suggestedService.model");
const Service = require("../../models/service.model");
const { deleteFile } = require("../../middleware/deleteFile");

exports.getAll = async (req, res) => {
  try {
    const data = await Suggestion.find({}).sort({ created: -1 }).lean();
    res.status(200).send({
      status: true,
      message: "service suggestion submitted successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.accept = async (req, res) => {
  try {
    if (!req.query.id || !req.file) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
    const suggestedService = await Suggestion.findById(req.query.id);
    if (!suggestedService) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "Service not found" });
    }
    const newService = await new Service({
      name: req.body.name || capitalizeFirstLetter(suggestedService.name),
      image: req.file ? process.env.baseURL + req.file.path : "",

    });
    await newService.save();

    await Suggestion.findByIdAndDelete(req.query.id);

    return res.status(200).json({ status: true, message: "Service created successfully" });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.decline = async (req, res) => {
  try {
    if (!req.query.id ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
    const suggestedService = await Suggestion.findById(req.query.id);
    if (!suggestedService) {
      return res
        .status(200)
        .send({ status: false, message: "Service not found" });
    }

    await suggestedService.deleteOne();

    return res.status(200).json({ status: true, message: "Service decline successfully" });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
