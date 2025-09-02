const express = require("express");
const route = express.Router();
const multer = require('multer');
const storage = require("./../../middleware/multer");
const notificationController = require("../../controller/admin/notification.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const upload = multer({
    storage,
  });
  

route.post('/toOneUser', checkAccessWithSecretKey(),upload.single('image'), notificationController.particularUserNotification)

route.post('/toDoctor', checkAccessWithSecretKey(), upload.single('image'),notificationController.particularDoctorNotification)

route.post('/notifyAllUsers', checkAccessWithSecretKey(), upload.single('image'),notificationController.allUserNotification)

module.exports = route;
