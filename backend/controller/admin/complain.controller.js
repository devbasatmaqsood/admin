const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const Complain = require("../../models/complain.model");
const moment = require("moment");
const admin = require('../../firebase.js')





// get pending Solved Complains
exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;
    const type = req.query.type;
    const person = req.query.person;

    let query = {};
    if (type != 1 && type != 3 && type != 2) {
      return res.status(200).send({ status: false, message: "Invalid Type" });
    }
    if (person != 1 && person != 3 && person != 2) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Complain Person" });
    }
    if (type == 1 && person == 1) {
      // pending - user
      query = { type: 1, person: 1 };
    } else if (type == 2 && person == 1) {
      // solve - user
      console.log("2-2 ");
      query = { type: 2, person: 1 };
    } else if (type == 3 && person == 1) {
      // both (pending-solve) - user
      query = { person: 1 };
    } else if (type == 1 && person == 2) {
      // pending - doctor
      query = { type: 1, person: 2 };
    } else if (type == 2 && person == 2) {
      // solve  - doctor
      query = { type: 2, person: 2 };
    } else if (type == 3 && person == 2) {
      // both (pending-solve) - doctor
      query = { person: 2 };
    }



    const [result,total] =  await Promise.all([
      Complain.find({ ...query, isComplain: true })
        .populate("doctor user appointment")
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .lean(),
        Complain.countDocuments({ ...query, isComplain: true })
    ])


    return res
      .status(200)
      .send({ status: true, message: "success", total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// suggestions
exports.suggestions = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skipAmount = start * limit;

    const person = req.query.person;

    let query = {};

    if (person != 1 && person != 3 && person != 2) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Complain Person" });
    }
    if (person == 1) {
      query = { person: 1 };
    } else if (person == 2) {
      query = { person: 2 };
    }

    const [result ,total] =  await Promise.all([
      Complain.find({ ...query, isComplain: false })
            .populate({
              path: "doctor",
              select: "name _id",
            })
            .populate({
              path: "user",
              select: "name _id",
            })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(limit)
            .exec(),
            Complain.countDocuments({query, isComplain: false})

    ])


    return res
      .status(200)
      .send({ status: true, message: "success", total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// solve pending complain by admin
exports.solveComplain = async (req, res) => {
  try {
    if (!req.query.complainId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }

    const complain = await Complain.findById(req.query.complainId).populate('user doctor appointment');
    if (!complain) {
      return res
        .status(200)
        .send({ status: false, message: "No Complain Found!!" });
    }
    if (complain.type == 2) {
      return res
        .status(200)
        .send({ status: false, message: "Complain is already Solved!" });
    }
    complain.type = 2;

    complain.solvedDate = moment().format("YYYY-MM-DD");

    complain.save();
    let user =
      complain.person == 1
        ? await User.findById(complain.user)
        : await Doctor.findById(complain.doctor);

    if (complain.person == 2 && !user) {
      console.log("Doctor Not Found");
    }
    if (complain.person == 1 && !user) {
      console.log("user Not Found");
    }

    const payload = {
      token: user?.fcmToken,
      notification: {
        body: `Dear ${
          user?.name ?   user?.name : "Hey, "
        } Your Complain is Solve Successfully.Your feedback is crucial, and we're here to assist you.Thank you`,
        title: "Complain Solved",
      },
    };


    const adminPromise = await admin
    if (user && user?.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: complain });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// delete complain
exports.deleteComplain = async (req, res) => {
  try {
    if (!req.query.complainId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }
    const complain = await Complain.findById(req.query.complainId);
    if (!complain) {
      return res
        .status(200)
        .send({ status: false, message: "Complain not found!!" });
    }
    await Complain.deleteOne({ _id: complain._id });
    return res
      .status(200)
      .send({ status: true, message: "Complain delete successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
