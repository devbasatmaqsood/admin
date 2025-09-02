//express
const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");

//controller
const WithdrawController = require("../../controller/doctor/withdraw.controller");

//get Withdraw for doctor
route.get("/getWithdrawMethods", checkAccess(), WithdrawController.getWithdrawMethods);

module.exports = route;
