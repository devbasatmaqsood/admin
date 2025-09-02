const WithdrawRequest = require("../../models/withdrawRequest.model");
const Doctor = require("../../models/doctor.model");
const DoctorWalletHistory = require("../../models/doctorWalletHistory.model");
const Notification = require("../../models/notification.model");

const moment = require("moment");
const admin = require("../../firebase");

exports.getAll = async (req, res, next) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    let status = req.query.status;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (status !== "ALL") {
      status = Number(status);
    }

    let matchQuery = {};
    if (status !== "ALL") {
      matchQuery = {
        status,
      };
    }
    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const [requests, total] = await Promise.all([
      WithdrawRequest.aggregate([
        {
          $addFields: {
            date: { $substr: ["$createdAt", 0, 10] },
          },
        },
        { $match: { ...matchQuery, ...dateFilter } },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  uniqueId: 1,
                  image: 1,
                  wallet: 1,
                },
              },
            ],
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            doctor: 1,
            amount: 1,
            createdAt: 1,
            status: 1,
            type: 1,
            payDate: 1,
            declineReason: 1,
            date: 1,
            paymentGateway: 1,
            paymentDetails: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]),
      WithdrawRequest.countDocuments(matchQuery),
    ]);

    return res.status(200).send({
      status: true,
      message: "Withdraw request fetch successfully",
      total,
      data: requests,
    });
  } catch (error) {
    console.log(error);
    return res.status({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.pay = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const request = await WithdrawRequest.findOne({
      _id: req.query.requestId,
      status: 1,
    }).populate({
      path: "doctor",
      select: "name image _id",
    });

    if (!request) {
      return res.status(200).send({ status: false, message: "withdraw request not found" });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { _id: request.doctor, wallet: { $gte: request.amount } }, // condition
      { $inc: { wallet: -request.amount } }, // deduction
      { new: true } // return updated doc
    );

    if (!doctor) {
      return res.status(200).send({
        status: false,
        message: "Doctor wallet balance is less than requested amount",
      });
    }

    request.status = 2;
    request.payDate = moment().format("YYYY-MM-DD");

    const payload = {
      token: doctor.fcmToken,
      notification: {
        title: "Woo , payment received",
        body: `You have received ${request.amount}. `,
      },
    };

    const adminPromise = await admin;
    if (doctor && doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.webFcmToken !== null) {
      try {
        const payload = {
          token: doctor.webFcmToken,
          notification: {
            title: "Woo , payment received",
            body: `You have received ${request.amount}. `,
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    await Promise.all([
      DoctorWalletHistory.create({
        amount: request.amount,
        doctor: doctor._id,
        type: 2,
      }),
      request.save(),
      doctor.save(),
      Notification.create({
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        stateType: 3,
        doctor: doctor._id,
      }),
    ]);

    return res.status(200).send({
      status: true,
      message: "Doctor paid successfully",
      data: request,
    });
  } catch (error) {
    console.log(error);
    return res.status({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.decline = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.reason) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const request = await WithdrawRequest.findOne({
      _id: req.query.requestId,
      status: 1,
    }).populate({
      path: "doctor",
      select: "name image _id",
    });

    if (!request) {
      return res.status(200).send({ status: false, message: "withdraw request not found" });
    }

    request.status = 3;
    request.declineReason = req.query.reason;

    const doctor = await Doctor.findById(request.doctor._id);
    if (!doctor) {
      return res.status(200).send({ status: false, message: "doctor not found" });
    }

    doctor.wallet += request.amount;

    const payload = {
      token: request.doctor.fcmToken,
      notification: {
        title: "Payment request declined",
        body: `Your payment request has been declined.Contact admin for further details.`,
      },
    };

    await Promise.all([
      request.save(),
      doctor.save(),
      Notification.create({
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        stateType: 4,
        doctor: doctor._id,
      }),
    ]);

    const adminPromise = await admin;
    if (request.doctor && request.doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (request.doctor && request.doctor.webFcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status(200).send({
      status: true,
      message: "doctor withdraw request declined by admin",
      data: request,
    });
  } catch (error) {
    console.log(error);
    return res.status({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};
