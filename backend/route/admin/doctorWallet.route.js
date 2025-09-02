const express = require("express");
const route = express.Router();


const doctorWalletController = require('../../controller/admin/doctorWallet.controller')
const checkAccess = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get('/', doctorWalletController.getWalletHistory);


module.exports = route;