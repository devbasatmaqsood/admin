//express
const express = require('express');
const route = express.Router();

const checkAccessWithSecretKey = require('../../middleware/checkAccess');

//Controller
const OTPController = require('../../controller/user/otp.controller');

//create OTP and send the email for password security
route.post('/sendOtp', checkAccessWithSecretKey(), OTPController.store);

//create otp when user login with email-password
route.post('/otpLogin', checkAccessWithSecretKey(), OTPController.otplogin);

//verify the OTP
route.post('/verifyOtp', checkAccessWithSecretKey(), OTPController.verify);

//create OTP and send the email for password security
route.post(
  '/sendOtpForEmailVerify',
  checkAccessWithSecretKey(),
  OTPController.sendOtpForEmailVerify
);

module.exports = route;
