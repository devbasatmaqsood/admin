const User = require("../../models/user.model");
const Wallet = require("../../models/userWallet.model");
const History = require("../../models/userWalletHistory.model");

exports.getWalletHistory = async (req, res) => {
  try {
    const { userId, type } = req.query;
    if (!userId || !type) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }

    const [wallet] = await Promise.all([Wallet.findOne({ user: user._id })]);

    let history;
    if (type !== "ALL") {
      history = await History.find({
        ...dateFilter,
        user: user._id,
        type: type,
      }).sort({ createdAt: -1 }).populate('appointment','appointmentId');
    } else {
      history = await History.find({
        ...dateFilter,
        user: user._id,
      }).sort({ createdAt: -1 }).populate('appointment', 'appointmentId');
    }
    if (!wallet) {
      return res
        .status(200)
        .send({ status: false, message: "User wallet details not found" });
    }
    return res.status(200).send({
      status: true,
      message: "Success",
      data: wallet,
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.allRechargeHistory = async (req, res) => {
  try {
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: req.query.startDate,
          $lte: req.query.endDate,
        },
      };
    }
    const [history, total] = await Promise.all([
      History.find({ ...dateFilter, type: 1 })
        .sort({ createdAt: -1 })
        .populate("user", "name email _id")
        .populate("appointment", "_id appointmentId ").lean(),
      History.countDocuments({ ...dateFilter, type: 1 }),
    ]);

    return res.status(200).send({
      status: true,
      message: "Success",
      total,
      data: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
