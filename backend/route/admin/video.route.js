const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const videoController = require("../../controller/admin/video.controller");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());
//get particular doctor's videos
route.get("/doctorVideosByadmin",  videoController.doctorVideosByadmin);

//delete video by admin
route.delete("/deleteVideoByadmin",  videoController.deleteVideoByadmin);

//get all comments for particular video by admin
route.get("/videoComments",  videoController.videoComments);

//delete video comment by admin
route.delete("/deleteVideoComment",  videoController.deleteVideoComment);

module.exports = route;
