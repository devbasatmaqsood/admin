const express = require('express');
const route = express.Router();

const checkAccess = require('../../middleware/checkAccess');
const appointmentController = require('../../controller/doctor/appointment.controller');

route.get('/get', checkAccess(), appointmentController.appointMentForDoctor);
route.get(
  '/typeStatusWise',
  checkAccess(),
  appointmentController.appointmentTypeStatusWise
);
route.put('/checkIn', checkAccess(), appointmentController.confirmAppointment);
route.put(
  '/checkOut',
  checkAccess(),
  appointmentController.completeAppointment
);
route.put('/cancel', checkAccess(), appointmentController.cancelAppointment);
route.patch(
  '/cancelAppointment',
  checkAccess(),
  appointmentController.cancelAppointment
);
route.get('/checkDate', checkAccess(), appointmentController.checkDates);
route.get(
  '/getAppointment',
  checkAccess(),
  appointmentController.getAppointment
);
route.get(
  '/upcomingBookings',
  checkAccess(),
  appointmentController.upcomingBookings
);
route.get(
  '/getAppointmentCountsByStatus',
  checkAccess(),
  appointmentController.getAppointmentCountsByStatus
);
route.get(
  '/nextAppointment',
  checkAccess(),
  appointmentController.nextAppointment
);

module.exports = route;
