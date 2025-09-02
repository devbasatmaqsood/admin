const express = require("express");
const route = express.Router();

const admin = require("../../middleware/admin");
const multer = require("multer");
const adminController = require("../../controller/admin/admin.controller");

const storage = require("../../middleware/multer");
const upload = multer({ storage });

route.post("/signUp", adminController.store);
route.post("/login", adminController.login);
route.get("/profile", admin, adminController.getProfile);
route.patch("/update", admin, upload.single("image"), adminController.update);
route.put("/updatePassword", admin, adminController.updateAdminPassword);

module.exports = route;
