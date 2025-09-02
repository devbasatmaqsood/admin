const express = require('express');
const route = express.Router();
const checkAccessWithSecretKey = require('../../middleware/checkAccess');
const complainController = require('../../controller/user/complain.controller.js')
const multer = require("multer");

const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});
route.post('/raiseComplain', checkAccessWithSecretKey(),upload.single('image'), complainController.raiseComplain);

route.get('/get', checkAccessWithSecretKey(), complainController.pendingSolvedComplains);

route.get('/suggestion', checkAccessWithSecretKey(), complainController.getSuggestions);



module.exports = route;