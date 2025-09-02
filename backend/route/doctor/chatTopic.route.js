//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");


//controller
const ChatTopicController = require("../../controller/doctor/chatTopic.controller");

//get thumb list of chat between the users
route.get("/get", checkAccessWithSecretKey(), ChatTopicController.getChatList);



module.exports = route;
