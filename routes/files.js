const express=require('express')
const route=express.Router()
const {uploadFiles}=require("../controllers/logic")

const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/'); // Specify the directory where files should be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // File naming convention
  }
});

// Create a multer instance
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 20 * 1024 * 1024  // 10 MB size limit
//   }
// });
// Use the upload middleware for handling file uploads
// route.post('/upload', upload.array('files'), uploadFiles);

route.post('/upload',uploadFiles)

module.exports=route