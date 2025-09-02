const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const doctorController = require("../../controller/doctor/doctor.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

route.get("/checkDoctorRequestStatus", checkAccess(), doctorController.checkDoctorRequestStatus);
route.post("/login", checkAccess(), doctorController.login);
route.get("/profile", checkAccess(), doctorController.getDoctorDetails);
route.patch("/updateTime", checkAccess(), doctorController.updateTime);
route.patch("/updateProfile", checkAccess(), upload.single("image"), doctorController.updateProfile);
route.get("/getSchedule", checkAccess(), doctorController.getSchedule);
route.get("/stats", checkAccess(), doctorController.statsByType);
route.get("/weeklyStats", checkAccess(), doctorController.weeklyStats);
route.get("/recentAppointments", checkAccess(), doctorController.recentAppointments);
route.get("/weeklyDailyBreakdown", checkAccess(), doctorController.weeklyDailyBreakdown);

module.exports = route;
