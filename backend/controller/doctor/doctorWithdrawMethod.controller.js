const DoctorWithdrawMethod = require("../../models/doctorWithdrawMethod.model");
const Doctor = require("../../models/doctor.model");

const mongoose = require("mongoose");

//update payment method details by doctor
exports.updateDetailsOfPaymentMethods = async (req, res) => {
  try {
    const { doctorId, paymentMethods } = req.body;

    if (!doctorId || !paymentMethods || !Array.isArray(paymentMethods)) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    console.log("paymentMethods ", paymentMethods);

    const id = new mongoose.Types.ObjectId(doctorId);

    const doctor = await Doctor.findOne({ _id: id, isDelete: false });
    if (!doctor) {
      return res.status(200).json({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).json({
        status: false,
        message: "You are blocked by admin, contact admin for further details.",
      });
    }

    let doctorWithdrawMethod = await DoctorWithdrawMethod.findOne({ doctor: doctor._id });

    if (doctorWithdrawMethod) {
      doctorWithdrawMethod.paymentMethods = paymentMethods?.map((method) => ({
        paymentGateway: method.paymentGateway,
        paymentDetails: method.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
      }));
    } else {
      doctorWithdrawMethod = new DoctorWithdrawMethod({
        doctor: doctor._id,
        paymentMethods: paymentMethods?.map((method) => ({
          paymentGateway: method.paymentGateway,
          paymentDetails: method.paymentDetails.map((detail) => detail.replace("[", "").replace("]", "")),
        })),
      });
    }

    await doctorWithdrawMethod.save();

    return res.status(200).json({ status: true, message: "Success", data: doctorWithdrawMethod });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get payment method details of the doctor
exports.getDetailsOfPaymentMethods = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!" });
    }

    const id = new mongoose.Types.ObjectId(doctorId);

    const doctor = await Doctor.findOne({ _id: id, isDelete: false }).lean();
    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "You are blocked by admin, contact admin for further details.",
      });
    }

    const doctorWithdrawMethod = await DoctorWithdrawMethod.findOne({ doctor: id }).lean();

    return res.status(200).send({ status: true, message: "Success", data: doctorWithdrawMethod });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};