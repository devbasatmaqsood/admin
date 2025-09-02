const express = require("express");
const route = express.Router();


const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const notifyController = require('../../controller/doctor/notification.controller')


route.get('/get', checkAccessWithSecretKey(), notifyController.getNotificationForDoctor)

module.exports = route;
