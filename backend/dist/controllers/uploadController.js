"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Upload images (multipart/form-data) and return array of URLs
const uploadImages = async (req, res) => {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded", error: "no_files" });
        }
        // Validate file buffers are present (memoryStorage expected)
        for (const file of files) {
            if (!file || (!file.buffer && !file.stream && !file.path)) {
                return res.status(400).json({ message: "Uploaded file is invalid", error: "invalid_file" });
            }
        }
        // Upload each file buffer to Cloudinary as data URI to avoid extra deps
        const uploadResults = [];
        for (const file of files) {
            try {
                const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
                const result = await cloudinary_1.default.uploader.upload(dataUri, { folder: "staayzy" });
                uploadResults.push(result);
            }
            catch (err) {
                const msg = err?.message || err?.toString() || "Unknown upload error";
                console.error("Upload failed for file:", file.originalname, msg);
                // Classify Cloudinary auth errors as 401
                if (msg.toLowerCase().includes("api_key") || msg.toLowerCase().includes("invalid api_key") || err?.http_code === 401) {
                    return res.status(401).json({ message: "Failed to upload images", error: msg });
                }
                // Otherwise return a 500 (external service failure)
                return res.status(500).json({ message: "Failed to upload images", error: msg });
            }
        }
        const urls = uploadResults.map((r) => r.secure_url || r.url);
        return res.json({ urls });
    }
    catch (error) {
        console.error("Upload images error:", error);
        const errMsg = error?.message || "Unknown error";
        // If cloudinary config validation threw, surface as 401 (auth)
        if (errMsg.toLowerCase().includes("cloudinary") && errMsg.toLowerCase().includes("missing")) {
            return res.status(401).json({ message: "Failed to upload images", error: errMsg });
        }
        // If it's an obvious auth error
        if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("invalid api_key")) {
            return res.status(401).json({ message: "Failed to upload images", error: errMsg });
        }
        res.status(500).json({ message: "Failed to upload images", error: errMsg });
    }
};
exports.uploadImages = uploadImages;
exports.default = { uploadImages: exports.uploadImages };
//# sourceMappingURL=uploadController.js.map