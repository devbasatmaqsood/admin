const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("./../../middleware/multer");
const checkAccess = require("../../middleware/checkAccess");
const bannerController = require("../../controller/admin/banner.controller");
const upload = multer({
  storage,
});

const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.post(
  "/create",
  upload.single("image"),

  bannerController.create
);


route.patch(
  "/update",
  upload.single("image"),

  bannerController.update
);

route.get("/getAll", bannerController.getAll);

route.put(
  "/isActive",

  bannerController.isActive
);
route.delete(
  "/delete",

  bannerController.deleteBanner
);
module.exports = route;
