const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const videoController = require("../../controller/user/video.controller");

//get particular doctor's videos
route.get("/doctorVideos", checkAccess(), videoController.doctorVideos);

//like or dislike of particular video by the particular user
route.post("/likeOrDislikeOfVideo", checkAccess(), videoController.likeOrDislikeOfVideo);

//when user share the video then shareCount of the particular video increased
route.post("/shareCountOfVideo", checkAccess(), videoController.shareCountOfVideo);

//create comment of particular video  by user
route.post("/commentOfVideo", checkAccess(), videoController.commentOfVideo);

//when user view the video create watchHistory of the particular video
route.post("/createWatchHistory", checkAccess(), videoController.createWatchHistory);

//get all comments for particular video by user or doctor
route.get("/getvideoComments", checkAccess(), videoController.getvideoComments);

module.exports = route;
