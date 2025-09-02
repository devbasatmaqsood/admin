const express = require('express');
const route = express.Router();
const checkAccess = require('../../middleware/checkAccess');
const complainController = require('../../controller/doctor/complain.controller.js');
const multer = require('multer');
const storage = require('../../middleware/multer');
const upload = multer({
  storage,
});
route.post(
  '/raiseComplain',
  checkAccess(),
  upload.single('image'),
  complainController.raiseComplain
);

route.get('/get', checkAccess(), complainController.pendingSolvedComplains);
route.get('/suggestions', checkAccess(), complainController.suggestions);

module.exports = route;
