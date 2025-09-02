const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
    storage,
});
const patientController = require("../../controller/user/subPatient.controller");
const checkAccess = require('../../middleware/checkAccess')

route.post("/add", upload.single("image"), checkAccess(), patientController.addSubPatient);
route.get("/",checkAccess(), patientController.get);


module.exports = route;
