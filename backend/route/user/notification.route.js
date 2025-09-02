const express = require("express");
const route = express.Router();

const notificationController = require("../../controller/user/notification.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");



route.get('/get', checkAccessWithSecretKey(), notificationController.getNotificationForUser)

module.exports = route;
