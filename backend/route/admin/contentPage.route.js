const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('./../../middleware/multer');
const checkAccess = require('../../middleware/checkAccess');
const contentController = require('../../controller/admin/contentPage.controller');
const upload = multer({
  storage,
});

router.use(checkAccess());
router.post('/content', upload.single('icon'), contentController.create);
router.get('/content', contentController.getAll);
router.get('/:name', contentController.getByName);
router.patch('/content', upload.single('icon'), contentController.edit);
router.delete('/content', contentController.delete);

module.exports = router;
