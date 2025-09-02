const express = require('express');
const route = express.Router();

const doctorController = require('../../controller/user/doctor.controller');
const checkAccess = require('../../middleware/checkAccess');

route.get(
  '/getFilteredDoctors',
  checkAccess(),
  doctorController.getFilteredDoctors
);
route.post('/filter', checkAccess(), doctorController.getFilteredDoctorsForWeb);
route.get(
  '/getDoctorsWithSavedStatus',
  checkAccess(),
  doctorController.getDoctorsWithSavedStatus
);
route.get(
  '/getDoctorsServiceWise',
  checkAccess(),
  doctorController.getDoctorsServiceWise
);
route.get('/getDoctors', checkAccess(), doctorController.getDoctors);
route.get('/saveDoctor', checkAccess(), doctorController.saveDoctor);
route.get('/searchDoctors', checkAccess(), doctorController.searchDoctors);
route.get('/allSavedDoctors', checkAccess(), doctorController.allSavedDoctors);
route.get('/doctorProfile', checkAccess(), doctorController.getDoctorDetails);
route.get(
  '/serviceWiseDoctor',
  checkAccess(),
  doctorController.serviceWiseDoctor
);

module.exports = route;
