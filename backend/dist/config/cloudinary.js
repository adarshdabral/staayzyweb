"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate Cloudinary configuration at startup to fail-fast if creds are missing
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const looksInvalid = (v) => {
    if (!v)
        return true;
    const s = v.trim();
    // Empty or angle-bracket placeholders like <FOO>
    if (s === "" || s.includes("<") || s.includes(">"))
        return true;
    // Common literal markers from examples
    if (s.toLowerCase().includes("replace") || s.toLowerCase().includes("example"))
        return true;
    return false;
};
if (looksInvalid(CLOUD_NAME) || looksInvalid(API_KEY) || looksInvalid(API_SECRET)) {
    throw new Error("Cloudinary configuration is missing or uses placeholder values. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET as environment variables.");
}
cloudinary_1.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map