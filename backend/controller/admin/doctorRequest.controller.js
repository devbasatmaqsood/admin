const Request = require("../../models/doctorRequest.model");
const Doctor = require("../../models/doctor.model");

exports.getAll = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 20;
    const skipAmount = start * limit;

    const type = parseInt(req.query.type);
    if (!type) {
      return res.status(200).send({ status: false, message: "Type is requires" });
    }

    const aggregationPipeline = [
      {
        $match: { status: type },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "Services",
        },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
      {
        $sort: { status: 1, createdAt: -1 },
      },
    ];

    const [total, result] = await Promise.all([Request.countDocuments({ status: type }), Request.aggregate(aggregationPipeline)]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).send({ status: false, message: "Request id is required" });
    }

    const request = await Request.findById(req.query.requestId);
    if (!request) {
      return res.status(200).send({ status: false, message: "Request not found" });
    }

    if (request.status == 2) {
      return res.status(200).send({
        status: false,
        message: "Request is already accepted by admin",
      });
    }

    if (request.status == 3) {
      return res.status(200).send({
        status: false,
        message: "Request is already rejected by admin",
      });
    }

    const setting = global.settingJSON;

    const doctor = new Doctor({
      countryCode: request.countryCode,
      name: request.name,
      email: request.email,
      password: request.password,
      age: request.age,
      mobile: request.mobile,
      gender: request.gender,
      dob: request.dob,
      country: request.country,
      designation: request.designation,
      service: request.service,
      degree: request.degree,
      language: request.language,
      experience: request.experience,
      charge: request.charge,
      type: request.type,
      clinicName: request.clinicName,
      address: request.address,
      awards: request.awards,
      yourSelf: request.yourSelf,
      education: request.education,
      experienceDetails: request.experienceDetails,
      expertise: request.expertise,
      image: request.image,
      latitude: request?.latitude,
      longitude: request?.longitude,
      commission: setting.commissionPercent || 10,
      uniqueId: Math.floor(Math.random() * 1000000 + 999999),
    });

    const defaultTime = {
      startTime: "09:00 AM",
      endTime: "09:00 PM",
      breakStartTime: "01:30 PM ",
      breakEndTime: "02:45 PM ",
      time: 30,
    };

    doctor.schedule = [
      { day: "Monday", ...defaultTime },
      { day: "Tuesday", ...defaultTime },
      { day: "Wednesday", ...defaultTime },
      { day: "Thursday", ...defaultTime },
      { day: "Friday", ...defaultTime },
      { day: "Saturday", ...defaultTime },
      { day: "Sunday", ...defaultTime },
    ];

    request.status = 2;

    await Promise.all([doctor.save(), request.save()]);

    return res.status(200).send({ status: true, message: "Doctor added successfully", doctor });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).send({ status: false, message: "Request id is required" });
    }
    const request = await Request.findById(req.query.requestId).populate("service");
    if (!request) {
      return res.status(200).send({ status: false, message: "Request not found" });
    }

    if (request.status == 2) {
      return res.status(200).send({
        status: false,
        message: "Request is already accepted by admin",
      });
    }

    if (request.status == 3) {
      return res.status(200).send({
        status: false,
        message: "Request is already rejected by admin",
      });
    }

    request.status = 3;
    await request.save();
    return res.status(200).send({
      status: true,
      message: "Request rejected successfully ",
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
