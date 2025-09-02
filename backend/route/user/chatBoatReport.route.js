//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const ChatBoatReportController = require("../../controller/user/chatBoatReport.controller");

// Submit a report
route.post("/submitReport", checkAccessWithSecretKey(), ChatBoatReportController.submitReport);

module.exports = route;
