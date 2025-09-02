const Coupon = require("../../models/coupon.model");
const voucher_codes = require("voucher-code-generator");
const moment = require('moment')



// generate new coupon
exports.create = async (req, res) => {
  try {
    const {
      expiryDate,
      discountPercent,
      minAmountToApply,
      type,
      discountType,
      maxDiscount,
      description,
      title,
      prefix
    } = req.body;
    if (
      !expiryDate ||
      !minAmountToApply ||
      !type ||
      !discountType ||
      !description ||
      !title ||
      !maxDiscount ||
      !prefix
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    if (discountType == 2 && (!discountPercent)) {
      return res.status(200).send({
        status: false,
        message:
          "maxDiscount and discount percent required when you choose discount type as percent",
      });
    }

    const coupon = await new Coupon({
      expiryDate: moment(expiryDate).format("YYYY-MM-DD"),
      discountPercent,
      maxDiscount,
      minAmountToApply,
      type,
      discountType,
      maxDiscount: maxDiscount && maxDiscount,
      title,
      description,
    });

    const code = voucher_codes.generate({
      length: 8,
      prefix: prefix,
    });

    coupon.code = code[0].toUpperCase();

    await coupon.save();
    return res.status(200).send({
      status: true,
      message: "Coupon generate successfully",
      data: coupon,
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};


// active and inactive coupon for app
exports.activeInactive = async (req, res) => {
  try {
    if (!req.query.couponId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const coupon = await Coupon.findById(req.query.couponId);
    if (!coupon) {
      return res
        .status(200)
        .send({ status: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return res.status(200).send({
      status: true,
      message: "Coupon update successfully",
      data: coupon,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};


// delete coupon
exports.delete = async (req, res) => {
  try {
    if (!req.query.couponId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const coupon = await Coupon.findById(req.query.couponId);
    if (!coupon) {
      return res
        .status(200)
        .send({ status: false, message: "Coupon not found" });
    }
    await Coupon.deleteOne({ _id: req.query.couponId });
    return res
      .status(200)
      .send({ status: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

// get all coupon
exports.getCoupon = async (req,res) =>{
  try {
    const coupon = await Coupon.find().sort({createdAt:-1}).lean();
    return res.status(200).send({
      status: true,
      data: coupon
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
}