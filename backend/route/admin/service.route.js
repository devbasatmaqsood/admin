const express = require("express");
const route = express.Router();

const serviceController = require("../../controller/admin/service.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccess = require("../../middleware/checkAccess");
const admin = require("../../middleware/admin");

route.use(admin);
route.use(checkAccess());

route.get("/", serviceController.getAll);
route.post("/create", upload.single("image"), serviceController.create);
route.patch("/update", upload.single("image"), serviceController.update);
route.patch("/delete", serviceController.delete);
route.patch("/status", serviceController.handleStatus);
route.get("/getAllForDropdown", serviceController.getAllForDropdown);

module.exports = route;
