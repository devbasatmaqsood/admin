const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const suggestServiceController = require("../../controller/admin/suggestedService.controller");

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get("/",suggestServiceController.getAll);
route.post("/accept",upload.single('image'), suggestServiceController.accept);
route.delete("/decline",suggestServiceController.decline);

module.exports = route;
