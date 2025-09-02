const express = require('express');
const route = express.Router();

const checkAccess = require('../../middleware/checkAccess');
const historyController = require('../../controller/doctor/doctorWalletHistory.controller');

route.get('/get', checkAccess(), historyController.get);
route.get('/getHistory', checkAccess(), historyController.getForWeb);

module.exports = route;
