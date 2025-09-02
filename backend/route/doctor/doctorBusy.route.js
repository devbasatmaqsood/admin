const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const doctorBusyController = require("../../controller/doctor/doctorBusy.controller");


route.post("/", checkAccess(), doctorBusyController.busyDoctor);
route.post("/addHoliday", checkAccess(), doctorBusyController.addHoliday);
// delete holiday by doctor
route.delete("/removeHoliday", checkAccess(), doctorBusyController.removeHoliday);

module.exports = route;
