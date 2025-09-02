const Coupon = require("../../models/coupon.model");
const User = require("../../models/user.model");
const Wallet = require("../../models/userWallet.model");
const moment = require("moment");

exports.getCoupon = async (req, res) => {
  try {
    const { userId } = req.query;
    const type = parseInt(req.query.type);
    const amount = parseInt(req.query.amount);

    if (!amount || !type || !userId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    const user = await User.findOne({
      _id: userId,
      isDelete: false,
    });

    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    const todayDate = moment().format("YYYY-MM-DD");

    const coupons = await Coupon.find({
      type: type,
      isActive: true,
      //minAmountToApply: { $lte: amount },
      //expiryDate: { $gte: todayDate },
      //user: { $nin: [userId] },
    });

    const updatedCoupons = coupons.map((coupon) => {
      const usedByUser = coupon.user.includes(userId);
      return {
        ...coupon.toObject(),
        expiryDate: moment(coupon.expiryDate).format("DD-MM-YYYY"),
        isValid: !usedByUser,
      };
    });

    return res.status(200).send({ status: true, data: updatedCoupons });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getDiscountAmount = async (req, res) => {
  try {
    const { userId, amount, couponId } = req.query;
    if (!userId || !amount || !couponId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const user = await User.findOne({
      _id: userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }
    const todayDate = moment().format("YYYY-MM-DD");

    let bonusAmount = 0;
    const coupon = await Coupon.findOne({
      _id: req.query.couponId,
      isActive: true,
      expiryDate: { $gte: todayDate },
      user: { $nin: [user._id] },
    });
    if (!coupon) {
      return res.status(200).send({
        status: false,
        message: "Coupon not found or invalid,retry with valid coupon or remove coupon",
      });
    }
    if (coupon.discountType == 1) {
      bonusAmount = coupon.maxDiscount;
    } else if (coupon.discountType == 2) {
      let amount = (parseInt(req.query.amount) * coupon.discountPercent) / 100;
      bonusAmount = amount > coupon.maxDiscount ? coupon.maxDiscount : amount;
    }
    return res.status(200).send({ status: true, message: "Success", data: bonusAmount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
