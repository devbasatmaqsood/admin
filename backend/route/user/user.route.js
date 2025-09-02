const express = require("express");
const route = express.Router();

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});
const userController = require("../../controller/user/user.controller");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");

route.post("/checkUser", checkAccessWithSecretKey(), userController.checkUser);
// check user is signup or not with mobile
route.post("/checkUserMobile", checkAccessWithSecretKey(), userController.checkUserMobile);

route.post("/loginSignup", checkAccessWithSecretKey(), userController.loginSignup);
route.get("/profile", checkAccessWithSecretKey(), userController.getProfile);
route.patch("/update", upload.single("image"), checkAccessWithSecretKey(), userController.updateUser);

route.put("/delete", checkAccessWithSecretKey(), userController.deleteUser);
route.patch(
  "/setPassword",
  checkAccessWithSecretKey(),
  userController.setPassword
);


module.exports = route;
