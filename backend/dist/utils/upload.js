"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Use memory storage for multer. Controllers can read file buffers from req.file.buffer
// and upload to Cloudinary using cloudinary.uploader.upload_stream if needed.
const storage = multer_1.default.memoryStorage();
const allowedMimetypes = [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
];
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for videos
    },
    fileFilter: (req, file, cb) => {
        if (allowedMimetypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image and video files are allowed"));
        }
    },
});
//# sourceMappingURL=upload.js.map