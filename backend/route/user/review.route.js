const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/user/review.controller");
const checkAccess = require("../../middleware/checkAccess");

route.post('/postReview', checkAccess(), reviewController.postReview);
route.get(
    "/doctorReview",
    checkAccess(),
    reviewController.doctorReview
  );
  

module.exports = route;
