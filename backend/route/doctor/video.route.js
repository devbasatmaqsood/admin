const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const videoController = require("../../controller/doctor/video.controller");

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

//upload video by doctor
route.post(
  "/uploadvideo",
  checkAccess(),
  upload.fields([
    { name: "videoImage", maxCount: 5 },
    { name: "videoUrl", maxCount: 5 },
  ]),
  videoController.uploadvideo
);

//get particular doctor's videos
route.get("/videosOfDoctor", checkAccess(), videoController.videosOfDoctor);

//get particular doctor's videos details
route.get("/detailsOfVideo", checkAccess(), videoController.detailsOfVideo);

//delete video by doctor
route.delete("/deleteVideo", checkAccess(), videoController.deleteVideo);

module.exports = route;
