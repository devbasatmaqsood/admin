const express = require("express");
const route = express.Router();

const admin = require("./admin/index.route");
const user = require("./user/index");
const doctor = require("./doctor/index.route");

route.use("/admin", admin);
route.use("/user", user);
route.use("/doctor", doctor);

module.exports = route;
