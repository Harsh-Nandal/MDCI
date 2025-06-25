const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads/contact');
const fs = require('fs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // creates uploads and contact folders if missing
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/contact');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


router.get('/admin-contact', contactController.getContactSection);
router.get('/contact', contactController.getAdminContactSection);
router.post('/admin-contact', upload.array('images'), contactController.postContactSection);

module.exports = router;
