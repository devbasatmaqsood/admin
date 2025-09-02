const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const requestController = require("../../controller/admin/withdrawRequest.controller");
const admin = require("../../middleware/admin");

route.use(admin);
route.use(checkAccess());

route.get("/getAll", requestController.getAll);

route.patch("/pay", requestController.pay);

route.patch("/decline", requestController.decline);

module.exports = route;
