const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const suggestServiceController = require("../../controller/doctor/suggestedService.controller");


route.post("/create", checkAccess(), suggestServiceController.create);

module.exports = route;
