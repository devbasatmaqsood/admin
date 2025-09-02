//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({ storage });

const checkAccess = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());
//controller
const WithdrawController = require("../../controller/admin/withdraw.controller");

//store Withdraw
route.post("/create", upload.single("image"),  WithdrawController.store);

//update Withdraw
route.patch("/update", upload.single("image"),  WithdrawController.update);

//get Withdraw
route.get("/getMethods",  WithdrawController.getMethods);

//delete Withdraw
route.delete("/delete",  WithdrawController.delete);

//handle isActive switch
route.patch("/handleSwitch",  WithdrawController.handleSwitch);

module.exports = route;
