const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const dashboardController = require("../../controller/admin/dashboard.controller");

const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get("/allStats",  dashboardController.allStats);
route.get("/chart",  dashboardController.chartApiForPenal);
route.get("/topDoctors",  dashboardController.topDoctors);
route.get("/upcomingBookings",  dashboardController.upcomingBookings);

module.exports = route;
