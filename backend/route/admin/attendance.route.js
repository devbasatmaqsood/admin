const express = require('express');
const route = express.Router()
const attendanceController = require('../../controller/admin/attendance.controller')
const checkAccess = require('../../middleware/checkAccess')
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get('/', attendanceController.getAttendance);

module.exports = route
