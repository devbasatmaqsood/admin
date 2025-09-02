const WithdrawRequest = require("../../models/withdrawRequest.model");
const Doctor = require("../../models/doctor.model");
const Notification = require("../../models/notification.model");
const setting = require("../../setting");

const admin = require("../../firebase");

exports.createWithdrawRequest = async (req, res) => {
  try {
    const { doctorId, amount, paymentGateway, paymentDetails } = req.body;

    if (!doctorId || !amount || !paymentGateway || !paymentDetails) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!" });
    }

    if (amount < setting.minWithdraw) {
      return res.status(200).send({ status: false, message: `Minimum withdraw amount is ${setting.minWithdraw}` });
    }

    const doctor = await Doctor.findOne({ _id: doctorId, isDelete: false });
    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).send({ status: false, message: "Your are blocked by admin,contact admin for further details" });
    }

    if (amount > doctor.wallet) {
      return res.status(200).send({ status: false, message: "You can not withdraw more than your current wallet amount" });
    }

    const existingRequest = await WithdrawRequest.findOne({ doctor: doctor._id, status: 1 });

    if (existingRequest) {
      return res.status(200).send({
        status: false,
        message: "You cannot make new withdraw request until existing one is in process",
      });
    }

    const request = new WithdrawRequest();
    request.doctor = doctor._id;
    request.amount = parseInt(amount);
    request.paymentGateway = paymentGateway;
    request.paymentDetails = paymentDetails.map((detail) => detail.replace("[", "").replace("]", ""));
    await request.save();

    const newRequest = await WithdrawRequest.findById(request._id).populate("doctor");

    await Promise.all([
      WithdrawRequest.findOneAndDelete({ doctor: doctor._id, status: 3 }),
      //Doctor.updateOne({ _id: doctor._id }, { $inc: { wallet: -amount } })
    ]);

    res.status(200).send({
      status: true,
      message: "Withdraw request send to admin successfully",
      data: newRequest,
    });

    if (doctor && doctor.webFcmToken) {
      try {
        const payload = {
          token: doctor.webFcmToken,
          notification: {
            title: "💸 Withdraw Request Created",
            body: `Your withdraw request of ₹${request.amount} has been created successfully.`,
          },
        };

        const adminPromise = await admin;
        const response = await adminPromise.messaging().send(payload);
        console.log("✅ Successfully sent message:", response);

        await Notification.create({
          doctor: doctor._id,
          title: payload.notification.title,
          image: "",
          message: payload.notification.body,
          notificationType: 2,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        });
      } catch (error) {
        console.log("❌ Error sending message:", error);
      }
    }
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
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 20;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    const skip = start * limit;

    if (!req.query.doctorId) {
      return res.status(200).send({ status: false, message: "DoctorId is required" });
    }

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        payDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const request = await WithdrawRequest.aggregate([
      {
        $match: { doctor: doctor._id, ...dateFilter },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                image: 1,
              },
            },
          ],
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      { $sort: { payDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return res.status(200).send({ status: true, message: "Success", data: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
