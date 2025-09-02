const express = require("express");
const route = express.Router();

const couponController = require("../../controller/user/coupon.controller");
const checkAccess = require("../../middleware/checkAccess");



route.get("/get", checkAccess(), couponController.getCoupon);
route.get("/getDiscountAmount", checkAccess(), couponController.getDiscountAmount);

module.exports = route;
