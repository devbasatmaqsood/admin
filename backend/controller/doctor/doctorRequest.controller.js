const Request = require("../../models/doctorRequest.model");
const { deleteFile } = require("../../middleware/deleteFile");
const moment = require("moment");
const { generateId } = require("../../middleware/generateId");

exports.createRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      mobile,
      gender,
      dob,
      country,
      service,
      designation,
      degree,
      language,
      experience,
      charge,
      type,
      clinicName,
      address,
      awards,
      yourSelf,
      education,
      experienceDetails,
      expertise,
      countryCode,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !mobile ||
      !gender ||
      !dob ||
      !country ||
      !service ||
      !designation ||
      !language ||
      !degree ||
      !experience ||
      !charge ||
      !type ||
      !yourSelf ||
      !expertise ||
      !experienceDetails ||
      !countryCode ||
      !req.file
    ) {
      if (req.file) {
        deleteFile(req.file);
      }
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    if (type === 2 || type === 3) {
      if (!clinicName || !address) {
        if (req.file) {
          deleteFile(req.file);
        }
        return res.status(200).send({
          status: false,
          message: "Clinic name and Clinic address is required for on clinic services",
        });
      }
    }

    const request = new Request();
    request.name = name;
    request.email = email;
    request.password = password;
    request.age = age;
    request.mobile = mobile;
    request.gender = gender.toLowerCase();
    request.country = country;
    request.designation = designation;
    request.dob = moment(dob, "YYYY-MM-DD").format("YYYY-MM-DD");
    request.service = service.split(",");
    request.degree = degree.split(",");
    request.language = language.split(",");
    request.experience = parseInt(experience);
    request.charge = charge;
    request.type = type;
    request.clinicName = clinicName ? clinicName : "";
    request.address = address ? address : "";
    request.expertise = expertise.split(",");
    request.awards = awards && awards.split(",");
    request.yourSelf = yourSelf;
    request.education = education;
    request.experienceDetails = experienceDetails.split(",");
    request.requestId = generateId();
    request.image = req.file ? process.env.baseURL + req.file.path : "";
    request.countryCode = countryCode;
    request.latitude = req.body.latitude || request.latitude;
    request.longitude = req.body.longitude || request.longitude;
    await request.save();

    return res.status(200).send({
      status: true,
      message: "Request send to admin successfully",
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

exports.getRequestStatus = async (req, res) => {
  try {
    const request = await Request.findOne({
      requestId: req.query.requestId,
    }).lean();

    if (!request) {
      return res.status(200).json({
        status: false,
        message: "Request not found",
      });
    }

    let data = {
      status: request.status,
      id: request.requestId,
    };
    
    return res.status(200).json({
      status: true,
      message: "Request Status",
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
