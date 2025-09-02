const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const doctorWithdrawMethodController = require("../../controller/doctor/doctorWithdrawMethod.controller");

//update payment method details by doctor
route.post("/updateDetailsOfPaymentMethods", checkAccess(), doctorWithdrawMethodController.updateDetailsOfPaymentMethods);

//get payment method details of the doctor
route.get("/getDetailsOfPaymentMethods", checkAccess(), doctorWithdrawMethodController.getDetailsOfPaymentMethods);

module.exports = route;
