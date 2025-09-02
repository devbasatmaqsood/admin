const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');

const userWalletController = require('../../controller/admin/userWallet.controller')
const checkAccess = require("../../middleware/checkAccess");

route.use(admin);
route.use(checkAccess());

route.get('/get', checkAccess(), userWalletController.getWalletHistory);
route.get('/getRechargeHistory', checkAccess(), userWalletController.allRechargeHistory);


module.exports = route;