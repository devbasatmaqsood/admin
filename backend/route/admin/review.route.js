const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/admin/review.controller");
const checkAccess = require("../../middleware/checkAccess");
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get('/getAll',  reviewController.getAll);
route.get(
    "/doctorReview",
    
    reviewController.doctorReview
  );
  
  route.delete(
    "/delete",
    
    reviewController.delete
  );

module.exports = route;
