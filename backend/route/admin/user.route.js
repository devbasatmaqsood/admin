const express = require("express");
const route = express.Router();


const userController = require('../../controller/admin/user.controller')
const checkAccess = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get('/getAll',  userController.getAllUsers);
route.get('/profile',   userController.getProfile);
route.put('/blockUnblock', userController.userBlock);

module.exports = route;