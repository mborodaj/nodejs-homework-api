const multer = require('multer');
const path = require('path');
const { HttpCode } = require('./constants');

require('dotenv').config();

const UPLOAD_DIR = process.env.UPLOAD_DIR;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix.toString()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
            cb(null, true);
            return;
        };
        const error = new Error('Wrong format file avatar');
        error.status = HttpCode.BAD_REQUEST;
        cb(error);
    }
});


module.exports = upload;