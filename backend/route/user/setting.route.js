const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');;
const settingController = require('../../controller/user/setting.controller')
const checkAccess = require('../../middleware/checkAccess')
route.get('/get', checkAccess(), settingController.get);



module.exports = route;