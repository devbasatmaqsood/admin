const express = require("express");
const route = express.Router();


const checkAccess = require("../../middleware/checkAccess");
const requestController = require('../../controller/doctor/doctorRequest.controller')
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});


route.post('/create', checkAccess(), upload.single('image'), requestController.createRequest);
route.get('/getStatus', checkAccess(), requestController.getRequestStatus);


module.exports = route;