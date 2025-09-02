const express = require('express');
const route = express.Router()
const attendanceController = require('../../controller/doctor/attendance.controller')
const checkAccess = require('../../middleware/checkAccess')
route.post('/postAttendance', checkAccess() , attendanceController.postAttendance);
route.get('/get', checkAccess(), attendanceController.getAttendanceForDoctor);

module.exports = route
