//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");


//controller
const ChatController = require("../../controller/user/chat.controller");

//create chat
route.post("/createChat", checkAccessWithSecretKey(), upload.single("image"), ChatController.createChat);

//get old chat between the users
route.get("/getOldChat", checkAccessWithSecretKey(), ChatController.getOldChatForUser);

route.post(
    "/createChatUser",
    checkAccessWithSecretKey(),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "audio", maxCount: 1 },
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),

    ChatController.createChatUser
);

route.post("/createZegotoken", checkAccessWithSecretKey(), ChatController.createZegotoken);

module.exports = route;
