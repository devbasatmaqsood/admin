const express = require("express");
const route = express.Router();

const doctorController = require("../../controller/admin/doctor.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const checkAccess = require("../../middleware/checkAccess");

const upload = multer({
  storage,
});
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get("/",  doctorController.getAllDoctors);
route.get(
  "/getDoctorDropDown",
  
  doctorController.getDoctorDropDown
);

route.get("/profile",  doctorController.getDoctorDetails);

route.patch("/blockUnblock",  doctorController.blockUnblock);

route.patch("/delete",  doctorController.delete);

route.patch(
  "/updateProfile",
  
  upload.single("image"),
  doctorController.updateProfile
);

module.exports = route;
