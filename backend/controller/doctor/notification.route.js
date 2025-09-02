const express = require("express");
const route = express.Router();

const notificationController = require("../../controller/doctor/notification.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");



route.get('/getForDoctor', checkAccessWithSecretKey(), notificationController.getNotificationForDoctor)

module.exports = route;
