const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const couponController = require("../../controller/admin/coupon.controller");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.post("/create", couponController.create);
route.put("/active", couponController.activeInactive);
route.delete("/delete",  couponController.delete);
route.get("/get",  couponController.getCoupon);



module.exports = route;
