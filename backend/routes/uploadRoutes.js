const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
});

router.post('/', upload.single('file'), (req, res) => {
  if (req.file) {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
  } else {
    res.status(400).send('No file uploaded');
  }
});

module.exports = router;
