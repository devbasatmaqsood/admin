//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

//controller
const ChatBoatController = require("../../controller/user/chatBoat.controller");

//create data in chatBoat
route.post("/createChatBoat", checkAccessWithSecretKey(), ChatBoatController.createChatBoat);

//get old data of chatBoat
route.get("/getChatBoat", checkAccessWithSecretKey(), ChatBoatController.getChatBoat);

module.exports = route;
