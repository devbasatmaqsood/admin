const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const appointmentController = require("../../controller/admin/appointment.controller");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get("/get", checkAccess(), appointmentController.getAppointMent);

route.get("/getParticularDoctor",  appointmentController.getParticularDoctor);

route.get("/getParticularUser",  appointmentController.getParticularUser);

route.get("/dailyAppointments",  appointmentController.dailyAppointments);

route.get("/monthlyState",  appointmentController.monthlyState);

route.patch("/cancelAppointment",  appointmentController.cancelAppointment);

module.exports = route;
