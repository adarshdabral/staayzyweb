"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../utils/upload");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Allow owners and admins to upload images (owners upload property images)
router.post("/images", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), upload_1.upload.array("images", 10), uploadController_1.uploadImages);
exports.default = router;
//# sourceMappingURL=uploads.js.map