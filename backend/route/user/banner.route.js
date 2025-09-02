const express = require("express");
const route = express.Router();
const bannerController = require("../../controller/user/banner.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");


route.get("/getAll", checkAccessWithSecretKey(), bannerController.getAll);

module.exports = route;