const express = require("express");
const route = express.Router();

const admin = require("../../middleware/admin");
const settingController = require("../../controller/admin/setting.controller");
const checkAccess = require("../../middleware/checkAccess");

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

// route.use(admin);
route.use(checkAccess());

route.get("/", admin, settingController.get);
route.patch("/update", admin, settingController.update);
route.put("/handleSwitch", admin, settingController.handleSwitch);
route.patch("/updateCompanyLogo", admin, upload.single("companyLogo"), settingController.updateCompanyLogo);
route.get("/retrieveFooterSettings", settingController.retrieveFooterSettings);

module.exports = route;
