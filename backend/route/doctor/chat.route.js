//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const ChatController = require("../../controller/doctor/chat.controller");

//create chat
route.post(
  "/createChat",
  checkAccessWithSecretKey(),
  upload.single("image"),
  ChatController.createChat
);

//get old chat between the users
route.get(
  "/getOldChat",
  checkAccessWithSecretKey(),
  ChatController.getOldChatForDoctor
);

route.post(
  "/createChatDoctor",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),

  ChatController.createChatDoctor
);

module.exports = route;
