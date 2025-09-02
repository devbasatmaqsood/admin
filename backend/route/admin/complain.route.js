const express = require('express');
const route = express.Router();
const checkAccess = require('../../middleware/checkAccess');
const complainController = require('../../controller/admin/complain.controller.js')
const admin = require('../../middleware/admin');

route.use(admin);
route.use(checkAccess());

route.get('/get',  complainController.pendingSolvedComplains);
route.get('/suggestions',  complainController.suggestions);
route.put('/solveComplain',  complainController.solveComplain);
route.delete('/delete',  complainController.deleteComplain);


module.exports = route;