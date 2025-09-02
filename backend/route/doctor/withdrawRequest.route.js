const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const requestController = require("../../controller/doctor/withdrawRequest.controller");

route.post("/create", checkAccessWithSecretKey(), requestController.createWithdrawRequest);
route.get("/get", checkAccessWithSecretKey(), requestController.get);

module.exports = route;
