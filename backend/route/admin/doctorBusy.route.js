const express = require("express");
const route = express.Router();

const holidayController = require("../../controller/admin/doctorBusy.controller");
const checkAccess = require('../../middleware/checkAccess')
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get("/getHoliday",  holidayController.doctorHoliday);

route.delete("/delete",  holidayController.delete);


module.exports = route;
