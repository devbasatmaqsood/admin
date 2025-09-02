const express = require("express");
const route = express.Router();

const storage = require("./../../middleware/multer");
const multer = require("multer");

const upload = multer({
  storage,
});
const appointmentController = require("../../controller/user/appointment.controller");
const checkAccess = require("../../middleware/checkAccess");

// check date for booking is this day is available for booking or not
route.get("/checkDate", checkAccess(), appointmentController.checkDates);

// book a new appointment
route.post("/newAppointment", checkAccess(), upload.fields([{ name: "image", maxCount: 10 }]), appointmentController.bookAppointment);

// reschedule appointment
route.patch("/rescheduleAppointment", checkAccess(), appointmentController.rescheduleAppointment);

// cancel appointment
route.patch("/cancelAppointment", checkAccess(), appointmentController.cancelAppointment);

//  check is there any pending appointment with particular doctor or not yet
// if have any then only allow user to call from app side
route.get("/isCallEnableForUser", checkAccess(), appointmentController.isCallEnableForUser);

// get tax from setting
route.get("/getTax", checkAccess(), appointmentController.getTax);

// get appointment info from id
route.get("/getAppointment", checkAccess(), appointmentController.getAppointment);

// get all user appointment status wise with analytics
route.get("/getUserAppointment", checkAccess(), appointmentController.getParticularUser);

route.get("/getAppointmentCountsByStatus", checkAccess(), appointmentController.getAppointmentCountsByStatus);

route.post("/createStripeAppointment", checkAccess(), appointmentController.createStripeAppointment);

module.exports = route;
