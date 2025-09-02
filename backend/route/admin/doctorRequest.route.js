const express = require("express");
const route = express.Router();

const requestController = require("../../controller/admin/doctorRequest.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const checkAccess = require('../../middleware/checkAccess')
const upload = multer({
    storage,
})
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess()); 

route.get("/",  requestController.getAll);

route.post('/accept',  requestController.acceptRequest);

route.post('/decline',  requestController.rejectRequest);

module.exports = route;
