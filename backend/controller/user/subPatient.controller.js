const { deleteFiles } = require("../../middleware/deleteFile");
const SubPatient = require("../../models/subPatient.model");
const User = require("../../models/user.model");

exports.addSubPatient = async (req, res) => {
  try {
    if (
      !req.query.userId ||
      !req.body.name ||
      !req.body.age ||
      !req.body.gender ||
      !req.body.relation
    ) {
      console.log('req.body', req.body)
      console.log('req.query', req.query)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    const patient = new SubPatient({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      relation: req.body.relation,
      user: user._id,
    });
    if(req.file){
      patient.image = process.env.baseURL + req.file.path
    }

    await Promise.all([
      patient.save(),
      User.updateOne({ _id: user._id }, { $push: { subPatient: patient._id } }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Patient Added successfully",
      data: patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    const data = await SubPatient.find({ user: user._id });
    return res.status(200).json({
      status: true,
      message: "Patient get successfully",
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
